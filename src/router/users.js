const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { registerRules, loginRules } = require('../validators/auth.validator');
const { register, login, getCurrentUser } = require('../controllers/auth.controller');

// @route   GET /api/users/test
// @access  Public
router.get('/test', (req, res) => res.json({ msg: 'Users route working' }));

// @route   POST /api/users/register
// @access  Public
router.post('/register', registerRules, validate, register);

// @route   POST /api/users/login
// @access  Public
router.post('/login', loginRules, validate, login);

// @route   GET /api/users/current
// @access  Private
router.get('/current', protect, getCurrentUser);

module.exports = router;