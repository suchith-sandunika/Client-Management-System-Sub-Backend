import express from "express";
import con from "../utils/db.js";
const router = express.Router(); 

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
        // const sql = `SELECT * FROM attendance INNER JOIN employee ON attendance.EmployeeID = employee.EmployeeID`;
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
        con.query(sql, [input, input, input], (err, data) => {
            if(err) return res.json(err);
            return res.json(data);
        });
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
        console.log(name, date, email, hour, minute);
        // check whether the user is already existing ...
        const sql1 = `SELECT EmployeeID FROM employee WHERE Name = ? AND Email = ?`;
        con.query(sql1, [name, email], (err, result) => {
            if(err) return res.json(err);
            if(result.length === 0) {
                return res.json({ message: "Employee not found!"});
            }
            console.log(result.length);
            console.log(result[0]);
            console.log(result[0].EmployeeID);
            const EmployeeId = result[0].EmployeeID;
            console.log("EmployeeId : ", EmployeeId);
            if(hour > 8 && hour < 17 && minute > 0 && minute < 60) {
                const sql2 = `INSERT INTO attendance (EmployeeId, date) VALUES (${EmployeeId}, '${date}')`;
                con.query(sql2, [EmployeeId, date], (err, data) => {
                    if(err) return res.json(err);
                    return res.json({ message: "Attendance added successfully!", data: data });
                });
            } else {
                return res.json({ message: "Attendance can only be added between 8:00 AM and 5:00 PM, The working hours!"});
            }
        });
    } catch(error) {
        console.log(error.message);
    }
});

export default router;