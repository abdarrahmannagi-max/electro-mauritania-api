const express = require("express");
const cors = require("cors");
const { Resend } = require("resend");

const app = express();
app.use(express.json());
app.use(cors());

/* =========================
   🔐 ضع مفتاح Resend هنا
   (من Render Environment Variables)
========================= */
const resend = new Resend(process.env.RESEND_API_KEY);

/* =========================
   تخزين OTP
========================= */
const otpStore = {};

/* =========================
   Health Check
========================= */
app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
});

/* =========================
   إرسال OTP
========================= */
app.post("/api/send-otp", async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: "Email required" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        otpStore[email] = otp;

        console.log("OTP GENERATED:", otp);

        await resend.emails.send({
            from: "onboarding@resend.dev",
            to: email,
            subject: "رمز التحقق OTP",
            html: `
                <div style="font-family:Arial;text-align:center">
                    <h2>رمز التحقق الخاص بك</h2>
                    <h1 style="color:#2563eb">${otp}</h1>
                    <p>لا تشارك هذا الرمز مع أي أحد</p>
                </div>
            `
        });

        res.json({ success: true });

    } catch (err) {
        console.log("EMAIL ERROR:", err);
        res.status(500).json({ error: "Email failed" });
    }
});

/* =========================
   التحقق من OTP
========================= */
app.post("/api/verify-otp", (req, res) => {
    const { email, otp } = req.body;

    if (otpStore[email] === otp) {
        delete otpStore[email];
        return res.json({ success: true });
    }

    return res.status(400).json({ error: "Invalid OTP" });
});

/* =========================
   تشغيل السيرفر
========================= */
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
    console.log("🚀 Server running on port", PORT);
});
