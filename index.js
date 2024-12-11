import express from "express";
import con from './utils/db.js';
import EmployeeRoutes from './Routes/EmployeeRotes.js';
import AdminRoutes from './Routes/AdminRoutes.js';
import cors from 'cors';

const app =  express(); 

app.use(express.json());
app.use(cors(
    {
        origin: 'http://localhost:3000',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Authorization']
    }
));
app.use('/api/employees', EmployeeRoutes);
app.use('/api/admin', AdminRoutes);

app.listen(8800,() => {
    console.log("Connected to backend!")
});
