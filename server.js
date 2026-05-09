const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// =========================
// PORT (مهم جدًا لـ Render)
// =========================
const PORT = process.env.PORT || 10000;

// =========================
// Health check (ضروري لـ Render)
// =========================
app.get("/", (req, res) => {
    res.send("🚀 Server is alive");
});

// =========================
// OTP storage
// =========================
const otpStore = {};

// =========================
// Load Resend safely (NO CRASH)
// =========================
let resend = null;

try {
    const { Resend } = require("resend");

    if (process.env.RESEND_API_KEY) {
        resend = new Resend(process.env.RESEND_API_KEY);
        console.log("✅ Resend initialized");
    } else {
        console.log("❌ Missing RESEND_API_KEY");
    }
} catch (err) {
    console.log("❌ Resend failed to load:", err.message);
}

// =========================
// SEND OTP
// =========================
app.post("/api/send-otp", async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: "Email required" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        otpStore[email] = otp;

        console.log("OTP:", otp);

        // إذا Resend غير شغال → لا ينهار السيرفر
        if (!resend) {
            return res.json({
                success: true,
                devMode: true,
                otp
            });
        }

        await resend.emails.send({
            from: "onboarding@resend.dev",
            to: email,
            subject: "OTP Code",
            html: `<h1>${otp}</h1>`
        });

        return res.json({ success: true });

    } catch (err) {
        console.log("SEND OTP ERROR:", err);
        return res.status(500).json({ error: "Failed to send OTP" });
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
// START SERVER (NO CRASH)
// =========================
try {
    app.listen(PORT, "0.0.0.0", () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
} catch (err) {
    console.log("❌ Server failed to start:", err.message);
}
