const db = require("../models/db");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");

// Register User
exports.register = async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  db.query(
    "INSERT INTO users (username, password) VALUES (?, ?)",
    [username, hashedPassword],
    (err, result) => {
      if (err)
        return res.status(500).json({ message: "Error registering user" });
      res.json({ message: "User registered successfully" });
    }
  );
};

// Login User
exports.login = (req, res) => {
  const { username, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    async (err, results) => {
      if (err) return res.status(500).json({ message: "Error logging in" });

      if (results.length === 0)
        return res.status(401).json({ message: "User not found" });

      const user = results[0];
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch)
        return res.status(401).json({ message: "Invalid credentials" });

      // Generate JWT token
      const token = generateToken(user);

      res.json({ token });
    }
  );
};
