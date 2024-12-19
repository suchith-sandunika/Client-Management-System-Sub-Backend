import mysql from 'mysql';

const con = mysql.createConnection({
    host: "localhost",
    user:"root",
<<<<<<< HEAD
    password:"BAla2000BAla@",
=======
    password:"",
>>>>>>> 219ad0e509fbc401969e8549eb80b555b37d69f3
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

// import mysql from 'mysql2';

// const con = mysql.createConnection({
//     host: "localhost",
//     user:"suchith",
//     password:"+1234SSe",
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