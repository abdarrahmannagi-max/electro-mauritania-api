const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// =========================
// PORT (Render mandatory)
// =========================
const PORT = process.env.PORT || 10000;

// =========================
// Health check (IMPORTANT)
// =========================
app.get("/", (req, res) => {
    res.send("🚀 Server is running");
});

// =========================
// OTP memory store
// =========================
const otpStore = {};

// =========================
// SAFE RESEND LOADING
// =========================
let resend = null;

try {
    const { Resend } = require("resend");

    if (process.env.RESEND_API_KEY) {
        resend = new Resend(process.env.RESEND_API_KEY);
        console.log("✅ Resend loaded");
    } else {
        console.log("⚠️ Missing RESEND_API_KEY");
    }
} catch (e) {
    console.log("⚠️ Resend disabled:", e.message);
}

// =========================
// SEND OTP
// =========================
app.post("/api/send-otp", async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: "Email required" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = otp;

    console.log("OTP:", otp);

    // إذا resend لا يعمل → لا يوقف السيرفر
    if (!resend) {
        return res.json({
            success: true,
            devMode: true,
            otp
        });
    }

    try {
        await resend.emails.send({
            from: "onboarding@resend.dev",
            to: email,
            subject: "OTP Code",
            html: `<h1>${otp}</h1>`
        });

        return res.json({ success: true });

    } catch (err) {
        console.log("EMAIL ERROR:", err);
        return res.status(500).json({ error: "Email failed" });
    }
});

// =========================
// VERIFY OTP
// =========================
app.post("/api/verify-otp", (req, res) => {
    const { email, otp } = req.body;

    if (otpStore[email] === otp) {
        delete otpStore[email];
        return res.json({ success: true });
    }

    return res.status(400).json({ error: "Invalid OTP" });
});

// =========================
// START SERVER (CRASH SAFE)
// =========================
try {
    app.listen(PORT, "0.0.0.0", () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
} catch (err) {
    console.log("FATAL ERROR:", err.message);
}
