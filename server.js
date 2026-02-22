// ================= IMPORTS =================
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const User = require("./models/User");

// ================= APP CONFIG =================
const app = express();
const PORT = process.env.PORT || 3000;

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());

// ================= GEMINI CONFIG =================
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ================= TEST ROUTE =================
app.get("/", (req, res) => {
    res.send("Server is running 🚀");
});

// ================= REGISTER ROUTE =================
app.post("/register", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and Password required"
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            email,
            password: hashedPassword
        });

        await newUser.save();

        res.status(201).json({
            success: true,
            message: "Registered successfully ✅"
        });

    } catch (error) {
        console.log("Register Error:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

// ================= LOGIN ROUTE =================
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials ❌"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials ❌"
            });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.status(200).json({
            success: true,
            message: "Login successful ✅",
            token
        });

    } catch (error) {
        console.log("Login Error:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

// ================= AI HELPER ROUTE =================
app.post("/helper", async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({
                error: "Message required"
            });
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash-latest"
        });

        const result = await model.generateContent(message);
        const response = await result.response;
        const text = response.text();

        res.json({ reply: text });

    } catch (error) {
        console.error("Gemini Error:", error);
        res.status(500).json({
            error: "AI failed"
        });
    }
});

// ================= DATABASE CONNECTION + SERVER START =================
mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000
})
.then(() => {
    console.log("MongoDB Connected ✅");

    app.listen(PORT, () => {
        console.log(`Server started on port ${PORT} 🚀`);
    });

})
.catch((err) => {
    console.log("MongoDB Connection Error ❌");
    console.log(err);
});