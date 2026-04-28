const { body } = require('express-validator');

const profileRules = [
  body('handle')
    .trim()
    .notEmpty().withMessage('Profile handle is required')
    .isLength({ min: 2, max: 40 }).withMessage('Handle must be between 2 and 40 characters'),

  body('status')
    .trim()
    .notEmpty().withMessage('Status is required'),

  body('website')
    .optional({ checkFalsy: true })
    .trim()
    .isURL().withMessage('Website must be a valid URL'),

  body('youtube')
    .optional({ checkFalsy: true })
    .trim()
    .isURL().withMessage('YouTube must be a valid URL'),

  body('twitter')
    .optional({ checkFalsy: true })
    .trim()
    .isURL().withMessage('Twitter must be a valid URL'),

  body('facebook')
    .optional({ checkFalsy: true })
    .trim()
    .isURL().withMessage('Facebook must be a valid URL'),

  body('linkedin')
    .optional({ checkFalsy: true })
    .trim()
    .isURL().withMessage('LinkedIn must be a valid URL'),

  body('instagram')
    .optional({ checkFalsy: true })
    .trim()
    .isURL().withMessage('Instagram must be a valid URL'),
];

const experienceRules = [
  body('title')
    .trim()
    .notEmpty().withMessage('Job title is required'),

  body('company')
    .trim()
    .notEmpty().withMessage('Company is required'),

  body('from')
    .notEmpty().withMessage('From date is required')
    .isISO8601().withMessage('From date must be a valid date'),
];

const educationRules = [
  body('school')
    .trim()
    .notEmpty().withMessage('School is required'),

  body('degree')
    .trim()
    .notEmpty().withMessage('Degree is required'),

  body('fieldofstudy')
    .trim()
    .notEmpty().withMessage('Field of study is required'),

  body('from')
    .notEmpty().withMessage('From date is required')
    .isISO8601().withMessage('From date must be a valid date'),
];

module.exports = { profileRules, experienceRules, educationRules };
