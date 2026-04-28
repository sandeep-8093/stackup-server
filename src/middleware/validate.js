const { validationResult } = require('express-validator');

/**
 * Middleware that checks express-validator results.
 * Place after validator rule arrays in route definitions.
 * Short-circuits with 400 if validation fails.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = validate;
