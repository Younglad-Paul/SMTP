require('dotenv').config();

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cors = require('cors');
var nodemailer = require('nodemailer');

app.use(cors('*'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

let savedOTPS = {};

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

app.post('/sendotp', (req, res) => {
    let email = req.body.email;
    let digits = '0123456789';
    let limit = 4;
    let otp = '';
    for (let i = 0; i < limit; i++) {
        otp += digits[Math.floor(Math.random() * 10)];
    }

    var mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your OTP Code',
        html: `<p>Enter the OTP: <strong>${otp}</strong> to verify your email address.</p>`
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
            res.status(500).send("Couldn't send OTP");
        } else {
            savedOTPS[email] = otp;
            setTimeout(() => {
                delete savedOTPS[email];
            }, 60000);
            res.send("OTP sent successfully");
        }
    });
});

app.post('/verify', (req, res) => {
    let otpReceived = req.body.otp;
    let email = req.body.email;

    if (savedOTPS[email] === otpReceived) {
        res.send("Verified");
    } else {
        res.status(400).send("Invalid OTP");
    }
});

app.listen(4000, () => {
    console.log("Server started on port 4000");
});
