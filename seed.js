const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const gravatar = require('gravatar');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const User = require('./src/models/User');
const Profile = require('./src/models/Profile');
const Post = require('./src/models/Post');

const connectDB = require('./src/config/db');

// Sample Tech Data Arrays
const firstNames = ['Alex', 'Sarah', 'Michael', 'Emma', 'David', 'Jessica', 'James', 'Lisa', 'Robert', 'Jennifer', 'William', 'Maria', 'Joseph', 'Michelle', 'John', 'Laura', 'Thomas', 'Kimberly', 'Daniel', 'Emily'];
const lastNames = ['Chen', 'Smith', 'Johnson', 'Gupta', 'Patel', 'Williams', 'Kim', 'Garcia', 'Martinez', 'Lee'];
const companies = ['Google', 'Microsoft', 'Amazon', 'Meta', 'Netflix', 'Apple', 'Stripe', 'Vercel', 'Supabase', 'OpenAI', 'Startup Inc', 'Freelance'];
const skillsPool = ['JavaScript', 'TypeScript', 'React', 'Angular', 'Vue', 'Node.js', 'Python', 'Java', 'C++', 'Go', 'Rust', 'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'MongoDB', 'PostgreSQL', 'Redis', 'GraphQL'];
const statuses = ['Developer', 'Junior Developer', 'Senior Developer', 'Manager', 'Student or Learning', 'Instructor or Teacher', 'Intern', 'Other'];

const postTemplates = [
  "Just deployed my first {tech} cluster in production. It was simpler than expected!",
  "Is anyone else struggling with {tech} state management? Finding it overly complex.",
  "I firmly believe that {tech} is the future of web development. Thoughts?",
  "Refactored a legacy codebase from {tech} to {tech2} today. The performance gains are insane.",
  "Can someone recommend a good course for advanced {tech} patterns?",
  "Spent 4 hours debugging only to realize I missed a comma in my {tech} config file. 😭",
  "The new updates to {tech} make {tech2} integrations so much smoother.",
  "Why do people hype {tech} so much? I still prefer {tech2}.",
  "Writing tests for {tech} components is my new favorite activity. CI/CD pipelines are green!",
  "Just gave a talk about scaling {tech} microservices. Thanks to everyone who attended!",
  "What is the best alternative to {tech} for a new startup in 2026?",
  "I'm migrating a monolithic app to {tech} backend with an {tech2} frontend.",
  "Pro tip: Always check your {tech} memory leaks before pushing to production.",
  "Finally mastered Dockerizing my {tech} applications. Game changer.",
  "Looking for open-source {tech} projects to contribute to. Any recommendations?"
];

// Helper to get random item from array
const random = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomSkills = () => {
    const num = Math.floor(Math.random() * 5) + 2; // 2 to 6 skills
    const skills = new Set();
    while (skills.size < num) skills.add(random(skillsPool));
    return Array.from(skills);
};

const seedData = async () => {
  try {
    await connectDB();
    console.log('MongoDB Connected for Seeding...');

    const createdUsers = [];
    
    // 1. Create 20 Users and Profiles
    console.log('Generating 20 Tech Users & Profiles...');
    for (let i = 0; i < 20; i++) {
      const name = `${random(firstNames)} ${random(lastNames)}`;
      // Make email unique by adding index and timestamp
      const email = `${name.toLowerCase().replace(' ', '.')}._${i}_${Date.now()}@example.com`;
      const password = await bcrypt.hash('password123', 10);
      const avatar = gravatar.url(email, { s: '200', r: 'pg', d: 'identicon' });

      const user = new User({ name, email, password, avatar });
      const savedUser = await user.save();
      createdUsers.push(savedUser);

      const profile = new Profile({
        user: savedUser._id,
        handle: `${name.toLowerCase().replace(' ', '')}_${i}`,
        company: random(companies),
        website: `https://${name.toLowerCase().replace(' ', '')}.dev`,
        location: 'Remote',
        status: random(statuses),
        skills: randomSkills(),
        bio: `Passionate ${random(skillsPool)} developer building cool things for the web.`,
        githubusername: `${name.toLowerCase().replace(' ', '')}dev`
      });
      await profile.save();
    }

    // 2. Create 50 Posts
    console.log('Generating 50 Tech Posts...');
    for (let i = 0; i < 50; i++) {
        const randomUser = random(createdUsers);
        
        let text = random(postTemplates);
        const tech1 = random(skillsPool);
        let tech2 = random(skillsPool);
        while(tech1 === tech2) tech2 = random(skillsPool); // Ensure different

        text = text.replace(/{tech}/g, tech1).replace(/{tech2}/g, tech2);

        // Extract some tags from text if matched, otherwise add randomly
        const potentialTags = [tech1, tech2];
        const tags = Array.from(new Set(potentialTags));

        // Create random likes from the generated users (0 to 5 likes)
        const likesCount = Math.floor(Math.random() * 6);
        const likes = [];
        const likeUsersSet = new Set();
        while (likes.length < likesCount) {
            const liker = random(createdUsers);
            if (!likeUsersSet.has(liker._id.toString())) {
                likeUsersSet.add(liker._id.toString());
                likes.push({ user: liker._id });
            }
        }

        // Create comments (0 to 3 comments)
        const commentsCount = Math.floor(Math.random() * 4);
        const comments = [];
        for (let j = 0; j < commentsCount; j++) {
            const commenter = random(createdUsers);
            comments.push({
                user: commenter._id,
                text: `I totally agree about ${tech1}! Good post.`,
                name: commenter.name,
                avatar: commenter.avatar,
                createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000))
            });
        }

        const post = new Post({
            user: randomUser._id,
            text,
            name: randomUser.name,
            avatar: randomUser.avatar,
            tags,
            likes,
            comments
        });

        // Set random past date within last 30 days so feed isn't all exact same timestamp
        const randomDate = new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000));
        post.createdAt = randomDate;
        post.updatedAt = randomDate;

        await post.save();
    }

    console.log('✅ Successfully added 20 users/profiles and 50 posts!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
