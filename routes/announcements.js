const express = require('express');
const Announcement = require('../models/Announcement');
const { auth, adminAuth, facultyAuth } = require('../middleware/auth');

const router = express.Router();

// Get all announcements
router.get('/', async (req, res) => {
  try {
    const { category, department } = req.query;
    const filter = { isActive: true };

    if (category) filter.category = category;
    if (department && department !== 'all') filter.department = department;

    // Only show non-expired announcements
    filter.$or = [
      { expiryDate: { $exists: false } },
      { expiryDate: { $gte: new Date() } }
    ];

    const announcements = await Announcement.find(filter)
      .populate('createdBy', 'name role')
      .sort({ priority: -1, createdAt: -1 });

    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create announcement
router.post('/', facultyAuth, async (req, res) => {
  try {
    const { title, content, category, targetAudience, department, priority, expiryDate } = req.body;

    const announcement = new Announcement({
      title,
      content,
      category,
      targetAudience: targetAudience || ['all'],
      department: department || 'all',
      priority: priority || 'medium',
      createdBy: req.user._id,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined
    });

    await announcement.save();

    res.status(201).json({
      message: 'Announcement created successfully',
      announcement
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update announcement
router.put('/:id', facultyAuth, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    // Check if user is admin or the creator
    if (req.user.role !== 'admin' && announcement.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedAnnouncement = await Announcement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('createdBy', 'name role');

    res.json({
      message: 'Announcement updated successfully',
      announcement: updatedAnnouncement
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete announcement
router.delete('/:id', facultyAuth, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    // Check if user is admin or the creator
    if (req.user.role !== 'admin' && announcement.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Announcement.findByIdAndDelete(req.params.id);

    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;