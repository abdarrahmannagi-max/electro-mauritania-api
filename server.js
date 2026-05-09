const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { Resend } = require("resend");

const app = express();

// =========================
// ENV
// =========================
const PORT = process.env.PORT || 10000;
const JWT_SECRET = process.env.JWT_SECRET;
const RESEND_API_KEY = process.env.RESEND_API_KEY;

// تحقق من المفاتيح
if (!JWT_SECRET) {
    console.error("❌ JWT_SECRET missing");
}
if (!RESEND_API_KEY) {
    console.warn("⚠️ RESEND_API_KEY missing (emails will not send)");
}

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

// =========================
// MIDDLEWARE
// =========================
app.use(express.json());

app.use(cors({
    origin: [
        "https://electro-mauritania.onrender.com",
        "http://localhost:5173"
    ],
    credentials: true
}));

// =========================
// MEMORY DB (مؤقت - لاحقاً MongoDB)
// =========================
let users = [];
let otpStore = {};

// =========================
// HEALTH
// =========================
app.get("/", (req, res) => {
    res.send("🚀 Server is running");
});

// =========================
// JWT
// =========================
function generateToken(user) {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "7d" }
    );
}

// =========================
// AUTH MIDDLEWARE
// =========================
function auth(req, res, next) {
    try {
        const header = req.headers.authorization;
        if (!header) return res.status(401).json({ error: "No token" });

        const token = header.split(" ")[1];
        const decoded = jwt.verify(token, JWT_SECRET);

        const user = users.find(u => u.id === decoded.id);
        if (!user) return res.status(401).json({ error: "User not found" });

        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ error: "Invalid token" });
    }
}

// =========================
// REGISTER
// =========================
app.post("/api/register", async (req, res) => {
    const { name, email, password } = req.body;

    const exists = users.find(u => u.email === email);
    if (exists) return res.status(400).json({ error: "User exists" });

    const hashed = await bcrypt.hash(password, 10);

    const user = {
        id: Date.now().toString(),
        name,
        email,
        password: hashed,
        role: "user",
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
    };

    users.push(user);

    const token = generateToken(user);

    res.json({ user, token });
});

// =========================
// LOGIN
// =========================
app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;

    const user = users.find(u => u.email === email);
    if (!user) return res.status(400).json({ error: "User not found" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ error: "Wrong password" });

    const token = generateToken(user);

    res.json({ user, token });
});

// =========================
// ME
// =========================
app.get("/api/me", auth, (req, res) => {
    res.json({ user: req.user });
});

// =========================
// SEND OTP (FIXED EMAIL)
// =========================
app.post("/api/send-otp", async (req, res) => {
    const { email } = req.body;

    if (!email) return res.status(400).json({ error: "Email required" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    otpStore[email] = {
        otp,
        expires: Date.now() + 10 * 60 * 1000
    };

    console.log("OTP:", email, otp);

    // إرسال فعلي عبر Resend
    if (resend) {
        try {
            await resend.emails.send({
                from: "Electro <onboarding@resend.dev>",
                to: email,
                subject: "Your Verification Code",
                html: `<h1>Your OTP: ${otp}</h1>`
            });
        } catch (err) {
            console.error("EMAIL ERROR:", err);
        }
    }

    res.json({
        success: true,
        devOTP: otp
    });
});

// =========================
// VERIFY OTP
// =========================
app.post("/api/verify-otp", (req, res) => {
    const { email, otp } = req.body;

    const record = otpStore[email];

    if (!record) return res.status(400).json({ error: "No OTP found" });

    if (Date.now() > record.expires) {
        delete otpStore[email];
        return res.status(400).json({ error: "OTP expired" });
    }

    if (record.otp !== otp) {
        return res.status(400).json({ error: "Invalid OTP" });
    }

    delete otpStore[email];

    res.json({ success: true });
});

// =========================
// RESET PASSWORD
// =========================
app.post("/api/reset-password", async (req, res) => {
    const { email, newPassword } = req.body;

    const user = users.find(u => u.email === email);
    if (!user) return res.status(400).json({ error: "User not found" });

    user.password = await bcrypt.hash(newPassword, 10);

    res.json({ success: true });
});

// =========================
// LOGOUT
// =========================
app.post("/api/logout", (req, res) => {
    res.json({ success: true });
});

// =========================
// START SERVER
// =========================
app.listen(PORT, "0.0.0.0", () => {
    console.log("🚀 Server running on port", PORT);
});
