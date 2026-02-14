const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send("Server is running 🚀");
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (email === "admin@gmail.com" && password === "1234") {
        res.json({ success: true, message: "Login successful ✅" });
    } else {
        res.json({ success: false, message: "Invalid credentials ❌" });
    }
});

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
