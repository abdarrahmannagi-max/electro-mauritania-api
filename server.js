app.post("/api/send-otp", async (req, res) => {
    try {
        const { email } = req.body;

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        const result = await resend.emails.send({
            from: "Electro <onboarding@resend.dev>",
            to: email,
            subject: "OTP Code",
            html: `<h1>${otp}</h1>`
        });

        console.log("SUCCESS:", result);

        return res.json({ success: true, otp });

    } catch (err) {
        console.error("FULL ERROR:", err); // 🔥 مهم جدًا

        return res.status(500).json({
            success: false,
            error: err.message // 🔥 هذا يكشف المشكلة الحقيقية
        });
    }
});
