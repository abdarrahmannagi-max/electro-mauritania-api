const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();
app.use(express.json());
app.use(cors());

const otpStore = {};

// 🔥 إعداد Gmail الصحيح
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "abdarrahman250@gmail.com",
        pass: "ozcbbkoipomrfkja"
    }
});

// اختبار السيرفر
app.get("/", (req, res) => {
    res.send("SERVER IS WORKING");
});

// إرسال OTP
app.post("/api/send-otp", async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: "Email required" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        otpStore[email] = otp;

        console.log("OTP:", otp);

        await transporter.sendMail({
            from: `"Electro Mauritania" <${"abdarrahman250@gmail.com"}>`,
            to: email,
            subject: "رمز التحقق",
            html: `
                <div style="font-family:Arial;text-align:center">
                    <h2>رمز التحقق الخاص بك</h2>
                    <h1 style="color:#2563eb;font-size:40px">${otp}</h1>
                    <p>لا تشارك هذا الرمز مع أي شخص</p>
                </div>
            `
        });

        console.log("EMAIL SENT");

        return res.json({
            success: true,
            message: "OTP sent"
        });

    } catch (err) {
        console.error("EMAIL ERROR:", err);

        return res.status(500).json({
            success: false,
            error: "Email failed"
        });
    }
});

// التحقق
app.post("/api/verify-otp", (req, res) => {
    const { email, otp } = req.body;

    if (otpStore[email] === otp) {
        delete otpStore[email];
        return res.json({ success: true });
    }

    return res.status(400).json({ error: "Invalid OTP" });
});

// تشغيل السيرفر (مهم لـ Render)
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
    console.log("SERVER RUNNING ON PORT", PORT);
});
