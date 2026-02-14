const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send("Server is running 🚀");
});

app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`);
});
app.use(express.json());

app.post('/login', (req, res) => {

    const { email, password } = req.body;

    if (email === "admin@gmail.com" && password === "1234") {
        res.json({ success: true, message: "Login successful ✅" });
    } else {
        res.json({ success: false, message: "Invalid credentials ❌" });
    }
});
