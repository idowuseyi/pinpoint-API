// Required packages
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// MongoDB connection
mongoose.connect('mongodb://localhost/pinpointDB', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

// User schema
const userSchema = new mongoose.Schema({
    firstname: String,
    lastname: String,
    username: { type: string, unique: true },
    DOB: { type: Number },
    state: String,
    city: String,
    email: { type: String, unique: true },
    password: String,
    isVerified: { type: Boolean, default: false },
    resetToken: String,
    resetTokenExpiration: Date
});

// Partner schema
const partnerSchema = new mongoose.Schema({
    businessLegalName: String,
    username: { type: string, unique: true },
    firstname: String,
    lastname: String,
    businessPhysicalAddress: String,
    state: String,
    city: String,
    category: String,
    email: { type: String, unique: true },
    password: String,
    isVerified: { type: Boolean, default: false },
    resetToken: String,
    resetTokenExpiration: Date
});

const User = mongoose.model('User', userSchema);

// Express setup
const app = express();
app.use(bodyParser.json());

// Register endpoint
app.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const user = new User({ email, password: hashedPassword });
        await user.save();

        return res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Login endpoint
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, 'secretKey', { expiresIn: '1h' });

        return res.status(200).json({ token });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Verify email endpoint (for email verification)
app.get('/verify/:token', async (req, res) => {
    try {
        const token = req.params.token;
        const user = await User.findOneAndUpdate(
            { resetToken: token, resetTokenExpiration: { $gt: Date.now() } },
            { $set: { isVerified: true }, $unset: { resetToken: '', resetTokenExpiration: '' } }
        );

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        return res.status(200).json({ message: 'Email verified successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Forgot password endpoint
app.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Generate reset token
        const resetToken = jwt.sign({ userId: user._id }, 'resetSecretKey', { expiresIn: '1h' });

        // Set reset token and expiration
        user.resetToken = resetToken;
        user.resetTokenExpiration = Date.now() + 3600000; // 1 hour
        await user.save();

        // Send reset password email (using nodemailer)
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'your_email@gmail.com',
                pass: 'your_email_password'
            }
        });

        const mailOptions = {
            from: 'your_email@gmail.com',
            to: email,
            subject: 'Reset Password',
            text: `Click the following link to reset your password: http://localhost:3000/reset/${resetToken}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return res.status(500).json({ message: 'Failed to send email for password reset' });
            }
            return res.status(200).json({ message: 'Email sent for password reset' });
        });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Reset password endpoint
app.post('/reset-password/:token', async (req, res) => {
    try {
        const token = req.params.token;
        const { newPassword } = req.body;

        // Decode reset token
        const decodedToken = jwt.verify(token, 'resetSecretKey');

        // Find user by decoded token
        const user = await User.findById(decodedToken.userId);

        if (!user) {
            return res.status(400).json({ message: 'Invalid token' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user password
        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
