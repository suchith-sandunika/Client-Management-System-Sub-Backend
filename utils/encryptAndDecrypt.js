// import crypto from 'crypto';

// // Define encryption settings (must match the encryption logic you used earlier)
// const algorithm = 'aes-256-cbc'; // Encryption algorithm
// const secretKey = crypto.randomBytes(32); // Secret key (32 bytes for AES-256)
// // Use the same fixed IV that was used during encryption
// const iv = Buffer.from('1234567890123456'); // 16-byte fixed IV 

// // Function to encrypt the password
// function encryptPassword(password) {
//     const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
//     let encrypted = cipher.update(password, 'utf8', 'hex');
//     encrypted += cipher.final('hex');
//     return encrypted; // Return only the encrypted password (no IV)
// }

// // Function to decrypt the password
// function decryptPassword(encryptedPassword) {
//     try {
//         const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
//         let decrypted = decipher.update(encryptedPassword, 'hex', 'utf8');
//         decrypted += decipher.final('utf8');
//         return decrypted;
//     } catch (error) {
//         console.error("Decryption error:", error.message);
//         throw new Error("Failed to decrypt password.");
//     }
// }
 

// export { encryptPassword, decryptPassword };
