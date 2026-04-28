const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { profileRules, experienceRules, educationRules } = require('../validators/profile.validator');
const {
  getMyProfile,
  getProfileByHandle,
  getAllProfiles,
  getProfileByUserId,
  createOrUpdateProfile,
  addExperience,
  deleteExperience,
  addEducation,
  deleteEducation,
  deleteProfile,
} = require('../controllers/profile.controller');

// @route   GET /api/profile
// @access  Private
router.get('/', protect, getMyProfile);

// @route   GET /api/profile/all?search=
// @access  Public
router.get('/all', getAllProfiles);

// @route   GET /api/profile/handle/:handle
// @access  Public
router.get('/handle/:handle', getProfileByHandle);

// @route   GET /api/profile/user/:user_id
// @access  Public
router.get('/user/:user_id', getProfileByUserId);

// @route   POST /api/profile
// @access  Private
router.post('/', protect, profileRules, validate, createOrUpdateProfile);

// @route   POST /api/profile/experience
// @access  Private
router.post('/experience', protect, experienceRules, validate, addExperience);

// @route   DELETE /api/profile/experience/:exp_id
// @access  Private
router.delete('/experience/:exp_id', protect, deleteExperience);

// @route   POST /api/profile/education
// @access  Private
router.post('/education', protect, educationRules, validate, addEducation);

// @route   DELETE /api/profile/education/:edu_id
// @access  Private
router.delete('/education/:edu_id', protect, deleteEducation);

// @route   DELETE /api/profile
// @access  Private
router.delete('/', protect, deleteProfile);

module.exports = router;
