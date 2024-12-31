import express from 'express';
import nodemailer from 'nodemailer';
import 'dotenv/config'
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Multer configuration for handling attachments
const upload = multer({ dest: "uploads/" });

// Email sending route
router.post("/send-email", upload.single("attachment"), async (req, res) => {
    const { to, subject, message } = req.body;
    const attachment = req.file;

    // Configure the transporter
    const transporter = nodemailer.createTransport({
        service: "gmail", // Use Gmail service
        host: "smtp.gmail.com", // Use SMTP server
        port: 587, // Use 465 for secure: true .. Can use 587 ...
        secure: false,
        auth: {
            user: process.env.FROM_EMAIL, // Use environment variables
            pass: process.env.PASSWORD, // App-specific password for Gmail
        },
        tls: {
            rejectUnauthorized: false,
        },
    });

    // console.log('Email:', process.env.FROM_EMAIL);
    // console.log('Password:', process.env.PASSWORD);
    // console.log('Password:', process.env.PASSWORD ? 'Loaded' : 'Not Loaded');

    // Email options
    const mailOptions = {
        from: process.env.FROM_EMAIL, // Sender's email
        to,
        subject,
        text: message,
        attachments: attachment
            ? [
                  {
                      filename: attachment.originalname,
                      path: path.resolve(attachment.path),
                      contentType: 'attachment/pdf',
                  },
              ]
            : [],
    };

    console.log(mailOptions);

    try {
        // Send the email
        await transporter.sendMail(mailOptions);

        // Cleanup uploaded file if it exists
        if (attachment) {
            fs.unlinkSync(attachment.path); // Deletes the uploaded file after use
        }

        res.status(200).json({ success: true, message: "Email sent successfully" });
    } catch (error) {
        console.error("Error sending email:", error);

        // Cleanup uploaded file if it exists
        if (attachment) {
            fs.unlinkSync(attachment.path);
        }

        res.status(500).json({ success: false, message: "Failed to send email", error });
    }
});

export default router;

// router.post('/send-email', upload.single("attachment"), async (req, res) => {
//     const { to, subject, message } = req.body;
//     const attachment = req.file;

//     // Configure the transporter
//     const transporter = nodemailer.createTransport({
//         //service: 'gmail', // or use another service like Outlook, Yahoo, etc.
//         host: 'smtp.gmail.com', // e.g., smtp.gmail.com
//         port: 465, // Use 587 for STARTTLS or 465 for SSL
//         secure: true, // Use SSL
//         auth: {
//             user: 'esuchith@gmail.com',
//             pass: '+1234SSe'
//             // user: process.env.FROM_EMAIL,
//             // pass: process.env.PASSWORD
//         },
//         tls: {
//             rejectUnauthorized: false, // Accept self-signed certificates
//         },
//         debug: true, // Enable debugging
//     });

//     // Email options
//     const mailOptions = {
//         from: 'esuchith@gmail.com',
//         to,
//         subject,
//         text: message,
//         attachments: attachment
//                 ? [
//                       {
//                           filename: attachment.originalname,
//                           path: path.resolve(attachment.path),
//                       },
//                   ]
//                 : [],
//     };

//     // // Handle attachment if it exists
//     // if (attachment) {
//     //     mailOptions.attachments = [{ path: attachment }]; // Adjust this as needed for file paths
//     // }


//     try {
//         await transporter.sendMail(mailOptions);
//         // Cleanup uploaded file if any
//         if (attachment) {
//             fs.unlinkSync(attachment.path);
//         }
//         res.status(200).json({ success: true, message: 'Email sent successfully' });
//     } catch (error) {
//         console.error('Error sending email:', error);
//         res.status(500).send({ success: false, message: 'Failed to send email' });
//         console.log(error);
//     }
// });

