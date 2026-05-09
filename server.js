const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();
app.use(express.json());
app.use(cors());

const otpStore = {};

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "abdarrahmannagi@gmail.com",
        pass: "pmdpbvjgapdjaqhb"
    }
});

app.post("/api/send-otp", async (req, res) => {
    const { email } = req.body;

    const otp = Math.floor(100000 + Math.random() * 900000);
    otpStore[email] = otp;

    try {
        await transporter.sendMail({
            from: "Electro",
            to: email,
            subject: "OTP Code",
            text: `Your code is: ${otp}`
        });

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Email failed" });
    }
});

app.post("/api/verify-otp", (req, res) => {
    const { email, otp } = req.body;

    if (otpStore[email] == otp) {
        return res.json({ success: true });
    }

    res.status(400).json({ error: "Invalid OTP" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Server running");
});
