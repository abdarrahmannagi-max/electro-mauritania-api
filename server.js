const express = require("express");
const cors = require("cors");
const { Resend } = require("resend");

const app = express();

app.use(cors());
app.use(express.json());

/* =========================
   🔐 Resend API KEY
========================= */
if (!process.env.RESEND_API_KEY) {
    console.log("❌ Missing RESEND_API_KEY");
}

const resend = new Resend(process.env.RESEND_API_KEY);

/* =========================
   OTP Storage
========================= */
const otpStore = {};

/* =========================
   Health Check (مهم جدًا لـ Render)
========================= */
app.get("/", (req, res) => {
    res.send("🚀 Server is running");
});

app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
});

/* =========================
   Send OTP
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
            subject: "OTP Code",
            html: `
                <div style="font-family:Arial;text-align:center">
                    <h2>Your OTP Code</h2>
                    <h1 style="color:#2563eb">${otp}</h1>
                </div>
            `
        });

        return res.json({ success: true });

    } catch (err) {
        console.log("EMAIL ERROR:", err);

        return res.status(500).json({
            error: "Failed to send email"
        });
    }
});

/* =========================
   Verify OTP
========================= */
app.post("/api/verify-otp", (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ error: "Missing data" });
    }

    if (otpStore[email] === otp) {
        delete otpStore[email];
        return res.json({ success: true });
    }

    return res.status(400).json({ error: "Invalid OTP" });
});

/* =========================
   PORT (IMPORTANT)
========================= */
const PORT = process.env.PORT || 10000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
