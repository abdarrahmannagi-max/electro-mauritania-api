const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();
app.use(express.json());
app.use(cors());

// تخزين OTP مؤقتاً
const otpStore = {};

// إعداد Gmail SMTP (App Password)
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: "abdarrahmannagi@gmail.com",
        pass: "pmdpbvjgapdjaqhb"
    }
});

// اختبار الاتصال مع SMTP (مهم جداً للتشخيص)
transporter.verify((error, success) => {
    if (error) {
        console.log("❌ SMTP Error:", error);
    } else {
        console.log("✅ SMTP جاهز للإرسال");
    }
});

// إرسال OTP
app.post("/api/send-otp", async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: "Email required" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = otp;

    try {
        await transporter.sendMail({
            from: '"Electro Mauritania" <abdarrahmannagi@gmail.com>',
            to: email,
            subject: "رمز التحقق OTP",
            text: `رمز التحقق الخاص بك هو: ${otp}`
        });

        console.log("📩 OTP sent:", otp, "to", email);

        res.json({ success: true });
    } catch (err) {
        console.error("❌ Email Error:", err);
        res.status(500).json({ error: "Email failed" });
    }
});

// التحقق من OTP
app.post("/api/verify-otp", (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ error: "Missing data" });
    }

    if (otpStore[email] && otpStore[email] === otp) {
        delete otpStore[email]; // حذف الكود بعد النجاح
        return res.json({ success: true });
    }

    res.status(400).json({ error: "Invalid OTP" });
});

// تشغيل السيرفر
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("🚀 Server running on port " + PORT);
});
