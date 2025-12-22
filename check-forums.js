const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Forum = require('./models/Forum');

async function checkForums() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const allForums = await Forum.find({}).populate('author', 'name role department');
    
    console.log('\n========================================');
    console.log(`Total Forum Posts in Database: ${allForums.length}`);
    console.log('========================================\n');

    if (allForums.length === 0) {
      console.log('No forum posts found in database.');
    } else {
      allForums.forEach((forum, index) => {
        console.log(`Forum Post ${index + 1}:`);
        console.log(`  Title: ${forum.title}`);
        console.log(`  Category: ${forum.category}`);
        console.log(`  Subject: ${forum.subject || 'N/A'}`);
        console.log(`  Author: ${forum.author?.name} (${forum.author?.role})`);
        console.log(`  Views: ${forum.views}`);
        console.log(`  Replies: ${forum.replies.length}`);
        console.log(`  Likes: ${forum.likes.length}`);
        console.log(`  Is Pinned: ${forum.isPinned}`);
        console.log(`  Is Resolved: ${forum.isResolved}`);
        console.log(`  Created: ${forum.createdAt}`);
        console.log('-----------------------------------\n');
      });
    }

    await mongoose.connection.close();
    console.log('Database connection closed');
    
  } catch (error) {
    console.error('Error checking forums:', error);
    process.exit(1);
  }
}

checkForums();
