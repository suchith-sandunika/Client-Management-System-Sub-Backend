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
        // const sql = `SELECT * FROM attendance INNER JOIN employee ON attendance.EmployeeID = employee.EmployeeID`;
        const sql = `SELECT 
                        ROW_NUMBER() OVER (ORDER BY employee.EmployeeID) AS RowNumber,
                        employee.EmployeeID,
                        employee.name, 
                        employee.email, 
                        DATE(attendance.date) AS date,
                        HOUR(attendance.date) AS hour,
                        MINUTE(attendance.date) AS minute,
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

        if (isDDMMYYYYWithDash(input)) {
            // Convert from DD-MM-YYYY to YYYY-MM-DD ...
            const [day, month, year] = input.split('-');
            const formattedDate = `${year}-${month}-${day}`;
            con.query(sql, [formattedDate, formattedDate, formattedDate], (err, data) => {
                if (err) return res.json(err);
                return res.json(data);
            });
        } else if (isYYYYMMDD(input)) {
            // Input is already in YYYY-MM-DD ...
            con.query(sql, [input, input, input], (err, data) => {
                if (err) return res.json(err);
                return res.json(data);
            });
        } else {
            // If the input is not a date ...
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

        // Concatenate the `date` with the current time in HH:mm:ss format...
        // The easiest way to do this is add current_date as date parameter ... But for the sake of all conditions .. i did it in this way ...
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
            if(hour >= 8 && hour < 17 && minute > 0 && minute < 60) {
                // Postman default time zone setting ... Coordinated Universal Time (UTC) ...
                // Like ... 2024-12-18T18:30:00.000Z in UTC translates to 2024-12-19 00:00:00 in IST ...
                const sql2 = `INSERT INTO attendance (EmployeeId, date) VALUES (${EmployeeId}, '${date}')`;
                con.query(sql2, [EmployeeId, fullDateTime], (err, data) => {
                    if(err) return res.json(err);
                    return res.json({ message: "Attendance added successfully!", data: data });
                });
            } else {
                return res.json({ message: "Attendance can only be added between 8:00 AM and 5:00 PM, The working hours!", data: [date, hour, minute]});
            }
        });
    } catch(error) {
        console.log(error.message);
    }
});

export default router;