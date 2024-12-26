import express from "express";
import PDFDocument from 'pdfkit';
import con from "../utils/db.js";
import { formatDateToDMY } from "../utils/formatDate.js";
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
router.get('/attendance/:date', (req, res) => {
    try {
        const date = req.params.date;
        const sql = `SELECT * FROM attendance 
                    INNER JOIN employee 
                    ON attendance.EmployeeID = employee.EmployeeID 
                    WHERE DATE(attendance.date) = ?`;
        con.query(sql, [date], (err, data) => {
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

// Route to get all the employees ...
router.get("/employees", (req, res) => {
    const sql = "SELECT * FROM employee";
    con.query(sql, (err, data) => {
        if (err) {
            console.error("Error executing query:", err.message);
            return res.status(500).json({ error: "Database query failed" });
        }
        console.log("Query successful, sending data:", data);
        return res.json(data);
    });
}); 

// Route to get an employee by ID ...
router.get("/employee/:EmployeeID", (req, res) => {
    const sql = "SELECT * FROM employee WHERE EmployeeID = ?";
    const EmployeeID = req.params.EmployeeID;

    con.query(sql, [EmployeeID], (err, data) => {
        if (err) {
            console.error("Error fetching employee:", err.message);
            return res.status(500).json({ error: "Database query failed" });
        }
        if (data.length === 0) {
            return res.status(404).json({ message: "Employee not found" });
        }
        return res.json(data[0]);  // Return a single employee object
    });
});

// Route to register a new employee ...
router.post("/register", (req, res) => {
    const sql = "INSERT INTO employee (`Name`, `Address`, `ContactNumber`, `Designation`, `Workstartdate`, `Email`, `Username`, `Password`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    const values = [
        req.body.Name,
        req.body.Address,
        req.body.ContactNumber,
        req.body.Designation,
        req.body.Workstartdate,
        req.body.Email,
        req.body.Username,
        req.body.Password
    ];

    con.query(sql, values, (err, data) => {
        if (err) {
            console.error("Error inserting data:", err.message);
            return res.status(500).json({ error: "Error inserting data into database", details: err.message });
        }
        return res.status(201).json({ message: "Employee added successfully", data });
    });
}); 

// Route to update an existing employee ...
router.put("/update/:EmployeeID", (req, res) => {
    const sql = "UPDATE employee SET `Name` = ?, `Address` = ?, `ContactNumber` = ?, `Designation` = ?, `Workstartdate` = ?, `Email` = ?, `Username` = ?, `Password` = ? WHERE `EmployeeID` = ?";
    const values = [
        req.body.Name,
        req.body.Address,
        req.body.ContactNumber,
        req.body.Designation,
        req.body.Workstartdate,
        req.body.Email,
        req.body.Username,
        req.body.Password
    ];

    const EmployeeID = req.params.EmployeeID;

    con.query(sql, [...values, EmployeeID], (err, data) => {
        if (err) {
            console.error("Error updating data:", err.message);
            return res.status(500).json({ error: "Error updating data", details: err.message });
        }
        return res.status(200).json({ message: "Employee updated successfully", data });
    });
});

// Route to delete an employee ...
router.delete("/employee/:EmployeeID", (req, res) => {
    const sql = "DELETE FROM employee WHERE EmployeeID = ?";
    const EmployeeID = req.params.EmployeeID;

    con.query(sql, [EmployeeID], (err, result) => {
        if (err) {
            console.error("Error deleting employee:", err.message);
            return res.status(500).json({
                error: "Error deleting employee from database",
                details: err.message
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Employee not found" });
        }

        return res.status(200).json({ message: "Employee deleted successfully" });
    });
});

export default router;
