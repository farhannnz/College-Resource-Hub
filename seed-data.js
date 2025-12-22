const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Announcement = require('./models/Announcement');
const Forum = require('./models/Forum');

async function seedData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create admin if doesn't exist
    let admin = await User.findOne({ email: 'admin@college.edu' });
    if (!admin) {
      const hashedPassword = await bcrypt.hash('admin123', 12);
      admin = await User.create({
        name: 'Admin User',
        email: 'admin@college.edu',
        password: hashedPassword,
        role: 'admin',
        isActive: true
      });
      console.log('✅ Admin created');
    } else {
      console.log('✅ Admin already exists');
    }

    // Create faculty if doesn't exist
    let faculty = await User.findOne({ email: 'faculty@college.edu' });
    if (!faculty) {
      const hashedPassword = await bcrypt.hash('faculty123', 12);
      faculty = await User.create({
        name: 'Faculty Member',
        email: 'faculty@college.edu',
        password: hashedPassword,
        role: 'faculty',
        department: 'Computer Engineering',
        isActive: true
      });
      console.log('✅ Faculty created');
    } else {
      console.log('✅ Faculty already exists');
    }

    // Create student if doesn't exist
    let student = await User.findOne({ email: 'student@college.edu' });
    if (!student) {
      const hashedPassword = await bcrypt.hash('student123', 12);
      student = await User.create({
        name: 'Test Student',
        email: 'student@college.edu',
        password: hashedPassword,
        role: 'student',
        department: 'Computer Engineering',
        studentId: 'STU001',
        isActive: true
      });
      console.log('✅ Student created');
    } else {
      console.log('✅ Student already exists');
    }

    // Create sample announcements
    const announcementCount = await Announcement.countDocuments();
    if (announcementCount === 0) {
      await Announcement.create([
        {
          title: 'Welcome to College Resource Hub',
          content: 'Welcome to our new platform! Here you can access study materials, announcements, and participate in discussions.',
          category: 'general',
          priority: 'high',
          targetAudience: ['all'],
          department: 'all',
          createdBy: admin._id,
          isActive: true
        },
        {
          title: 'Mid-Term Examinations Schedule',
          content: 'Mid-term examinations will be conducted from next week. Please check your department notice boards for detailed schedules.',
          category: 'academic',
          priority: 'urgent',
          targetAudience: ['students'],
          department: 'all',
          createdBy: faculty._id,
          isActive: true
        },
        {
          title: 'Technical Workshop on AI/ML',
          content: 'Join us for an exciting workshop on Artificial Intelligence and Machine Learning. Date: Next Saturday, Time: 10 AM - 4 PM',
          category: 'events',
          priority: 'medium',
          targetAudience: ['all'],
          department: 'Computer Engineering',
          createdBy: faculty._id,
          isActive: true
        }
      ]);
      console.log('✅ Sample announcements created');
    } else {
      console.log('✅ Announcements already exist');
    }

    // Create sample forum posts
    const forumCount = await Forum.countDocuments();
    if (forumCount === 0) {
      await Forum.create([
        {
          title: 'Best resources for learning Data Structures?',
          content: 'Hi everyone! I\'m looking for good resources to learn Data Structures and Algorithms. Any recommendations?',
          category: 'academic',
          subject: 'Computer Science',
          author: student._id,
          views: 15,
          likes: [],
          replies: []
        },
        {
          title: 'Study Group for Mathematics',
          content: 'Looking to form a study group for Mathematics. Anyone interested can join us every weekend.',
          category: 'general',
          subject: 'Mathematics',
          author: student._id,
          views: 8,
          likes: [],
          replies: []
        },
        {
          title: 'Career Guidance Session',
          content: 'We are organizing a career guidance session next month. Industry experts will share their experiences.',
          category: 'career',
          author: faculty._id,
          views: 25,
          likes: [],
          replies: [],
          isPinned: true
        }
      ]);
      console.log('✅ Sample forum posts created');
    } else {
      console.log('✅ Forum posts already exist');
    }

    console.log('\n========================================');
    console.log('✅ Database seeded successfully!');
    console.log('========================================');
    console.log('\nTest Accounts:');
    console.log('-----------------------------------');
    console.log('ADMIN:');
    console.log('  Email: admin@college.edu');
    console.log('  Password: admin123');
    console.log('  Login: http://localhost:3000/admin-login.html');
    console.log('\nFACULTY:');
    console.log('  Email: faculty@college.edu');
    console.log('  Password: faculty123');
    console.log('  Login: http://localhost:3000/login.html');
    console.log('\nSTUDENT:');
    console.log('  Email: student@college.edu');
    console.log('  Password: student123');
    console.log('  Login: http://localhost:3000/login.html');
    console.log('========================================\n');

    await mongoose.connection.close();
    console.log('Database connection closed');
    
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedData();
