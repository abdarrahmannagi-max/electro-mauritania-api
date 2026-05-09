const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();

app.use(express.json());

// =========================
// CORS (مهم جداً)
// =========================
app.use(cors({
    origin: "*", // لاحقاً نقدر نقيدها لموقعك
    credentials: true
}));

// =========================
// PORT
// =========================
const PORT = process.env.PORT || 10000;

// =========================
// JWT SECRET (لازم في Render ENV)
// =========================
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

// =========================
// MEMORY DB (مؤقت)
// =========================
const users = [];
const otpStore = {};

// =========================
// HOME
// =========================
app.get("/", (req, res) => {
    res.send("🚀 Server is running");
});

// =========================
// MIDDLEWARE AUTH
// =========================
function auth(req, res, next) {
    const token = req.headers.authorization;

    if (!token) return res.status(401).json({ error: "No token" });

    try {
        const decoded = jwt.verify(token.split(" ")[1], JWT_SECRET);
        req.user = decoded;
        next();
    } catch (e) {
        return res.status(401).json({ error: "Invalid token" });
    }
}

// =========================
// REGISTER
// =========================
app.post("/api/register", (req, res) => {
    const { name, email, password } = req.body;

    const exists = users.find(u => u.email === email);
    if (exists) return res.status(400).json({ error: "User exists" });

    const user = {
        id: Date.now().toString(),
        name,
        email,
        password
    };

    users.push(user);

    const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        JWT_SECRET,
        { expiresIn: "7d" }
    );

    res.json({
        success: true,
        token,
        user
    });
});

// =========================
// LOGIN
// =========================
app.post("/api/login", (req, res) => {
    const { email, password } = req.body;

    const user = users.find(u => u.email === email && u.password === password);

    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        JWT_SECRET,
        { expiresIn: "7d" }
    );

    res.json({
        success: true,
        token,
        user
    });
});

// =========================
// CURRENT USER (/api/me) ⭐ مهم
// =========================
app.get("/api/me", auth, (req, res) => {
    const user = users.find(u => u.id === req.user.id);

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
        user: {
            id: user.id,
            name: user.name,
            email: user.email
        }
    });
});

// =========================
// SEND OTP
// =========================
app.post("/api/send-otp", (req, res) => {
    const { email } = req.body;

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = otp;

    console.log("OTP:", otp);

    res.json({ success: true, otp });
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

    res.status(400).json({ error: "Invalid OTP" });
});

// =========================
// START SERVER
// =========================
app.listen(PORT, "0.0.0.0", () => {
    console.log("🚀 Server running on port", PORT);
});
