const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Load models
const User = require('./models/User');
const Post = require('./models/Post');


// Load data
const users = require('./data/users');
const posts = require('./data/posts');

// Connect to DB
connectDB();

// Import data into DB
const importData = async () => {
  try {
    // Clear existing data to prevent duplicates
    await User.deleteMany();
    await Post.deleteMany();

    // Insert new users. The password will be hashed automatically by the pre-save hook in the User model.
    await User.create(users);
    console.log('Default users (admin, manager) have been successfully created!');

    // Insert posts
    await Post.create(posts);
    console.log('Sample posts have been successfully created!');

    process.exit();
  } catch (error) {
    // Fix: Corrected typo from console.errorj to console.error
    console.error(`Error seeding data: ${error}`);
    process.exit(1);
  }
};

// Destroy data from DB
const destroyData = async () => {
  try {
    await User.deleteMany();
    await Post.deleteMany();
    console.log('All user and post data has been destroyed!');
    process.exit();
  } catch (error) {
    console.error(`Error destroying data: ${error}`);
    process.exit(1);
  }
};

// Check for command line arguments to run either import or destroy
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}