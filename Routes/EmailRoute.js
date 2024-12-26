import express from 'express';
import nodemailer from 'nodemailer';
import 'dotenv/config'
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Multer configuration for handling attachments
const upload = multer({ dest: "uploads/" });

router.post('/send-email', upload.single("attachment"), async (req, res) => {
    const { to, subject, message } = req.body;
    const attachment = req.file;

    // Configure the transporter
    const transporter = nodemailer.createTransport({
        //service: 'gmail', // or use another service like Outlook, Yahoo, etc.
        host: 'smtp.gmail.com', // e.g., smtp.gmail.com
        port: 465, // Use 587 for STARTTLS or 465 for SSL
        secure: true, // Use SSL
        auth: {
            user: 'esuchith@gmail.com',
            pass: '+1234SSe'
            // user: process.env.FROM_EMAIL,
            // pass: process.env.PASSWORD
        },
        tls: {
            rejectUnauthorized: false, // Accept self-signed certificates
        },
        debug: true, // Enable debugging
    });

    // Email options
    const mailOptions = {
        from: 'esuchith@gmail.com',
        to,
        subject,
        text: message,
        attachments: attachment
                ? [
                      {
                          filename: attachment.originalname,
                          path: path.resolve(attachment.path),
                      },
                  ]
                : [],
    };

    // // Handle attachment if it exists
    // if (attachment) {
    //     mailOptions.attachments = [{ path: attachment }]; // Adjust this as needed for file paths
    // }


    try {
        await transporter.sendMail(mailOptions);
        // Cleanup uploaded file if any
        if (attachment) {
            fs.unlinkSync(attachment.path);
        }
        res.status(200).json({ success: true, message: 'Email sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).send({ success: false, message: 'Failed to send email' });
        console.log(error);
    }
});
export default router;
// module.exports = router;
