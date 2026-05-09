app.post("/api/send-otp", async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: "Email required" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = otp;

    console.log("OTP:", otp);

    // 🔥 مهم: رد سريع للمستخدم (لا تنتظر الإيميل)
    res.json({
        success: true,
        message: "OTP generated, email sending..."
    });

    // 🔥 الإرسال يتم في الخلفية (حتى لو فشل لا يوقف الموقع)
    transporter.sendMail({
        from: "Electro <abdarrahman250@gmail.com>",
        to: email,
        subject: "OTP Code",
        html: `<h1>${otp}</h1>`
    }).then(() => {
        console.log("EMAIL SENT");
    }).catch((err) => {
        console.log("EMAIL FAILED:", err.message);
    });
});
