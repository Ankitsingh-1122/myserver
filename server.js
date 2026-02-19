// ================= IMPORTS =================
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("./models/User");

// ================= APP CONFIG =================
const app = express();
const PORT = process.env.PORT || 3000;

// ================= DEBUG ENV CHECK =================
console.log("========== ENV CHECK ==========");
console.log("MONGO_URI:", process.env.MONGO_URI);
console.log("JWT_SECRET:", process.env.JWT_SECRET);
console.log("================================");

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());

// ================= DATABASE CONNECTION =================
mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("MongoDB Connected ✅");
})
.catch((err) => {
    console.log("MongoDB Connection Error ❌");
    console.log(err.message);
});

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
            process.env.JWT_SECRET || "fallbackSecret",
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

// ================= START SERVER =================
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT} 🚀`);
});
