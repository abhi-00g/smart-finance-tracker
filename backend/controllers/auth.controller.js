const db = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validator = require("validator");

const User = db.User;

const validatePassword = (password) => {
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  return hasMinLength && hasUppercase && hasNumber && hasSpecial;
};

exports.register = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  if (!name || !email || !password || !confirmPassword) {
    return res.status(400).json({ message: "All fields are required." });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: "Invalid email format." });
  }

  if (!validatePassword(password)) {
    return res.status(400).json({
      message: "Password must include 1 uppercase, 1 number, and 1 special character."
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match." });
  }

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists with this email." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword
    });

    res.status(201).json({ message: "User registered successfully." });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) return res.status(400).json({ message: "Email and password required." });

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found." });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials." });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "2h" });

    res.status(200).json({
      message: "Login successful.",
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

exports.updatePassword = async (req, res) => {
    const { email, newPassword, confirmPassword } = req.body;
  
    if (!email || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "Email, new password and confirm password are required." });
    }
  
    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        message: "New password must be at least 8 characters and include 1 uppercase, 1 number, and 1 special character."
      });
    }
  
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }
  
    try {
      const user = await User.findOne({ where: { email } });
      if (!user) return res.status(404).json({ message: "User not found." });
  
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();
  
      res.status(200).json({ message: "Password updated successfully." });
    } catch (err) {
      console.error("Password update error:", err);
      res.status(500).json({ message: "Internal server error." });
    }
  };