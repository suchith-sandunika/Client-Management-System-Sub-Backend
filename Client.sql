CREATE DATABASE Client_Management_System;
USE Client_Management_System;

CREATE TABLE Employee (
    EmployeeID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    ContactNumber VARCHAR(15),
    Address TEXT,
    Designation VARCHAR(50),
    Email VARCHAR(100) UNIQUE NOT NULL,
    Password VARCHAR(255) NOT NULL,
    WorkStartDate DATE
);
CREATE TABLE Attendance (
    AttendanceID INT AUTO_INCREMENT PRIMARY KEY,
    EmployeeID INT NOT NULL,
    Date DATETIME NOT NULL,
    FOREIGN KEY (EmployeeID) REFERENCES Employee(EmployeeID)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE Task (
    TaskID INT AUTO_INCREMENT PRIMARY KEY,
    EmployeeID INT NOT NULL,
    TaskName VARCHAR(100) NOT NULL,
    Description TEXT,
    Deadline DATE,
    FOREIGN KEY (EmployeeID) REFERENCES Employee(EmployeeID)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE Admin (
    AdminID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Password VARCHAR(255) NOT NULL,
    ContactNumber VARCHAR(15)
);

CREATE TABLE Invoice (
    invoiceID INT AUTO_INCREMENT PRIMARY KEY,
    EmployeeID INT NOT NULL,
    contact_name VARCHAR(100),
    total_cost INT ,
    invoice_date DATE ,
    FOREIGN KEY (EmployeeID) REFERENCES Employee(EmployeeID)
       ON DELETE CASCADE
	   ON UPDATE CASCADE
    

); 

CREATE TABLE Payment (
 paymentID INT AUTO_INCREMENT PRIMARY KEY,
 invoiceID INT NOT NULL,
 EmployeeID INT NOT NULL,
 card_holder_name VARCHAR (100) NOT NULL,
 card_number INT NOT NULL,
 expiry_date DATE ,
 cvc INT NOT NULL,
 amount INT ,
 payment_status VARCHAR (100),
 payment_date DATE ,
 FOREIGN KEY (invoiceID) REFERENCES Invoice(invoiceID)
       ON DELETE CASCADE
	   ON UPDATE CASCADE ,
FOREIGN KEY (EmployeeID) REFERENCES Employee(EmployeeID)
       ON DELETE CASCADE
	   ON UPDATE CASCADE
);  

CREATE TABLE Service1 (
serviceID INT AUTO_INCREMENT PRIMARY KEY,
invoiceID INT,
service_description VARCHAR (200),
cost INT ,
FOREIGN KEY (invoiceID) REFERENCES Invoice(invoiceID)
       ON DELETE CASCADE
	   ON UPDATE CASCADE
); 
