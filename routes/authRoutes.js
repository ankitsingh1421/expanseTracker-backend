

const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { registerUser, loginUser, getUserInfo } = require("../controllers/authController");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

// User routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/getUser", protect, getUserInfo);

// Upload route
router.post('/upload-image', upload.single("image"), (req, res) => {
    console.log("→ multer req.file:", req.file); // Debugging: check upload

    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }

    // Make sure the image URL points to the correct location
    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    res.status(200).json({ imageUrl });
});

module.exports = router;
