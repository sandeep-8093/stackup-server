const Profile = require('../models/Profile');
const User = require('../models/User');

/**
 * @desc    Get current user's profile
 * @route   GET /api/profile
 * @access  Private
 */
const getMyProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate('user', [
      'name',
      'avatar',
      'email',
    ]);

    if (!profile) {
      return res.status(404).json({ message: 'No profile found for this user' });
    }

    res.json(profile);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get profile by handle
 * @route   GET /api/profile/handle/:handle
 * @access  Public
 */
const getProfileByHandle = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ handle: req.params.handle }).populate('user', [
      'name',
      'avatar',
      'email',
    ]);

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json(profile);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get all profiles with optional search
 * @route   GET /api/profile/all?search=
 * @access  Public
 */
const getAllProfiles = async (req, res, next) => {
  try {
    let query = {};

    if (req.query.search) {
      const regex = new RegExp(req.query.search, 'i');
      query = {
        $or: [
          { status: { $regex: regex } },
          { company: { $regex: regex } },
          { location: { $regex: regex } },
          { skills: { $elemMatch: { $regex: regex } } },
        ],
      };
    }

    const profiles = await Profile.find(query).populate('user', ['name', 'avatar', 'email']);
    res.json(profiles);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get profile by user ID
 * @route   GET /api/profile/user/:user_id
 * @access  Public
 */
const getProfileByUserId = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', [
      'name',
      'avatar',
      'email',
    ]);

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json(profile);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create or update user profile
 * @route   POST /api/profile
 * @access  Private
 */
const createOrUpdateProfile = async (req, res, next) => {
  try {
    const {
      handle, company, website, location, bio, status, githubusername,
      youtube, twitter, facebook, linkedin, instagram, skills,
      yearsOfExperience, interests, resumeLink, languages,
    } = req.body;

    const profileFields = {
      user: req.user.id,
      handle,
      status,
      social: {},
    };

    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (githubusername) profileFields.githubusername = githubusername;
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;
    if (skills) {
      profileFields.skills = Array.isArray(skills)
        ? skills
        : skills.split(',').map((s) => s.trim()).filter(Boolean);
    }
    if (yearsOfExperience !== undefined && yearsOfExperience !== null) {
      profileFields.yearsOfExperience = Number(yearsOfExperience);
    }
    if (resumeLink) profileFields.resumeLink = resumeLink;
    if (interests) {
      profileFields.interests = Array.isArray(interests)
        ? interests
        : interests.split(',').map((s) => s.trim()).filter(Boolean);
    }
    if (languages) {
      profileFields.languages = Array.isArray(languages)
        ? languages
        : languages.split(',').map((s) => s.trim()).filter(Boolean);
    }

    const profile = await Profile.findOneAndUpdate(
      { user: req.user.id },
      { $set: profileFields },
      { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true },
    );

    res.json(profile);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Add experience to profile
 * @route   POST /api/profile/experience
 * @access  Private
 */
const addExperience = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found. Please create a profile first.' });
    }

    const newExp = {
      title: req.body.title,
      company: req.body.company,
      location: req.body.location,
      from: req.body.from,
      to: req.body.to,
      current: req.body.current,
      description: req.body.description,
    };

    profile.experience.unshift(newExp);
    await profile.save();
    res.status(201).json(profile);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete experience from profile
 * @route   DELETE /api/profile/experience/:exp_id
 * @access  Private
 */
const deleteExperience = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    profile.experience = profile.experience.filter(
      (exp) => exp._id.toString() !== req.params.exp_id,
    );

    await profile.save();
    res.json(profile);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Add education to profile
 * @route   POST /api/profile/education
 * @access  Private
 */
const addEducation = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found. Please create a profile first.' });
    }

    const newEdu = {
      school: req.body.school,
      degree: req.body.degree,
      fieldofstudy: req.body.fieldofstudy,
      from: req.body.from,
      to: req.body.to,
      current: req.body.current,
      description: req.body.description,
    };

    profile.education.unshift(newEdu);
    await profile.save();
    res.status(201).json(profile);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete education from profile
 * @route   DELETE /api/profile/education/:edu_id
 * @access  Private
 */
const deleteEducation = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    profile.education = profile.education.filter(
      (edu) => edu._id.toString() !== req.params.edu_id,
    );

    await profile.save();
    res.json(profile);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete profile and user account
 * @route   DELETE /api/profile
 * @access  Private
 */
const deleteProfile = async (req, res, next) => {
  try {
    await Promise.all([
      Profile.findOneAndDelete({ user: req.user.id }),
      User.findByIdAndDelete(req.user.id),
    ]);

    res.json({ message: 'User and profile deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
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
};
