const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Forum = require('./models/Forum');

async function fixForumAuthors() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get admin user
    const admin = await User.findOne({ email: 'admin@college.edu' });
    
    if (!admin) {
      console.log('Admin user not found. Please run seed-data.js first.');
      await mongoose.connection.close();
      return;
    }

    // Find all forums
    const forums = await Forum.find({});
    
    console.log(`\nFound ${forums.length} forum posts`);
    
    let fixedCount = 0;
    
    for (const forum of forums) {
      // Check if author exists
      const authorExists = await User.findById(forum.author);
      
      if (!authorExists) {
        console.log(`Fixing forum: "${forum.title}" - assigning to admin`);
        forum.author = admin._id;
        await forum.save();
        fixedCount++;
      }
    }
    
    console.log(`\n✅ Fixed ${fixedCount} forum posts with missing authors`);
    console.log(`✅ All forum posts now have valid authors`);

    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
    
  } catch (error) {
    console.error('Error fixing forum authors:', error);
    process.exit(1);
  }
}

fixForumAuthors();
