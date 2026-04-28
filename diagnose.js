const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('./src/models/User'); // register User schema first
const Post = require('./src/models/Post');
const Profile = require('./src/models/Profile');

mongoose.connect(process.env.DB_URL).then(async () => {
  const profile = await Profile.findOne({ handle: /jessicagarcia_1/ }).populate('user', 'name avatar');
  console.log('Profile found:', profile ? 'YES' : 'NO');
  if (profile) {
    const userId = profile.user._id;
    console.log('User ID in profile:', userId);
    console.log('User name:', profile.user.name);

    const posts = await Post.find({ user: userId });
    console.log('Posts for this user:', posts.length);

    const samplePosts = await Post.find({}).limit(5).select('user name text');
    console.log('\nSample post user IDs from DB:');
    samplePosts.forEach(p => console.log(' -', p.user.toString(), '|', p.name));
  }
  process.exit(0);
}).catch(e => { console.error(e.message); process.exit(1); });
