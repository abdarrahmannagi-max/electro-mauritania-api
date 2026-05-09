const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();

app.use(express.json());

app.use(cors({
    origin: "*"
}));

// تخزين الأكواد مؤقتاً
const otpStore = {};

// إعداد Gmail SMTP الصحيح
const transporter = nodemailer.createTransport({

    host: "smtp.gmail.com",

    port: 587,

    secure: false,

    auth: {

        user: "abdarrahmannagi@gmail.com",

        // ضع App Password هنا
        pass: "pmdpbvjgapdjaqhb"

    },

    tls: {
        rejectUnauthorized: false
    }
});

// اختبار السيرفر
app.get("/", (req, res) => {

    res.send("SERVER IS WORKING");

});

// فحص API
app.get("/api/health", (req, res) => {

    res.json({
        status: "online"
    });

});

// إرسال OTP
app.post("/api/send-otp", async (req, res) => {

    try {

        const { email } = req.body;

        if (!email) {

            return res.status(400).json({
                error: "Email required"
            });
        }

        // إنشاء الكود
        const otp = Math.floor(
            100000 + Math.random() * 900000
        ).toString();

        otpStore[email] = otp;

        console.log("OTP:", otp);

        // إرسال الإيميل
        await transporter.sendMail({

            from: '"Electro Mauritania" <abdarrahmannagi@gmail.com>',

            to: email,

            subject: "رمز التحقق - Electro Mauritania",

            html: `
                <div style="
                    font-family:Arial;
                    padding:40px;
                    background:#0f172a;
                    color:white;
                    text-align:center;
                    border-radius:20px;
                ">

                    <h1 style="color:#3b82f6;">
                        Electro Mauritania
                    </h1>

                    <p style="font-size:18px;">
                        رمز التحقق الخاص بك:
                    </p>

                    <div style="
                        font-size:45px;
                        font-weight:bold;
                        letter-spacing:10px;
                        color:#22c55e;
                        margin:30px 0;
                    ">
                        ${otp}
                    </div>

                    <p>
                        صالح لمدة 5 دقائق فقط
                    </p>

                </div>
            `
        });

        console.log("EMAIL SENT");

        return res.json({
            success: true
        });

    } catch (err) {

        console.log("EMAIL ERROR:", err);

        return res.status(500).json({

            error: err.message
        });
    }
});

// التحقق من OTP
app.post("/api/verify-otp", (req, res) => {

    const { email, otp } = req.body;

    if (!email || !otp) {

        return res.status(400).json({
            error: "Missing data"
        });
    }

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

// تشغيل السيرفر
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log("Server running on port " + PORT);

});
