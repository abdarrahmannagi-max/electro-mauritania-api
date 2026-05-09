const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("SERVER IS WORKING");
});

app.post("/api/send-otp", (req, res) => {
    console.log("OTP REQUEST RECEIVED");
    res.json({ success: true, message: "OK" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Server running on port", PORT);
});
