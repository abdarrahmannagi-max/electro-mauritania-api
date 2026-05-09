const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();

app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

const otpStore = {};

// Gmail SMTP
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "abdarrahmannagi@gmail.com",

        // ضع هنا App Password الحقيقي من Google
        pass: "pmdpbvjgapdjaqhb"
    }
});

// فحص SMTP
transporter.verify((error, success) => {

    if (error) {

        console.log("SMTP ERROR:", error);

    } else {

        console.log("SMTP READY");
    }
});

// الصفحة الرئيسية
app.get("/", (req, res) => {

    res.send("SERVER IS WORKING");
});

// فحص السيرفر
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

        // إنشاء OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        otpStore[email] = otp;

        console.log("Sending OTP:", otp, "to", email);

        // إرسال الإيميل
        await transporter.sendMail({

            from: '"Electro Mauritania" <abdarrahmannagi@gmail.com>',

            to: email,

            subject: "رمز التحقق - Electro Mauritania",

            html: `
                <div style="font-family:Arial;padding:30px;background:#0f172a;color:white">

                    <h1 style="color:#3b82f6">
                        Electro Mauritania
                    </h1>

                    <p>
                        رمز التحقق الخاص بك هو:
                    </p>

                    <h2 style="
                        background:#1e293b;
                        padding:20px;
                        border-radius:10px;
                        text-align:center;
                        letter-spacing:8px;
                        color:#38bdf8;
                    ">
                        ${otp}
                    </h2>

                    <p>
                        صالح لمدة 5 دقائق فقط.
                    </p>

                </div>
            `
        });

        console.log("EMAIL SENT SUCCESSFULLY");

        res.json({
            success: true
        });

    } catch (err) {

        console.log("EMAIL ERROR:", err);

        res.status(500).json({
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

    if (otpStore[email] === otp) {

        delete otpStore[email];

        return res.json({
            success: true
        });
    }

    res.status(400).json({
        error: "Invalid OTP"
    });
});

// تشغيل السيرفر
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log("SERVER RUNNING ON PORT", PORT);
});
