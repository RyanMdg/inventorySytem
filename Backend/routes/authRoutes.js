const express = require("express");
const { register, login } = require("../controllers/authController");
const verifyToken = require("../middleware/authMidlleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", verifyToken, (req, res) => {
  res.json({ message: "Protected route", user: req.user });
});

module.exports = router;
