// Login page functionality

document.addEventListener('DOMContentLoaded', function() {
    console.log('Login page loaded');
    
    // Check if user is already logged in
    if (checkExistingAuth()) {
        return;
    }
    
    // Setup form validation
    setupLoginValidation();
    
    // Setup form submission
    setupLoginSubmission();
});

// Setup login form validation
function setupLoginValidation() {
    const emailField = document.getElementById('email');
    const passwordField = document.getElementById('password');
    
    // Email validation
    emailField.addEventListener('blur', function() {
        const email = this.value.trim();
        
        if (!email) {
            showFieldFeedback('email', 'Email is required', false);
        } else if (!validateEmail(email)) {
            showFieldFeedback('email', 'Please enter a valid email address', false);
        } else {
            showFieldFeedback('email', 'Email looks good!', true);
        }
    });
    
    // Password validation
    passwordField.addEventListener('blur', function() {
        const password = this.value;
        
        if (!password) {
            showFieldFeedback('password', 'Password is required', false);
        } else if (password.length < 6) {
            showFieldFeedback('password', 'Password must be at least 6 characters', false);
        } else {
            showFieldFeedback('password', '', true);
        }
    });
    
    // Clear validation on input
    emailField.addEventListener('input', function() {
        if (this.classList.contains('is-invalid')) {
            showFieldFeedback('email', '');
        }
    });
    
    passwordField.addEventListener('input', function() {
        if (this.classList.contains('is-invalid')) {
            showFieldFeedback('password', '');
        }
    });
}

// Setup login form submission
function setupLoginSubmission() {
    const loginForm = document.getElementById('loginForm');
    
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        
        // Validate form
        if (!validateLoginForm(email, password)) {
            return;
        }
        
        // Show loading state
        setButtonLoading('loginBtn', true);
        clearFormValidation('loginForm');
        
        try {
            console.log('Attempting login...');
            
            const response = await apiCall('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });
            
            console.log('Login successful:', response);
            
            // Store auth data
            localStorage.setItem('authToken', response.token);
            localStorage.setItem('currentUser', JSON.stringify(response.user));
            
            if (rememberMe) {
                localStorage.setItem('rememberLogin', 'true');
            }
            
            // Show success message
            showAlert('success', `Welcome back, ${response.user.name}!`);
            
            // Redirect to main app
            redirectToApp();
            
        } catch (error) {
            console.error('Login error:', error);
            
            // Show error message
            showAlert('error', error.message || 'Login failed. Please try again.');
            
            // Show field-specific errors if available
            if (error.message.includes('email')) {
                showFieldFeedback('email', 'Invalid email address', false);
            } else if (error.message.includes('password')) {
                showFieldFeedback('password', 'Invalid password', false);
            }
            
        } finally {
            // Hide loading state
            setButtonLoading('loginBtn', false);
        }
    });
}

// Validate login form
function validateLoginForm(email, password) {
    let isValid = true;
    
    // Email validation
    if (!email) {
        showFieldFeedback('email', 'Email is required', false);
        isValid = false;
    } else if (!validateEmail(email)) {
        showFieldFeedback('email', 'Please enter a valid email address', false);
        isValid = false;
    }
    
    // Password validation
    if (!password) {
        showFieldFeedback('password', 'Password is required', false);
        isValid = false;
    } else if (password.length < 6) {
        showFieldFeedback('password', 'Password must be at least 6 characters', false);
        isValid = false;
    }
    
    return isValid;
}

// Handle forgot password
function handleForgotPassword() {
    showAlert('info', 'Forgot password functionality will be implemented soon!');
}

// Handle social login
function handleSocialLogin(provider) {
    showAlert('info', `${provider} login will be implemented soon!`);
}