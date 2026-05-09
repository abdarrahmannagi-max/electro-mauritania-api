const express = require("express");
const cors = require("cors");
const { Resend } = require("resend");

const app = express();
app.use(cors());
app.use(express.json());

// تخزين OTP
const otpStore = {};

// Resend API
const resend = new Resend("re_7yWfbY9R_ch6ZXrq2ZXEVBNsqFKpFS6sE");

app.post("/api/send-otp", async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: "Email required" });
        }

        // توليد OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        otpStore[email] = otp;

        console.log("OTP:", otp);

        // إرسال البريد عبر Resend
        const result = await resend.emails.send({
            from: "Electro <onboarding@resend.dev>",
            to: email,
            subject: "رمز التحقق OTP",
            html: `
                <div style="font-family:Arial;text-align:center">
                    <h2>رمز التحقق الخاص بك</h2>
                    <h1 style="color:#2563eb">${otp}</h1>
                    <p>لا تشارك هذا الرمز مع أي شخص</p>
                </div>
            `
        });

        console.log("EMAIL RESULT:", result);

        return res.json({
            success: true,
            message: "OTP sent",
            otp // للتجربة فقط (احذفه في الإنتاج)
        });

    } catch (err) {
        console.error("EMAIL ERROR:", err);

        return res.status(500).json({
            error: "Email failed",
            details: err.message
        });
    }
});

app.post("/api/verify-otp", (req, res) => {
    const { email, otp } = req.body;

    if (otpStore[email] === otp) {
        return res.json({ success: true });
    }

    return res.status(400).json({
        error: "Invalid OTP"
    });
});

// مهم جداً لـ Render
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
    console.log("Server running on port", PORT);
});
