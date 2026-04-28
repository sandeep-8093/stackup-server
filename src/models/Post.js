const mongoose = require('mongoose');

const AttachmentSchema = new mongoose.Schema({
  url:          { type: String, required: true },
  publicId:     { type: String },
  resourceType: { type: String, default: 'image' }, // 'image' or 'raw'
  originalName: { type: String },
  size:         { type: Number },
  format:       { type: String },
}, { _id: false });

const PostSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    text: {
      type: String,
      required: [true, 'Post text is required'],
      trim: true,
      minlength: [2, 'Post must be at least 2 characters'],
      maxlength: [1000, 'Post cannot exceed 1000 characters'],
    },
    name: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
    },
    tags: {
      type: [String],
      default: [],
    },
    attachments: {
      type: [AttachmentSchema],
      default: [],
    },
    likes: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'users',
        },
      },
    ],
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'users',
        },
        text: {
          type: String,
          required: true,
          trim: true,
        },
        name: {
          type: String,
          trim: true,
        },
        avatar: {
          type: String,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Text index for fast full-text search
PostSchema.index({ text: 'text', name: 'text' });

module.exports = mongoose.model('post', PostSchema);
