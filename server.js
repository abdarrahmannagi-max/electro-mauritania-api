const express = require("express");
const cors = require("cors");
const { Resend } = require("resend");

const app = express();
app.use(express.json());
app.use(cors());

// Resend API
const resend = new Resend("PUT_YOUR_API_KEY_HERE");

const otpStore = {};

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

        const result = await resend.emails.send({
            from: "onboarding@resend.dev",
            to: email,
            subject: "رمز التحقق OTP",
            html: `<h1>رمزك هو: ${otp}</h1>`
        });

        console.log("EMAIL SENT:", result);

        res.json({ success: true });

    } catch (err) {
        console.log("EMAIL ERROR:", err);
        res.status(500).json({ error: "Email failed" });
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
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Server running on port", PORT);
});
