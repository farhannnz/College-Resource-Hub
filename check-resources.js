const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Resource = require('./models/Resource');

async function checkResources() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const allResources = await Resource.find({}).populate('uploadedBy', 'name role');
    
    console.log('\n========================================');
    console.log(`Total Resources in Database: ${allResources.length}`);
    console.log('========================================\n');

    if (allResources.length === 0) {
      console.log('No resources found in database.');
    } else {
      allResources.forEach((resource, index) => {
        console.log(`Resource ${index + 1}:`);
        console.log(`  Title: ${resource.title}`);
        console.log(`  Category: ${resource.category}`);
        console.log(`  Department: ${resource.department}`);
        console.log(`  Subject: ${resource.subject}`);
        console.log(`  Semester: ${resource.semester}`);
        console.log(`  Uploaded By: ${resource.uploadedBy?.name} (${resource.uploadedBy?.role})`);
        console.log(`  Is Approved: ${resource.isApproved}`);
        console.log(`  File: ${resource.fileName}`);
        console.log(`  Created: ${resource.createdAt}`);
        console.log('-----------------------------------\n');
      });
    }

    // Check approved resources only
    const approvedResources = await Resource.find({ isApproved: true });
    console.log(`Approved Resources: ${approvedResources.length}`);
    console.log(`Unapproved Resources: ${allResources.length - approvedResources.length}`);

    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
    
  } catch (error) {
    console.error('Error checking resources:', error);
    process.exit(1);
  }
}

checkResources();
