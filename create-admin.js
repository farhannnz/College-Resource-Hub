const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// User Schema (inline for this script)
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['student', 'faculty', 'admin'],
    default: 'student'
  },
  department: {
    type: String,
    required: function() {
      return this.role === 'faculty' || this.role === 'student';
    }
  },
  studentId: {
    type: String,
    required: function() {
      return this.role === 'student';
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@college.edu' });
    
    if (existingAdmin) {
      console.log('Admin account already exists!');
      console.log('Email: admin@college.edu');
      console.log('Password: admin123');
      await mongoose.connection.close();
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 12);

    // Create admin user
    const admin = new User({
      name: 'Admin User',
      email: 'admin@college.edu',
      password: hashedPassword,
      role: 'admin',
      isActive: true
    });

    await admin.save();

    console.log('✅ Admin account created successfully!');
    console.log('-----------------------------------');
    console.log('Email: admin@college.edu');
    console.log('Password: admin123');
    console.log('-----------------------------------');
    console.log('You can now login at: http://localhost:3000/admin-login.html');

    await mongoose.connection.close();
    console.log('Database connection closed');
    
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();
