import mysql from 'mysql';

const con = mysql.createConnection({
    host: "localhost",
    user:"root",
    password:"",
    database:"Client_Management_System"
})

con.connect(function(err){
    if(err){
        console.log("connection error")
    } else{
        console.log("Connected")
    }
}) 

export default con;