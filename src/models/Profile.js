const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
      unique: true,
    },
    handle: {
      type: String,
      required: [true, 'Handle is required'],
      unique: true,
      trim: true,
      maxlength: [40, 'Handle cannot exceed 40 characters'],
    },
    company: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      trim: true,
    },
    skills: {
      type: [String],
      required: [true, 'At least one skill is required'],
    },
    bio: {
      type: String,
      trim: true,
    },
    yearsOfExperience: {
      type: Number,
      min: 0,
    },
    interests: {
      type: [String],
    },
    resumeLink: {
      type: String,
      trim: true,
    },
    languages: {
      type: [String],
    },
    githubusername: {
      type: String,
      trim: true,
    },
    experience: [
      {
        title: { type: String, required: true, trim: true },
        company: { type: String, required: true, trim: true },
        location: { type: String, trim: true },
        from: { type: Date },
        to: { type: Date },
        current: { type: Boolean, default: false },
        description: { type: String, trim: true },
      },
    ],
    education: [
      {
        school: { type: String, required: true, trim: true },
        degree: { type: String, required: true, trim: true },
        fieldofstudy: { type: String, required: true, trim: true },
        from: { type: Date },
        to: { type: Date },
        current: { type: Boolean, default: false },
        description: { type: String, trim: true },
      },
    ],
    social: {
      youtube: { type: String, trim: true },
      twitter: { type: String, trim: true },
      facebook: { type: String, trim: true },
      linkedin: { type: String, trim: true },
      instagram: { type: String, trim: true },
    },
  },
  { timestamps: true } // auto-adds createdAt and updatedAt
);

module.exports = mongoose.model('profile', ProfileSchema);
