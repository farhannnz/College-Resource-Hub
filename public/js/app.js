// Global variables
let currentUser = null;
let authToken = null;

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    // Check for stored auth token
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('currentUser');
    
    if (storedToken && storedUser) {
        authToken = storedToken;
        currentUser = JSON.parse(storedUser);
        updateAuthUI();
    }
    
    // Load initial content
    loadResources();
    loadAnnouncements();
    loadForums();
    
    // Set up navigation
    setupNavigation();
    
    // Set up event listeners
    setupEventListeners();
});

// Navigation setup
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            navigateTo(targetId);
        });
    });
}

// Navigate to section
function navigateTo(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section, .hero-section').forEach(section => {
        section.classList.add('d-none');
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.remove('d-none');
        targetSection.classList.add('fade-in');
    }
    
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    const activeLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
    
    // Load section-specific data
    switch(sectionId) {
        case 'resources':
            loadResources();
            break;
        case 'announcements':
            loadAnnouncements();
            break;
        case 'forums':
            loadForums();
            break;
    }
}

// Update authentication UI
function updateAuthUI() {
    const authNav = document.getElementById('authNav');
    const userNav = document.getElementById('userNav');
    const userName = document.getElementById('userName');
    
    if (currentUser) {
        authNav.classList.add('d-none');
        userNav.classList.remove('d-none');
        userName.textContent = currentUser.name;
        
        // Show role-specific buttons
        updateRoleBasedUI();
    } else {
        authNav.classList.remove('d-none');
        userNav.classList.add('d-none');
        
        // Hide role-specific buttons
        hideRoleBasedUI();
    }
}

// Update role-based UI elements
function updateRoleBasedUI() {
    const uploadBtn = document.getElementById('uploadBtn');
    const createAnnouncementBtn = document.getElementById('createAnnouncementBtn');
    const createPostBtn = document.getElementById('createPostBtn');
    
    if (currentUser) {
        // Show create post button for all authenticated users
        if (createPostBtn) createPostBtn.style.display = 'inline-block';
        
        // Show upload button for faculty and admin
        if ((currentUser.role === 'faculty' || currentUser.role === 'admin') && uploadBtn) {
            uploadBtn.style.display = 'inline-block';
        }
        
        // Show create announcement button for faculty and admin
        if ((currentUser.role === 'faculty' || currentUser.role === 'admin') && createAnnouncementBtn) {
            createAnnouncementBtn.style.display = 'inline-block';
        }
    }
}

// Hide role-based UI elements
function hideRoleBasedUI() {
    const uploadBtn = document.getElementById('uploadBtn');
    const createAnnouncementBtn = document.getElementById('createAnnouncementBtn');
    const createPostBtn = document.getElementById('createPostBtn');
    
    if (uploadBtn) uploadBtn.style.display = 'none';
    if (createAnnouncementBtn) createAnnouncementBtn.style.display = 'none';
    if (createPostBtn) createPostBtn.style.display = 'none';
}

// API helper functions
async function apiCall(endpoint, options = {}) {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        }
    };
    
    if (authToken) {
        defaultOptions.headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    const finalOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };
    
    try {
        const response = await fetch(`/api${endpoint}`, finalOptions);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'API call failed');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        showAlert('error', error.message);
        throw error;
    }
}

// Show alert messages
function showAlert(type, message, duration = 5000) {
    const alertContainer = document.createElement('div');
    alertContainer.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
    alertContainer.style.cssText = 'top: 90px; right: 20px; z-index: 1050; min-width: 300px;';
    
    alertContainer.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertContainer);
    
    // Auto remove after duration
    setTimeout(() => {
        if (alertContainer.parentNode) {
            alertContainer.remove();
        }
    }, duration);
}

// Format date helper
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Format file size helper
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Show loading spinner
function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `
            <div class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2 text-muted">Loading...</p>
            </div>
        `;
    }
}

// Show empty state
function showEmptyState(elementId, message, icon = 'fas fa-inbox') {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `
            <div class="text-center py-5">
                <i class="${icon} display-4 text-muted mb-3"></i>
                <p class="text-muted">${message}</p>
            </div>
        `;
    }
}

// Logout function
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    authToken = null;
    currentUser = null;
    updateAuthUI();
    navigateTo('home');
    showAlert('success', 'Logged out successfully');
}

// Show profile (placeholder)
function showProfile() {
    showAlert('info', 'Profile feature coming soon!');
}

// Setup event listeners
function setupEventListeners() {
    // Auth links
    const loginLink = document.getElementById('loginLink');
    const registerLink = document.getElementById('registerLink');
    const profileLink = document.getElementById('profileLink');
    const logoutLink = document.getElementById('logoutLink');
    
    if (loginLink) loginLink.addEventListener('click', (e) => { e.preventDefault(); showLogin(); });
    if (registerLink) registerLink.addEventListener('click', (e) => { e.preventDefault(); showRegister(); });
    if (profileLink) profileLink.addEventListener('click', (e) => { e.preventDefault(); showProfile(); });
    if (logoutLink) logoutLink.addEventListener('click', (e) => { e.preventDefault(); logout(); });
    
    // Hero buttons
    const browseResourcesBtn = document.getElementById('browseResourcesBtn');
    const askAIBtn = document.getElementById('askAIBtn');
    
    if (browseResourcesBtn) browseResourcesBtn.addEventListener('click', () => navigateTo('resources'));
    if (askAIBtn) askAIBtn.addEventListener('click', toggleChatbot);
    
    // Filter buttons
    const filterResourcesBtn = document.getElementById('filterResourcesBtn');
    const filterAnnouncementsBtn = document.getElementById('filterAnnouncementsBtn');
    
    if (filterResourcesBtn) filterResourcesBtn.addEventListener('click', filterResources);
    if (filterAnnouncementsBtn) filterAnnouncementsBtn.addEventListener('click', filterAnnouncements);
    
    // Action buttons
    const uploadBtn = document.getElementById('uploadBtn');
    const createAnnouncementBtn = document.getElementById('createAnnouncementBtn');
    const createPostBtn = document.getElementById('createPostBtn');
    
    if (uploadBtn) uploadBtn.addEventListener('click', showUploadModal);
    if (createAnnouncementBtn) createAnnouncementBtn.addEventListener('click', () => showAnnouncementModal());
    if (createPostBtn) createPostBtn.addEventListener('click', showCreatePostModal);
    
    // Chatbot
    const chatbotHeader = document.getElementById('chatbotHeader');
    const chatInput = document.getElementById('chatInput');
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    
    if (chatbotHeader) chatbotHeader.addEventListener('click', toggleChatbot);
    if (chatInput) chatInput.addEventListener('keypress', handleChatKeyPress);
    if (sendMessageBtn) sendMessageBtn.addEventListener('click', sendMessage);
}