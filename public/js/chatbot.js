// Static Chatbot with Keyword-based Responses

// Predefined responses database
const chatbotResponses = {
    // Greetings
    greetings: {
        keywords: ['hello', 'hi', 'hey', 'namaste', 'good morning', 'good afternoon', 'good evening'],
        responses: [
            'Hello! 👋 How can I help you today?',
            'Hi there! What can I assist you with?',
            'Hey! I\'m here to help. What would you like to know?'
        ]
    },

    // Login/Password
    login: {
        keywords: ['login', 'password', 'forgot password', 'reset password', 'sign in', 'access'],
        responses: [
            'To login, use your college email and password. If you forgot your password, contact the admin.',
            'For password reset, contact the college IT department or admin. Provide your student ID and email for verification.'
        ]
    },

    // Resources
    resources: {
        keywords: ['resource', 'notes', 'download', 'study material', 'book', 'assignment', 'presentation', 'pdf'],
        responses: [
            'Go to the Resources page and filter by category, subject, or department. Then click the download button.',
            'To download study materials: Resources → Filter by subject → Click download button.',
            'Notes, assignments, presentations, and books are available in the Resources section. Use filters to find them easily.'
        ]
    },

    // Upload
    upload: {
        keywords: ['upload', 'add resource', 'share file', 'contribute'],
        responses: [
            'Only admins can upload resources. If you have useful materials, contact your department admin or faculty.',
            'Resource upload access is limited to administrators. Talk to your admin to share your materials.'
        ]
    },

    // Announcements
    announcements: {
        keywords: ['announcement', 'notice', 'news', 'update', 'event', 'urgent'],
        responses: [
            'Check the Announcements page for latest college news and events. Look for priority badges (Urgent, High, Medium, Low).',
            'Visit the Announcements section for college updates and events. You can filter by department too.',
            'Important notices and events are on the Announcements page. Faculty and admins can create announcements.'
        ]
    },

    // Forums
    forums: {
        keywords: ['forum', 'discussion', 'post', 'reply', 'question', 'ask', 'doubt'],
        responses: [
            'Go to the Forums page and click "Create New Post" button. Fill in title, content, category, and subject.',
            'In discussion forums, you can create posts, reply to others, and like posts.',
            'Use the Forums section to clear your doubts. Discuss with peers and seniors.'
        ]
    },

    // Help/Support
    help: {
        keywords: ['help', 'support', 'problem', 'issue', 'error', 'not working'],
        responses: [
            'Check the Help page for detailed guides and FAQs. Or email support@college.edu.',
            'For any problems, check the Help section or call +91 1234567890 (Mon-Fri: 9 AM - 5 PM).',
            'For technical issues, contact the IT department: support@college.edu'
        ]
    },

    // Mobile/Responsive
    mobile: {
        keywords: ['mobile', 'phone', 'responsive', 'tablet', 'app'],
        responses: [
            'Yes! This platform is fully mobile-friendly. You can use it on phone, tablet, or computer.',
            'The platform works perfectly on mobile devices. Just open it in your browser and use it.'
        ]
    },

    // Departments
    departments: {
        keywords: ['department', 'branch', 'civil', 'electrical', 'computer', 'electronics', 'chemical'],
        responses: [
            'The college has 5 departments: Civil, Electrical, Electronics & Telecommunications, Computer, and Chemical Engineering.',
            'You can filter resources and announcements specific to your department.'
        ]
    },

    // Features
    features: {
        keywords: ['feature', 'what can', 'functionality', 'use', 'how to use'],
        responses: [
            'Platform features: Download resources, view announcements, discuss in forums, and get help from AI assistant.',
            'Main features: Access study materials, college updates, discussion forums, and 24/7 chatbot support.',
            'Check the Help page for complete features list and usage guide.'
        ]
    },

    // Thanks
    thanks: {
        keywords: ['thank', 'thanks', 'appreciate', 'grateful'],
        responses: [
            'You\'re welcome! 😊 Need anything else?',
            'Happy to help! Any other questions?',
            'No problem! Feel free to ask if you need more help.'
        ]
    },

    // Goodbye
    goodbye: {
        keywords: ['bye', 'goodbye', 'see you', 'later'],
        responses: [
            'Goodbye! See you later. Happy learning! 📚',
            'Bye! Message me anytime you need help. 👋',
            'See you! All the best for your studies! 🎓'
        ]
    }
};

// Quick suggestion buttons
const quickSuggestions = [
    { text: 'How to login?', query: 'login' },
    { text: 'Download resources', query: 'download resources' },
    { text: 'Create forum post', query: 'forum post' },
    { text: 'View announcements', query: 'announcements' },
    { text: 'Need help', query: 'help' }
];

// Initialize chatbot
function initChatbot() {
    const chatbotHTML = `
        <div id="chatbot" class="chatbot">
            <div class="chatbot-header" onclick="toggleChatbot()">
                <i class="fas fa-robot me-2"></i>
                <span>Help Assistant</span>
                <i class="fas fa-chevron-down ms-auto" id="chatbotToggleIcon"></i>
            </div>
            <div class="chatbot-body">
                <div class="chat-messages" id="chatMessages">
                    <div class="message bot-message">
                        <strong>Bot:</strong> Hello! 👋 I'm here to help you. What would you like to know?
                    </div>
                    <div class="quick-suggestions mt-2" id="quickSuggestions">
                        ${quickSuggestions.map(s => `
                            <button class="btn btn-sm btn-outline-primary m-1" onclick="sendQuickMessage('${s.query}')">
                                ${s.text}
                            </button>
                        `).join('')}
                    </div>
                </div>
                <div class="chat-input">
                    <input type="text" id="chatInput" placeholder="Type your message..." onkeypress="handleChatKeypress(event)">
                    <button onclick="sendMessage()">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', chatbotHTML);
}

// Toggle chatbot visibility
function toggleChatbot() {
    const chatBody = document.querySelector('.chatbot-body');
    const toggleIcon = document.getElementById('chatbotToggleIcon');

    if (chatBody.classList.contains('collapsed')) {
        chatBody.classList.remove('collapsed');
        toggleIcon.classList.remove('fa-chevron-up');
        toggleIcon.classList.add('fa-chevron-down');
    } else {
        chatBody.classList.add('collapsed');
        toggleIcon.classList.remove('fa-chevron-down');
        toggleIcon.classList.add('fa-chevron-up');
    }
}

// Handle keypress in chat input
function handleChatKeypress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// Send quick message
function sendQuickMessage(query) {
    document.getElementById('chatInput').value = query;
    sendMessage();
}

// Send message
function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();

    if (!message) return;

    // Add user message
    addMessage(message, 'user');

    // Clear input
    input.value = '';

    // Get bot response
    setTimeout(() => {
        const response = getBotResponse(message);
        addMessage(response, 'bot');
    }, 500);
}

// Add message to chat
function addMessage(text, sender) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;

    if (sender === 'user') {
        messageDiv.innerHTML = `<strong>You:</strong> ${text}`;
    } else {
        messageDiv.innerHTML = `<strong>Bot:</strong> ${text}`;
    }

    // Remove quick suggestions if they exist
    const suggestions = document.getElementById('quickSuggestions');
    if (suggestions) {
        suggestions.remove();
    }

    messagesContainer.appendChild(messageDiv);

    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Get bot response based on keywords
function getBotResponse(message) {
    const lowerMessage = message.toLowerCase();

    // Check each response category
    for (const [category, data] of Object.entries(chatbotResponses)) {
        for (const keyword of data.keywords) {
            if (lowerMessage.includes(keyword)) {
                // Return random response from matching category
                const responses = data.responses;
                return responses[Math.floor(Math.random() * responses.length)];
            }
        }
    }

    // Default response if no keyword matches
    const defaultResponses = [
        'Sorry, I didn\'t quite understand that. Could you provide more details?',
        'Hmm, I don\'t have much information about that. Check the Help page or email support@college.edu.',
        'Could you rephrase your question? Or check the Help section for more information.',
        'I can\'t help with that topic right now. Please contact admin: +91 1234567890'
    ];

    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}

// Initialize chatbot when page loads
document.addEventListener('DOMContentLoaded', function () {
    initChatbot();
});
