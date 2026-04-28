const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const gravatar = require('gravatar');
const User = require('../models/User');

/**
 * @desc    Register a new user
 * @route   POST /api/users/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ errors: [{ msg: 'Email already registered' }] });
    }

    // Get Gravatar avatar
    const avatar = gravatar.url(email, {
      s: '200',
      r: 'pg',
      d: 'mm',
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ name, email, password: hashedPassword, avatar });
    const savedUser = await newUser.save();

    // Return user without password
    const userResponse = {
      id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
      avatar: savedUser.avatar,
    };

    res.status(201).json(userResponse);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Login user and return JWT
 * @route   POST /api/users/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ errors: [{ msg: 'Invalid credentials' }] });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
    }

    // Build JWT payload
    const payload = { id: user.id, name: user.name, avatar: user.avatar };

    const token = jwt.sign(payload, process.env.SECRET_OR_KEY, { expiresIn: '7d' });

    res.json({ success: true, token });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get current authenticated user
 * @route   GET /api/users/current
 * @access  Private
 */
const getCurrentUser = (req, res) => {
  res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    avatar: req.user.avatar,
  });
};

module.exports = { register, login, getCurrentUser };
