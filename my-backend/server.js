require("dotenv").config(); // Load environment variables

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Serve static files from the 'uploads' directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB Atlas URI from environment variable
const uri = process.env.MONGODB_URI;

// Connect to MongoDB
mongoose
  .connect(uri)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1); // Exit the process if connection fails
  });

// Define a User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  image: { type: String },
});

const User = mongoose.model("User", userSchema);

// Configure Multer
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = "uploads/";
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir);
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
    },
  }),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB file size limit
});

// Registration Route
app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  try {
    // Check if the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send("Email already in use");
    }

    const user = new User({ email, password }); // Store plaintext password
    await user.save();
    res.status(201).send("User registered");
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).send("Error registering user");
  }
});

// Login Route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && password === user.password) {
      // Compare plaintext passwords
      const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      res.json({ token }); // Send token in response
    } else {
      res.status(401).send("Invalid email or password");
    }
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).send("Error logging in");
  }
});

// Fetch User Route
app.get("/user", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email }).select(
      "email password image"
    );
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(401).json({ error: "Invalid token" });
  }
});

// Upload Image Route
app.post("/upload-image", upload.single("image"), async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).send("Unauthorized");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });

    if (user) {
      user.image = req.file.path; // Save the file path in the user's record
      await user.save();
      res.json({ image: user.image });
    } else {
      res.status(404).send("User not found");
    }
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).send("Error uploading image");
  }
});

// Update Route
app.put("/update", async (req, res) => {
    const { email, newEmail, newPassword, newImage } = req.body;
    try {
      const user = await User.findOne({ email });
      if (user) {
        if (newEmail) {
          user.email = newEmail;
          // Optionally, invalidate old token here
        }
        if (newPassword) user.password = newPassword; // Ensure hashed password
        if (newImage) user.image = newImage;
        await user.save();
        // Generate new token if email is updated
        const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: "User updated", token });
      } else {
        res.status(404).json({ error: "User not found" });
      }
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Error updating user" });
    }
  });
  

// Start the Server
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
