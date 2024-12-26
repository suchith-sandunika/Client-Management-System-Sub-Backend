// import mysql from 'mysql2';

// const con = mysql.createConnection({
//     host: "localhost",
//     user:"root",
//     password:"",
//     database:"Client_Management_System"
// })

// con.connect(function(err){
//     if(err){
//         console.log("connection error")
//     } else{
//         console.log("Connected")
//     }
// }) 

// export default con;

// import mysql from 'mysql2';

// const con = mysql.createConnection({
//     host: "localhost",
//     user:"root",
//     password:"BAla2000BAla@",
//     database:"Client_Management_System"
// })

// con.connect(function(err){
//     if(err){
//         console.log("connection error")
//     } else{
//         console.log("Connected")
//     }
// })

// export default con;

import mysql from 'mysql2';

const con = mysql.createConnection({
    host: "localhost",
    user:"Suchith",
    password:"+1234SSe",
    database:"Client_Management_System",
    port: 3307
})

con.connect(function(err){
    if(err){
        console.log("connection error", err);
    } else{
        console.log("Connected")
    }
})

export default con;