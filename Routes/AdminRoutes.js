import express from "express";
import PDFDocument from 'pdfkit';
import con from "../utils/db.js";
import formatDateToDMY from "../utils/formatDate.js";
import fs from 'fs';
const router = express.Router(); 

// Route to view all attendances ...
router.get('/ViewAllAttendances', (req, res) => {
    try {
        // const sql = `SELECT * FROM attendance INNER JOIN employee ON attendance.EmployeeID = employee.EmployeeID`;
        const sql = `SELECT 
                        LPAD(ROW_NUMBER() OVER (ORDER BY employee.EmployeeID), 2, '0') AS RowNumber,
                        employee.EmployeeID,
                        employee.name, 
                        employee.email, 
                        DATE(attendance.date) AS date,
                        CASE
                            WHEN HOUR(attendance.date) BETWEEN 8 AND 9 AND MINUTE(attendance.date) BETWEEN 0 AND 59 THEN 'Attended'
                            WHEN HOUR(attendance.date) BETWEEN 9 AND 17 AND MINUTE(attendance.date) BETWEEN 0 AND 59 THEN 'Late Attended'
                            ELSE 'Not Attended'
                        END AS status
                    FROM 
                        attendance 
                    INNER JOIN 
                        employee 
                    ON 
                        attendance.EmployeeID = employee.EmployeeID`;
        con.query(sql, (err, data) => {
        if(err) return res.json(err);
            return res.json(data);
        });
    } catch (err) {
        console.log(err);
    }
});

// Route to search the attendance ...
router.get('/attendance/:input', (req, res) => {
    try {
        const input = req.params.input;
        const sql = `SELECT 
                                LPAD(ROW_NUMBER() OVER (ORDER BY employee.EmployeeID), 2, '0') AS RowNumber,
                                employee.EmployeeID,
                                employee.name, 
                                employee.email, 
                                DATE(attendance.date) AS date,
                                CASE
                                    WHEN HOUR(attendance.date) BETWEEN 8 AND 9 AND MINUTE(attendance.date) BETWEEN 0 AND 59 THEN 'Attended'
                                    ELSE 'Not Attended'
                                END AS status
                            FROM 
                                attendance 
                            INNER JOIN 
                                employee 
                            ON 
                                attendance.EmployeeID = employee.EmployeeID 
                            WHERE 
                                (employee.name LIKE CONCAT(?, '%')  -- Matches names starting with the entered text
                                OR employee.email LIKE CONCAT(?, '%')  -- Matches emails starting with the entered text
                                OR DATE(attendance.date) LIKE CONCAT(?, '%'))  -- Matches dates starting with the entered text`;
        con.query(sql, [input], (err, data) => {
            if(err) return res.json(err);
            return res.json(data);
        });
    } catch(error) {
        console.log(error);
    }
});  

// Route to sort attendances according to entered date ...
router.get('/sortAttendance/:date', (req, res) => {
    try {
        const date = req.params.date;
        const sql1 = `SELECT attendance.*, employee.*
            FROM attendance 
            INNER JOIN employee ON attendance.EmployeeID = employee.EmployeeID
            WHERE DATE(attendance.Date) = ?`;
        
        const sql2 = `SELECT attendance.*, employee.*
            FROM attendance 
            INNER JOIN employee ON attendance.EmployeeID = employee.EmployeeID
            WHERE DATE(attendance.Date) != ?
            ORDER BY 3 DESC`;

        con.query(sql1, [date], (err, data1) => {
            if(err) return res.json(err);
            // return res.json(data);
            console.log(data1);
            con.query(sql2, [date], (err, data2) => {
                if (err) return res.json(err);
                // console.log(data2);
                // Combine results from both queries
                const combinedResults = [...data1, ...data2];
                // console.log(combinedResults);
                return res.json(combinedResults);
            });
        });
    } catch(error) {
        console.log(error);
    }
}); 

// Route to reset data in the table and database ...
router.get('/resetData', (req, res) => {
    try {
        const sql = `DELETE FROM attendance`;
        con.query(sql, (err, data) => {
            if(err) return res.json(err);
            return res.send({message: 'Both Table and Database Data Deleted', data:data});
        });
    } catch(error) {
        console.log(error);
    }
}); 

// Route to generate a pdf file ... Not Completed ...
router.get('/generatePDF', (req, res) => {
    // console.log(req);
    try {
        const sql = `SELECT 
                    LPAD(ROW_NUMBER() OVER (ORDER BY employee.EmployeeID), 2, '0') AS RowNumber,
                    employee.name, 
                    employee.email, 
                    DATE(attendance.date) AS date,
                    CASE
                        WHEN HOUR(attendance.date) BETWEEN 8 AND 9 AND MINUTE(attendance.date) BETWEEN 0 AND 59 THEN 'Attended'
                        ELSE 'Not Attended'
                    END AS status
                FROM 
                    attendance 
                INNER JOIN 
                    employee 
                ON 
                    attendance.EmployeeID = employee.EmployeeID`;
        con.query(sql, (error, result) => {
            if (error) return res.status(500).json({ message: error });
            //return res.status(200).json({ message: 'Relevant Data', data: result });

            // Create a new PDF Document ...
            const doc = new PDFDocument();
            const fileName = `Attendance report-${Date.now()}.pdf`;
            const filePath = `./${fileName}`;

            // Pipe the PDF to a file ...
            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);

            // Add Title ...
            doc.font('Helvetica-Bold').fontSize(20).text(`Employee Attendance Report - ${formatDateToDMY(new Date(Date.now()))}`, { align: 'center' });
            doc.moveDown();

            if (result.length === 0) {
                doc.font('Helvetica-Bold').fontSize(18).fillColor('#000000').text('No attendance records found.', { align: 'center' });
            } else {
                // Define the table structure ...
                const tableHeaders = ['No.', 'Name', 'Date', 'Email', 'Status'];
                const columnWidths = [50, 130, 100, 130, 100]; // Custom column widths
                const tableRows = result.map(item => [
                    item.RowNumber,
                    item.name,
                    formatDateToDMY(new Date(item.date)),
                    item.email,
                    item.status
                ]);

                // Calculate initial X position for each column ...
                const startX = 50; // Starting point on X-axis ...
                let currentX;

                // Draw table headers with styling ...
                let y = 100;
                currentX = startX;
                tableHeaders.forEach((header, i) => {
                    // Draw the header border ...
                    doc.rect(currentX, y, columnWidths[i], 20).stroke();
                    doc.font('Helvetica-Bold').fontSize(12).fillColor('#000000').text(header, currentX + 5, y + 5, { width: columnWidths[i], align: 'center' });
                    currentX += columnWidths[i]; // Move to the next column ...
                });
                y += 20;

                // Draw table rows with borders ...
                tableRows.forEach(row => {
                    currentX = startX; // Reset to start of row ...
                    row.forEach((cell, i) => {
                        // Draw the cell border
                        doc.rect(currentX, y, columnWidths[i], 20).stroke();

                        // Apply different styles for each column if needed ...
                        const cellTextColor = i === 4 && cell === 'Attended' ? '#27AE60' : i === 4 && cell === 'Not Attended' ? '#E74C3C' : '#000000';
                        doc.fontSize(10).fillColor(cellTextColor).text(cell.toString(), currentX + 5, y + 5, { width: columnWidths[i], align: 'center' });
                        
                        currentX += columnWidths[i]; // Move to the next column ...
                    });
                    y += 20; // Move to the next row ...
                });
            } 
            
            // Finalize the document and send response ...
            doc.end();
            stream.on('finish', () => {
                res.download(filePath, fileName, (error) => {
                    if (error) console.error(error);
                    fs.unlinkSync(filePath); // Clean up the file after download ...
                });
            });
        });
    } catch (error) {
        res.status(500).send({ message: error });
    }
});

export default router;