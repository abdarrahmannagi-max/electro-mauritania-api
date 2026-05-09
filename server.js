import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory OTP store with expiration
  // Key: email, Value: { otp: string, expires: number }
  const otpStore: Record<string, { otp: string; expires: number }> = {};

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "abdarrahmannagi@gmail.com",
      pass: "pmdpbvjgapdjaqhb",
    },
  });

  // Verify connection configuration
  transporter.verify(function (error, success) {
    if (error) {
      console.error("❌ SMTP Connection Error Detail:", error.message);
    } else {
      console.log("✅ SMTP Server is ready for Electro Mauritania");
    }
  });

  // API Routes
  app.post("/api/send-otp", async (req, res) => {
    try {
      const { email } = req.body;

      if (!email || !email.includes("@")) {
        return res.status(400).json({
          success: false,
          error: "Valid email required",
        });
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Expire in 5 minutes
      otpStore[email] = {
        otp,
        expires: Date.now() + 5 * 60 * 1000,
      };

      console.log(`📩 OTP for ${email}: ${otp}`);

      await transporter.sendMail({
        from: `"Electro Mauritania" <abdarrahmannagi@gmail.com>`,
        to: email,
        subject: "رمز التحقق OTP - Electro Mauritania",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; text-align: center; background-color: #ffffff;">
            <h2 style="color: #1f2937; margin-bottom: 8px;">رمز التحقق الخاص بك</h2>
            <p style="color: #6b7280; margin-bottom: 24px;">استخدم الرمز التالي لإكمال عملية التحقق في Electro Mauritania</p>
            <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; display: inline-block; margin-bottom: 24px;">
              <h1 style="color: #2563eb; font-size: 48px; letter-spacing: 8px; margin: 0; font-family: monospace;">${otp}</h1>
            </div>
            <p style="color: #ef4444; font-size: 14px; font-weight: 500;">هذا الرمز صالح لمدة 5 دقائق فقط</p>
            <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 12px;">
              <p>إذا لم تطلب هذا الرمز، يمكنك تجاهل هذا الإيميل.</p>
              <p>© 2026 Electro Mauritania. جميع الحقوق محفوظة.</p>
            </div>
          </div>
        `,
      });

      console.log("✅ EMAIL SENT SUCCESSFULLY");

      return res.json({
        success: true,
        message: "OTP sent successfully",
      });
    } catch (err: any) {
      console.error("❌ EMAIL ERROR:", err);
      return res.status(500).json({
        success: false,
        error: err.message || "Failed to send email",
      });
    }
  });

  app.post("/api/verify-otp", (req, res) => {
    const { email, otp } = req.body;

    const storedData = otpStore[email];

    if (!storedData) {
      return res.status(400).json({
        success: false,
        error: "No OTP found for this email",
      });
    }

    if (Date.now() > storedData.expires) {
      delete otpStore[email];
      return res.status(400).json({
        success: false,
        error: "OTP has expired",
      });
    }

    if (storedData.otp === otp) {
      delete otpStore[email]; // Clear OTP after successful verification
      return res.json({
        success: true,
        message: "OTP verified successfully",
      });
    }

    return res.status(400).json({
      success: false,
      error: "Invalid OTP",
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

startServer();
