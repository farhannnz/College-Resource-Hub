const express = require('express');
const { HfInference } = require('@huggingface/inference');
const Resource = require('../models/Resource');
const Announcement = require('../models/Announcement');
const Forum = require('../models/Forum');
const User = require('../models/User');

const router = express.Router();

// Initialize Hugging Face (Free!)
const hf = new HfInference(); // No API key needed for basic usage

// Get context data from database
async function getContextData() {
    try {
        console.log('Fetching context data from database...');

        const [resources, announcements, forums, users] = await Promise.all([
            Resource.find({ isApproved: true }).limit(10).populate('uploadedBy', 'name role').catch(() => []),
            Announcement.find({ isActive: true }).limit(5).populate('createdBy', 'name role').catch(() => []),
            Forum.find().limit(10).populate('author', 'name role').catch(() => []),
            User.countDocuments().catch(() => 0)
        ]);

        console.log(`Found: ${resources.length} resources, ${announcements.length} announcements, ${forums.length} forums, ${users} users`);

        return {
            resources: resources.map(r => ({
                title: r.title,
                description: r.description,
                category: r.category,
                subject: r.subject,
                department: r.department,
                semester: r.semester,
                uploadedBy: r.uploadedBy?.name || 'Unknown',
                downloads: r.downloads
            })),
            announcements: announcements.map(a => ({
                title: a.title,
                content: a.content.substring(0, 150),
                category: a.category,
                priority: a.priority,
                department: a.department,
                createdBy: a.createdBy?.name || 'Unknown'
            })),
            forums: forums.map(f => ({
                title: f.title,
                content: f.content.substring(0, 100),
                category: f.category,
                subject: f.subject,
                author: f.author?.name || 'Unknown',
                replies: f.replies.length,
                isResolved: f.isResolved
            })),
            totalUsers: users
        };
    } catch (error) {
        console.error('Error getting context data:', error);
        return {
            resources: [],
            announcements: [],
            forums: [],
            totalUsers: 0
        };
    }
}

// Create smart prompt with context
function createSmartPrompt(message, contextData, userInfo) {
    const context = `
College Resource Hub - AI Assistant

PLATFORM STATS:
- Users: ${contextData.totalUsers}
- Resources: ${contextData.resources.length}
- Announcements: ${contextData.announcements.length}
- Discussions: ${contextData.forums.length}

AVAILABLE RESOURCES:
${contextData.resources.map(r => `• ${r.title} (${r.subject}) - ${r.downloads} downloads`).join('\n')}

RECENT ANNOUNCEMENTS:
${contextData.announcements.map(a => `• ${a.title} (${a.priority})`).join('\n')}

ACTIVE DISCUSSIONS:
${contextData.forums.map(f => `• ${f.title} - ${f.replies} replies`).join('\n')}

USER: ${userInfo ? `${userInfo.name} (${userInfo.role})` : 'Guest'}

Question: ${message}

Answer as a helpful college assistant. Be specific about available resources and provide actionable guidance:`;

    return context;
}

// Multiple AI options
async function getAIResponse(message, userInfo = null) {
    try {
        console.log('Getting AI response for:', message);

        const contextData = await getContextData();
        console.log('Context data retrieved successfully');

        // Try multiple free AI services
        const aiResponse = await tryMultipleAI(message, contextData, userInfo);

        console.log('AI response received:', aiResponse.substring(0, 100) + '...');
        return aiResponse;

    } catch (error) {
        console.error('AI Error:', error.message);
        return getFallbackResponse(message, contextData);
    }
}

// Try multiple AI services
async function tryMultipleAI(message, contextData, userInfo) {
    const prompt = createSmartPrompt(message, contextData, userInfo);

    // Option 1: Hugging Face (Free)
    try {
        console.log('Trying Hugging Face AI...');
        const response = await hf.textGeneration({
            model: 'microsoft/DialoGPT-medium',
            inputs: prompt,
            parameters: {
                max_new_tokens: 150,
                temperature: 0.7,
                return_full_text: false
            }
        });

        if (response && response.generated_text) {
            return response.generated_text.trim();
        }
    } catch (error) {
        console.log('Hugging Face failed:', error.message);
    }

    // Option 2: Local AI (Simple but smart)
    try {
        console.log('Using local AI...');
        return getSmartLocalResponse(message, contextData, userInfo);
    } catch (error) {
        console.log('Local AI failed:', error.message);
    }

    // Option 3: Fallback
    return getFallbackResponse(message, contextData);
}

// Smart local AI (Pattern matching with context)
function getSmartLocalResponse(message, contextData, userInfo) {
    const msg = message.toLowerCase();

    // Greetings
    if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
        const userName = userInfo ? `, ${userInfo.name}` : '';
        return `Hello${userName}! 👋 I'm your College Resource Hub assistant. We have ${contextData.resources.length} resources and ${contextData.announcements.length} announcements available. How can I help you today?`;
    }

    // Resources queries
    if (msg.includes('resource') || msg.includes('material') || msg.includes('download') || msg.includes('assignment')) {
        if (contextData.resources.length > 0) {
            const topResources = contextData.resources.slice(0, 3);
            return `📚 We have ${contextData.resources.length} resources available! Here are some popular ones:\n\n${topResources.map(r => `• ${r.title} (${r.subject}) - ${r.downloads} downloads`).join('\n')}\n\nYou can find more in the Resources section. Use filters to search by subject or department!`;
        } else {
            return `📚 The Resources section is where you'll find study materials. Faculty and admin can upload PDFs, notes, and assignments. Currently, no resources are available, but check back soon!`;
        }
    }

    // Announcements
    if (msg.includes('announcement') || msg.includes('news') || msg.includes('update')) {
        if (contextData.announcements.length > 0) {
            const urgentAnnouncements = contextData.announcements.filter(a => a.priority === 'urgent');
            return `📢 We have ${contextData.announcements.length} active announcements! ${urgentAnnouncements.length > 0 ? `${urgentAnnouncements.length} are marked as urgent.` : ''}\n\nLatest announcements:\n${contextData.announcements.slice(0, 3).map(a => `• ${a.title} (${a.priority})`).join('\n')}\n\nCheck the Announcements section for full details!`;
        } else {
            return `📢 No active announcements right now. Check back later for updates from faculty and administration!`;
        }
    }

    // Forums
    if (msg.includes('forum') || msg.includes('discussion') || msg.includes('question') || msg.includes('ask')) {
        if (contextData.forums.length > 0) {
            const activeDiscussions = contextData.forums.filter(f => !f.isResolved);
            return `💬 We have ${contextData.forums.length} discussions in the forums! ${activeDiscussions.length} are still active and need responses.\n\nRecent discussions:\n${contextData.forums.slice(0, 3).map(f => `• ${f.title} - ${f.replies} replies ${f.isResolved ? '✅' : '🔄'}`).join('\n')}\n\nYou can ask questions, help others, and mark resolved topics!`;
        } else {
            return `💬 The Discussion Forums are perfect for asking questions and getting help from peers and faculty. Be the first to start a discussion!`;
        }
    }

    // User-specific responses
    if (userInfo) {
        if (msg.includes('my') || msg.includes('profile')) {
            return `👤 Hi ${userInfo.name}! You're logged in as a ${userInfo.role} in the ${userInfo.department} department. You can access all platform features based on your role. Need help with anything specific?`;
        }
    }

    // Help and navigation
    if (msg.includes('help') || msg.includes('how') || msg.includes('what') || msg.includes('where')) {
        return `🎯 I can help you with:\n\n📚 **Resources** - Find and download study materials\n📢 **Announcements** - Stay updated with latest news\n💬 **Forums** - Ask questions and discuss topics\n🤖 **Navigation** - Guide you through the platform\n\nWhat would you like to explore? Just ask me about any feature!`;
    }

    // Default response with context
    return `I'm here to help you navigate the College Resource Hub! 🎓\n\nWe currently have:\n• ${contextData.resources.length} study resources\n• ${contextData.announcements.length} active announcements\n• ${contextData.forums.length} forum discussions\n\nYou can ask me about finding resources, checking announcements, using forums, or any other platform features. What interests you?`;
}

// Enhanced fallback with context
function getFallbackResponse(message, contextData = null) {
    const msg = message.toLowerCase();

    if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
        return "Hello! I'm your AI assistant for College Resource Hub. How can I help you today? 😊";
    }

    if (contextData && contextData.resources.length > 0) {
        return `I'm here to help! We have ${contextData.resources.length} resources and ${contextData.announcements.length} announcements available. You can ask me about finding materials, checking updates, or using the forums. What would you like to know?`;
    }

    return "I'm here to help you navigate the College Resource Hub! You can ask me about finding resources, checking announcements, using forums, or any other platform features. What would you like to know?";
}

// Chat endpoint
router.post('/chat', async (req, res) => {
    try {
        const { message, userId } = req.body;

        if (!message) {
            return res.status(400).json({ message: 'Message is required' });
        }

        console.log('=== CHATBOT REQUEST ===');
        console.log('Message:', message);
        console.log('User ID:', userId);

        // Get user info if userId provided
        let userInfo = null;
        if (userId) {
            try {
                userInfo = await User.findById(userId).select('name role department');
                console.log('User found:', userInfo?.name);
            } catch (error) {
                console.log('User not found:', userId);
            }
        }

        // Get AI response
        const response = await getAIResponse(message, userInfo);

        console.log('Response sent:', response.substring(0, 100) + '...');
        console.log('=== END REQUEST ===');

        res.json({
            response,
            timestamp: new Date(),
            powered_by: 'Multi-AI System'
        });

    } catch (error) {
        console.error('Chatbot error:', error);
        res.status(500).json({
            message: 'I apologize, but I encountered an error. Please try again!',
            error: error.message
        });
    }
});

// Get chatbot statistics
router.get('/stats', async (req, res) => {
    try {
        const contextData = await getContextData();

        const stats = {
            totalQueries: 0,
            availableResources: contextData.resources.length,
            activeAnnouncements: contextData.announcements.length,
            forumDiscussions: contextData.forums.length,
            totalUsers: contextData.totalUsers,
            aiModel: 'Multi-AI (HuggingFace + Local)',
            lastUpdated: new Date()
        };

        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;