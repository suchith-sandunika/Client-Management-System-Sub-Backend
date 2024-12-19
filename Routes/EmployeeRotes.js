import express from "express";
import con from "../utils/db.js";
const router = express.Router(); 
import { isDDMMYYYYWithDash, isYYYYMMDD } from "../utils/formatDate.js";

// Route to view all employees ...
router.get('/ViewAllEmployees', (req, res) => {
    try {
        const sql = `SELECT * FROM employee`;
        con.query(sql, (err, data) => {
            if(err) return res.json(err);
            return res.json(data);
        });
    } catch(error) {
        console.log(error);
    }
});   

// Route to view all attendances ...
router.get('/ViewAllAttendances', (req, res) => {
    try {
        const sql = `SELECT 
                        ROW_NUMBER() OVER (ORDER BY employee.EmployeeID) AS RowNumber,
                        employee.EmployeeID,
                        employee.name, 
                        employee.email, 
                        DATE(attendance.date) AS date,
                        TIME(attendance.date) AS time, -- Updated to show proper time field
                        CASE
                            WHEN HOUR(attendance.date) BETWEEN 8 AND 9 AND MINUTE(attendance.date) BETWEEN 0 AND 59 THEN 'Attended'
                            WHEN HOUR(attendance.date) BETWEEN 9 AND 17 THEN 'Late Attended'
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

// Route to get employee information trough input ...
router.get('/viewEmployees/:input', (req, res) => {
    try {
        const input = req.params.input;
        const sql = `SELECT * FROM employee WHERE name = ? OR email = ?`;
        con.query(sql, [input, input], (err, data) => {
            if(err) return res.json(err);
            return res.json(data);
        });
    } catch (error) {
        console.log(error);
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
                        TIME(attendance.date) AS time, -- Added proper time display
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

        if (isDDMMYYYYWithDash(input)) {
            const [day, month, year] = input.split('-');
            const formattedDate = `${year}-${month}-${day}`;
            con.query(sql, [formattedDate, formattedDate, formattedDate], (err, data) => {
                if (err) return res.json(err);
                return res.json(data);
            });
        } else if (isYYYYMMDD(input)) {
            con.query(sql, [input, input, input], (err, data) => {
                if (err) return res.json(err);
                return res.json(data);
            });
        } else {
            con.query(sql, [input, input, input], (err, data) => {
                if(err) return res.json(err);
                return res.json(data);
            });
        }
    } catch(error) {
        console.log(error);
    }
}); 

// Route to add new attendance record ...
router.post('/addAttendance', (req, res) => {
    try {
        const { name, date, email } = req.body;

        const current_date = new Date();
        const hour = current_date.getHours();
        const minute = current_date.getMinutes();
        const second = current_date.getSeconds();

        // Concatenate the `date` with the current time in HH:mm:ss format ...
        const fullDateTime = `${date} ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`;
        console.log(name, date, email, hour, minute, second, fullDateTime);

        // check whether the user is already existing ...
        const sql1 = `SELECT EmployeeID FROM employee WHERE Name = ? AND Email = ?`;
        con.query(sql1, [name, email], (err, result) => {
            if(err) return res.json(err);
            // Check result length ...
            if(result.length === 0) {
                return res.json({ message: "Employee not found!"});
            }
            console.log(result.length);
            console.log(result[0]);
            console.log(result[0].EmployeeID);
            const EmployeeId = result[0].EmployeeID;
            console.log("EmployeeId : ", EmployeeId);
            if(hour >= 8 && hour < 17) {
                // Validate working hours properly
                const sql2 = `INSERT INTO attendance (EmployeeId, date) VALUES (?, ?)`;
                con.query(sql2, [EmployeeId, fullDateTime], (err, data) => {
                    if(err) return res.json(err);
                    return res.json({ message: "Attendance added successfully!", data: data });
                });
            } else {
                return res.json({ message: "Attendance can only be added between 8:00 AM and 5:00 PM, The working hours!", data: [date, hour, minute] });
            }
        });
    } catch(error) {
        console.log(error.message);
    }
});

export default router;
