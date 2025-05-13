const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id: id }, process.env.JWT_SECRET, { expiresIn: "1h" });
}

// Register User
exports.registerUser = async (req, res) => {
    const { fullName, email, password, profileUrl } = req.body;

    // Validation: Check for missing fields
    if (!fullName || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        // Hash the password before saving it
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the user
        const user = await User.create({
            fullName,
            email,
            password: hashedPassword,  // Store the hashed password
            profileUrl,
        });

        // Generate a token
        const token = generateToken(user._id);

        // Send the response with user and token
        res.status(201).json({
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                profileUrl: user.profileUrl
            },
            token,
        });
    } catch (err) {
        console.error(err);  // Log the error for debugging
        res.status(500).json({ message: "Something went wrong. Please try again later." });
    }
}

// Login User
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    // Validation: Check for missing fields
    if (!email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        res.status(200).json({ 
            id: user._id,
            user,
            token: generateToken(user._id),    
        });
    } catch (err) {
        console.error(err);  // Log the error for debugging
        res.status(500).json({ message: "Error logging in user", error: err.message });
    }
}

// Get User Info
exports.getUserInfo = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user);
    } catch (err) {
        console.error(err);  // Log the error for debugging
        res.status(500).json({ message: "Error fetching user", error: err.message });
    }
}
