const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();
app.use(cors());
app.use(express.json());

// =======================
// إعداد Gmail SMTP
// =======================
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: "abdarrahman250@gmail.com",      // 📧 الإيميل
        pass: "ozcbbkoipomrfkja"              // 🔐 App Password
    }
});

// =======================
// تخزين OTP
// =======================
const otpStore = {};

// =======================
// إرسال OTP
// =======================
app.post("/api/send-otp", async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                error: "Email required"
            });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        otpStore[email] = otp;

        console.log("📩 OTP for:", email, otp);

        // =======================
        // إرسال الإيميل
        // =======================
        await transporter.sendMail({
            from: `"Electro Mauritania" <${"abdarrahman250@gmail.com"}>`,
            to: email,
            subject: "رمز التحقق OTP",
            html: `
                <div style="font-family:Arial;text-align:center">
                    <h2>رمز التحقق الخاص بك</h2>
                    <h1 style="color:#2563eb;font-size:40px">${otp}</h1>
                    <p>صالح لمدة 5 دقائق</p>
                </div>
            `
        });

        console.log("✅ EMAIL SENT");

        return res.json({
            success: true,
            message: "OTP sent",
            otp // للتجربة فقط
        });

    } catch (err) {
        console.error("❌ EMAIL ERROR:", err);

        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

// =======================
// التحقق من OTP
// =======================
app.post("/api/verify-otp", (req, res) => {
    const { email, otp } = req.body;

    if (otpStore[email] === otp) {
        return res.json({
            success: true,
            message: "OTP verified"
        });
    }

    return res.status(400).json({
        success: false,
        error: "Invalid OTP"
    });
});

// =======================
// تشغيل السيرفر
// =======================
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
    console.log("🚀 Server running on port", PORT);
});
