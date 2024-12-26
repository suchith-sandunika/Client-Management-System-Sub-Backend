import express from "express";
import cors from 'cors';
import bodyParser from 'body-parser';
import EmployeeRoutes from './Routes/EmployeeRotes.js';
import AdminRoutes from './Routes/AdminRoutes.js';
import EmailRoute from './Routes/EmailRoute.js';

const app =  express(); 

app.use(express.json());
// Enable CORS for all routes
// app.use(cors());
app.use(cors(
    {
        origin: 'http://localhost:3000',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Authorization']
    }
));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes ...
app.use('/api/employees', EmployeeRoutes);
app.use('/api/admin', AdminRoutes);
app.use('/api/emailService', EmailRoute);

app.listen(5000,() => {
    console.log("Connected to backend!")
});
