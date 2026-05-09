const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();

app.use(express.json());

app.use(cors());

const otpStore = {};

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,

    auth: {
        user: "abdarrahmannagi@gmail.com",

        // ضع App Password هنا
        pass: "pmdpbvjgapdjaqhb"
    }
});

app.get("/", (req, res) => {
    res.send("SERVER IS WORKING");
});

app.get("/api/health", (req, res) => {
    res.json({
        status: "online"
    });
});

app.post("/api/send-otp", async (req, res) => {

    try {

        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                error: "Email required"
            });
        }

        const otp = Math.floor(
            100000 + Math.random() * 900000
        ).toString();

        otpStore[email] = otp;

        console.log("OTP:", otp);

        await transporter.sendMail({

            from: '"Electro Mauritania" <abdarrahmannagi@gmail.com>',

            to: email,

            subject: "رمز التحقق",

            html: `
                <div style="font-family:Arial;padding:30px;text-align:center">
                    <h1>Electro Mauritania</h1>

                    <p>رمز التحقق الخاص بك:</p>

                    <h2 style="font-size:40px;color:#2563eb">
                        ${otp}
                    </h2>
                </div>
            `
        });

        console.log("EMAIL SENT");

        return res.json({
            success: true
        });

    } catch (err) {

        console.log(err);

        return res.status(500).json({
            error: err.message
        });
    }
});

app.post("/api/verify-otp", (req, res) => {

    const { email, otp } = req.body;

    if (otpStore[email] == otp) {

        delete otpStore[email];

        return res.json({
            success: true
        });
    }

    return res.status(400).json({
        error: "Invalid OTP"
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server running");
});
