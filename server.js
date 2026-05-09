const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "abdarrahmannagi@gmail.com",
        pass: "pmdpbvjgapdjaqhb"
    }
});

app.post("/api/send-otp", async (req, res) => {
    try {

        const { email } = req.body;

        const otp = Math.floor(100000 + Math.random() * 900000);

        console.log("Sending OTP to:", email);

        await transporter.sendMail({
            from: '"Electro Mauritania" <abdarrahmannagi@gmail.com>',
            to: email,
            subject: "رمز التحقق",
            html: `
                <h2>رمز التحقق الخاص بك:</h2>
                <h1>${otp}</h1>
            `
        });

        console.log("Email Sent Successfully");

        res.json({
            success: true
        });

    } catch (err) {

        console.log("MAIL ERROR:", err);

        res.status(500).json({
            error: err.message
        });
    }
});
