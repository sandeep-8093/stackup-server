const { body } = require('express-validator');

const postRules = [
  body('text')
    .trim()
    .notEmpty().withMessage('Post text is required')
    .isLength({ min: 2, max: 1000 }).withMessage('Post text must be between 2 and 1000 characters'),
];

const commentRules = [
  body('text')
    .trim()
    .notEmpty().withMessage('Comment text is required')
    .isLength({ min: 1, max: 500 }).withMessage('Comment must be between 1 and 500 characters'),
];

module.exports = { postRules, commentRules };
