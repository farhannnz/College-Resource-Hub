// Chatbot functionality

let chatbotExpanded = false;

// Toggle chatbot
function toggleChatbot() {
    const chatbotBody = document.getElementById('chatbotBody');
    const toggleIcon = document.getElementById('chatToggleIcon');
    
    chatbotExpanded = !chatbotExpanded;
    
    if (chatbotExpanded) {
        chatbotBody.classList.remove('collapsed');
        toggleIcon.classList.remove('fa-chevron-down');
        toggleIcon.classList.add('fa-chevron-up');
    } else {
        chatbotBody.classList.add('collapsed');
        toggleIcon.classList.remove('fa-chevron-up');
        toggleIcon.classList.add('fa-chevron-down');
    }
}

// Handle chat key press
function handleChatKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// Send message
async function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();
    
    if (!message) return;
    
    // Clear input
    chatInput.value = '';
    
    // Add user message to chat
    addMessageToChat(message, 'user');
    
    // Show typing indicator
    showTypingIndicator();
    
    try {
        const response = await apiCall('/chatbot/chat', {
            method: 'POST',
            body: JSON.stringify({
                message,
                userId: currentUser?._id || currentUser?.id || null
            })
        });
        
        // Remove typing indicator
        removeTypingIndicator();
        
        // Add bot response
        addMessageToChat(response.response, 'bot');
        
    } catch (error) {
        removeTypingIndicator();
        addMessageToChat('Sorry, I encountered an error. Please try again.', 'bot');
    }
}

// Add message to chat
function addMessageToChat(message, sender) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message fade-in`;
    messageDiv.textContent = message;
    
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Show typing indicator
function showTypingIndicator() {
    const chatMessages = document.getElementById('chatMessages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message typing-indicator';
    typingDiv.id = 'typingIndicator';
    typingDiv.innerHTML = `
        <div class="typing-dots">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;
    
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Add CSS for typing animation if not already added
    if (!document.getElementById('typingStyles')) {
        const style = document.createElement('style');
        style.id = 'typingStyles';
        style.textContent = `
            .typing-dots {
                display: flex;
                gap: 4px;
                align-items: center;
            }
            
            .typing-dots span {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background-color: #6c757d;
                animation: typing 1.4s infinite ease-in-out;
            }
            
            .typing-dots span:nth-child(1) {
                animation-delay: -0.32s;
            }
            
            .typing-dots span:nth-child(2) {
                animation-delay: -0.16s;
            }
            
            @keyframes typing {
                0%, 80%, 100% {
                    transform: scale(0.8);
                    opacity: 0.5;
                }
                40% {
                    transform: scale(1);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Remove typing indicator
function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Initialize chatbot
document.addEventListener('DOMContentLoaded', function() {
    // Set initial state
    const chatbotBody = document.getElementById('chatbotBody');
    if (chatbotBody) {
        chatbotBody.classList.add('collapsed');
    }
    
    // Add some sample interactions
    setTimeout(() => {
        if (Math.random() > 0.7) { // 30% chance to show a tip
            const tips = [
                "💡 Tip: You can ask me about finding resources, announcements, or forum discussions!",
                "🔍 Try asking: 'How do I find study materials for my subject?'",
                "📢 Ask me: 'What are the latest announcements?'",
                "💬 You can say: 'How do I post a question in the forums?'"
            ];
            const randomTip = tips[Math.floor(Math.random() * tips.length)];
            addMessageToChat(randomTip, 'bot');
        }
    }, 3000);
});

// Quick action buttons (could be added to the chatbot interface)
function addQuickActions() {
    const quickActions = [
        { text: "Find Resources", action: () => sendPredefinedMessage("How do I find study resources?") },
        { text: "Latest News", action: () => sendPredefinedMessage("What are the latest announcements?") },
        { text: "Ask Question", action: () => sendPredefinedMessage("How do I post a question in forums?") },
        { text: "Help", action: () => sendPredefinedMessage("What can you help me with?") }
    ];
    
    // This could be implemented as buttons in the chat interface
    return quickActions;
}

// Send predefined message
function sendPredefinedMessage(message) {
    document.getElementById('chatInput').value = message;
    sendMessage();
}

// Enhanced chatbot with context awareness
function getChatContext() {
    const currentSection = document.querySelector('.section:not(.d-none)')?.id || 'home';
    return {
        section: currentSection,
        user: currentUser,
        timestamp: new Date().toISOString()
    };
}

// Smart suggestions based on current context
function getSmartSuggestions() {
    const context = getChatContext();
    const suggestions = [];
    
    switch (context.section) {
        case 'resources':
            suggestions.push("How do I filter resources by subject?");
            suggestions.push("Can I upload my own study materials?");
            break;
        case 'announcements':
            suggestions.push("How do I create an announcement?");
            suggestions.push("What do the priority levels mean?");
            break;
        case 'forums':
            suggestions.push("How do I start a new discussion?");
            suggestions.push("How do I mark my question as resolved?");
            break;
        default:
            suggestions.push("What features are available?");
            suggestions.push("How do I get started?");
    }
    
    return suggestions;
}