const passport = require('passport');

/**
 * Middleware to protect private routes using JWT.
 * Usage: router.get('/route', protect, controller)
 */
const protect = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized: No valid token provided' });
    }
    req.user = user;
    return next();
  })(req, res, next);
};

module.exports = { protect };
