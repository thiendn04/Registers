import express from 'express'
import mysql from 'mysql';
import cors from 'cors';

import session from "express-session";
import cookieParser from "cookie-parser";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs';
import pkg from 'bcryptjs';
const { hash } = pkg;
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
dotenv.config();
const salt = 10;

const app = express();
app.use(cors({
    origin: ['http://192.168.225.110'], //IP Web1, có thể để hostname nếu có dns
    methods: ["POST", "GET"],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

const db = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    port: process.env.PORT
})
db.connect(function(err) {
    if (err) throw err;
    console.log("Connected!!!")
});

const verifyUser = (req, res, next) => {
    const token = req.cookies.token;
    if(!token) {
        return res.json({Error: "You are not authenticated"});
    } else {
        jwt.verify(token, "jwt-secret-key", (err, decoded) => {
            if(err) {
                return res.json({Error: "Token in not okey"});
            } else {
                req.name = decoded.name;
                next();
            }
        })
    }
}

app.get('/', verifyUser, (req, res) => {
    return res.json({Status: "Success", name: req.name});
})

app.post('/signup', (req, res) => {
    const sql = "INSERT INTO login (`name`,`email`,`password`) VALUES (?)";
    bcrypt.hash(req.body.password.toString(), salt, (err, hash) => {
        if(err) return res.json({Error: "Error for hassing password"});
        const values = [
            req.body.name,
            req.body.email,
            hash
        ]
        db.query(sql, [values], (err, result) => {
            if(err) return res.json({Error: "Inserting data Error in server"});
            return res.json({Status: "Success"});
        })
    })
})
app.post('/login', (req, res) => {
    const sql = 'SELECT * FROM login WHERE email = ?';
    db.query(sql, [req.body.email], (err, data) => {
        if(err) return res.json({Error: "Login Error in server"});
        if(data.length > 0) {
            bcrypt.compare(req.body.password.toString(), data[0].password, (err, response) => {
                if(err) return res.json({Error: "Password compare error"}); 
                if(response) {
                    const name = data[0].name;
                    const token = jwt.sign({name}, "jwt-secret-key", {expiresIn: '1d'});
                    res.cookie('token', token);
                    return res.json({Status: "Success"});
                } else {
                    return res.json({Error: "Password not matched"});
                }
            })
        } else {
            return res.json({Error: "No email existed"});
        }
    })
})

app.get('/logout', (req, res) => {
    res.clearCookie('token');
    return res.json({Status: "Success"});
})

app.listen(8081, ()=> {
    console.log("listening");
})