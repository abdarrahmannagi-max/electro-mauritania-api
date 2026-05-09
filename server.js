const { Resend } = require("resend");

const resend = new Resend("re_7yWfbY9R_ch6ZXrq2ZXEVBNsqFKpFS6sE");

async function sendTestEmail() {
    try {
        const result = await resend.emails.send({
            from: "Electro <onboarding@resend.dev>",
            to: "abdarrahman205@gmail.com",
            subject: "Hello World",
            html: "<p>Congrats on sending your <strong>first email</strong>!</p>"
        });

        console.log("EMAIL SENT SUCCESSFULLY:", result);

    } catch (err) {
        console.error("EMAIL ERROR:", err);
    }
}

sendTestEmail();
