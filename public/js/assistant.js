// AI Assistant - Keyword-based chatbot for dedicated page

// Predefined responses database
const assistantResponses = {
    greetings: {
        keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'],
        responses: [
            'Hello! 👋 How can I help you today?',
            'Hi there! What can I assist you with?',
            'Hey! I\'m here to help. What would you like to know?'
        ]
    },

    login: {
        keywords: ['login', 'password', 'forgot password', 'reset password', 'sign in', 'access'],
        responses: [
            'To login, use your college email and password. If you forgot your password, contact the admin at support@college.edu.',
            'For password reset, contact the college IT department. Provide your student ID and email for verification.'
        ]
    },

    resources: {
        keywords: ['resource', 'notes', 'download', 'study material', 'book', 'assignment', 'presentation', 'pdf'],
        responses: [
            'Go to the Resources page and filter by category, subject, or department. Then click the download button to get your materials.',
            'To download study materials: Navigate to Resources → Use filters to find what you need → Click download button.',
            'Notes, assignments, presentations, and books are available in the Resources section. Use the filter options to find them easily.'
        ]
    },

    upload: {
        keywords: ['upload', 'add resource', 'share file', 'contribute'],
        responses: [
            'Only admins can upload resources. If you have useful materials to share, please contact your department admin or faculty.',
            'Resource upload access is limited to administrators. Talk to your admin to share your study materials.'
        ]
    },

    announcements: {
        keywords: ['announcement', 'notice', 'news', 'update', 'event', 'urgent'],
        responses: [
            'Check the Announcements page for latest college news and events. Look for priority badges (Urgent, High, Medium, Low) to see what\'s important.',
            'Visit the Announcements section for college updates and events. You can filter by department to see relevant announcements.',
            'Important notices and events are posted on the Announcements page. Faculty and admins can create new announcements.'
        ]
    },

    forums: {
        keywords: ['forum', 'discussion', 'post', 'reply', 'question', 'ask', 'doubt'],
        responses: [
            'Go to the Forums page and click "Create New Post" button. Fill in the title, content, category, and subject fields.',
            'In discussion forums, you can create posts, reply to others, like posts, and mark questions as resolved.',
            'Use the Forums section to clear your doubts and discuss with peers and seniors. It\'s a great place for collaboration!'
        ]
    },

    help: {
        keywords: ['help', 'support', 'problem', 'issue', 'error', 'not working', 'broken'],
        responses: [
            'Check the Help page for detailed guides and FAQs. You can also email us at support@college.edu.',
            'For any problems, visit the Help section or call +91 1234567890 (Mon-Fri: 9 AM - 5 PM).',
            'For technical issues, contact the IT department at support@college.edu. They\'ll assist you promptly.'
        ]
    },

    mobile: {
        keywords: ['mobile', 'phone', 'responsive', 'tablet', 'app'],
        responses: [
            'Yes! This platform is fully mobile-friendly. You can use it on your phone, tablet, or computer seamlessly.',
            'The platform works perfectly on mobile devices. Just open it in your browser and enjoy the full experience.'
        ]
    },

    departments: {
        keywords: ['department', 'branch', 'civil', 'electrical', 'computer', 'electronics', 'chemical'],
        responses: [
            'The college has 5 departments: Civil Engineering, Electrical Engineering, Electronics & Telecommunications, Computer Engineering, and Chemical Engineering.',
            'You can filter resources and announcements specific to your department using the department filter option.'
        ]
    },

    features: {
        keywords: ['feature', 'what can', 'functionality', 'use', 'how to use', 'capabilities'],
        responses: [
            'Platform features include: Download resources, view announcements, participate in forums, and get help from this AI assistant.',
            'Main features: Access study materials, stay updated with college news, discuss in forums, and get 24/7 chatbot support.',
            'Check the Help page for a complete features list and detailed usage guide.'
        ]
    },

    thanks: {
        keywords: ['thank', 'thanks', 'appreciate', 'grateful'],
        responses: [
            'You\'re welcome! 😊 Is there anything else I can help you with?',
            'Happy to help! Do you have any other questions?',
            'No problem! Feel free to ask if you need more assistance.'
        ]
    },

    goodbye: {
        keywords: ['bye', 'goodbye', 'see you', 'later', 'exit'],
        responses: [
            'Goodbye! See you later. Happy learning! 📚',
            'Bye! Feel free to come back anytime you need help. 👋',
            'See you! All the best for your studies! 🎓'
        ]
    }
};

// Get current time
function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

// Add message to chat
function addMessageToChat(text, sender) {
    const messagesArea = document.getElementById('chatMessagesArea');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}-message`;

    const senderIcon = sender === 'user' ? 'fa-user' : 'fa-robot';
    const senderName = sender === 'user' ? 'You' : 'Assistant';

    messageDiv.innerHTML = `
        <div class="message-sender">
            <i class="fas ${senderIcon}"></i>
            <span>${senderName}</span>
        </div>
        <div class="message-bubble">
            ${text}
            <div class="message-time">${getCurrentTime()}</div>
        </div>
    `;

    messagesArea.appendChild(messageDiv);
    messagesArea.scrollTop = messagesArea.scrollHeight;

    // Hide quick suggestions after first message
    if (sender === 'user') {
        const suggestionsArea = document.getElementById('quickSuggestionsArea');
        if (suggestionsArea && messagesArea.children.length > 2) {
            suggestionsArea.style.display = 'none';
        }
    }
}

// Show typing indicator
function showTypingIndicator() {
    const messagesArea = document.getElementById('chatMessagesArea');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-message bot-message';
    typingDiv.id = 'typingIndicator';
    typingDiv.innerHTML = `
        <div class="message-sender">
            <i class="fas fa-robot"></i>
            <span>Assistant</span>
        </div>
        <div class="typing-indicator active">
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    messagesArea.appendChild(typingDiv);
    messagesArea.scrollTop = messagesArea.scrollHeight;
}

// Remove typing indicator
function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Get bot response based on keywords
function getBotResponse(message) {
    const lowerMessage = message.toLowerCase();

    // Check each response category
    for (const [category, data] of Object.entries(assistantResponses)) {
        for (const keyword of data.keywords) {
            if (lowerMessage.includes(keyword)) {
                const responses = data.responses;
                return responses[Math.floor(Math.random() * responses.length)];
            }
        }
    }

    // Default response if no keyword matches
    const defaultResponses = [
        'I\'m not sure I understand. Could you rephrase your question?',
        'Hmm, I don\'t have information about that. Try checking the Help page or contact support@college.edu.',
        'I couldn\'t find an answer to that. Please visit the Help section for more information.',
        'I can\'t help with that topic right now. Please contact admin at +91 1234567890 for assistance.'
    ];

    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}

// Send user message
function sendUserMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();

    if (!message) return;

    // Add user message
    addMessageToChat(message, 'user');

    // Clear input
    input.value = '';

    // Show typing indicator
    showTypingIndicator();

    // Get bot response after delay
    setTimeout(() => {
        removeTypingIndicator();
        const response = getBotResponse(message);
        addMessageToChat(response, 'bot');
    }, 1000);
}

// Send quick question
function sendQuickQuestion(question) {
    document.getElementById('messageInput').value = question;
    sendUserMessage();
}

// Handle Enter key press
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendUserMessage();
    }
}
