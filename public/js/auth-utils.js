// Auth utility functions

// API helper function
async function apiCall(endpoint, options = {}) {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        }
    };
    
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
        throw error;
    }
}

// Show alert messages
function showAlert(type, message, duration = 5000) {
    const alertContainer = document.getElementById('alertContainer');
    const alertId = 'alert-' + Date.now();
    
    const alertElement = document.createElement('div');
    alertElement.id = alertId;
    alertElement.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show`;
    alertElement.innerHTML = `
        ${message}
        <button type="button" class="btn-close" onclick="closeAlert('${alertId}')"></button>
    `;
    
    alertContainer.appendChild(alertElement);
    
    // Auto remove after duration
    setTimeout(() => {
        closeAlert(alertId);
    }, duration);
}

// Close alert
function closeAlert(alertId) {
    const alert = document.getElementById(alertId);
    if (alert) {
        alert.style.opacity = '0';
        alert.style.transform = 'translateX(100%)';
        setTimeout(() => {
            alert.remove();
        }, 300);
    }
}

// Toggle password visibility
function togglePassword(fieldId = 'password') {
    const passwordField = document.getElementById(fieldId);
    const icon = document.getElementById(fieldId + 'Icon');
    
    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        passwordField.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Check password strength
function checkPasswordStrength(password) {
    let strength = 0;
    let feedback = [];
    
    // Length check
    if (password.length >= 8) {
        strength += 25;
    } else {
        feedback.push('At least 8 characters');
    }
    
    // Uppercase check
    if (/[A-Z]/.test(password)) {
        strength += 25;
    } else {
        feedback.push('One uppercase letter');
    }
    
    // Lowercase check
    if (/[a-z]/.test(password)) {
        strength += 25;
    } else {
        feedback.push('One lowercase letter');
    }
    
    // Number or special character check
    if (/[\d\W]/.test(password)) {
        strength += 25;
    } else {
        feedback.push('One number or special character');
    }
    
    return { strength, feedback };
}

// Update password strength indicator
function updatePasswordStrength(password) {
    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');
    
    if (!strengthFill || !strengthText) return;
    
    const { strength, feedback } = checkPasswordStrength(password);
    
    strengthFill.style.width = strength + '%';
    
    if (strength < 50) {
        strengthFill.style.background = 'var(--danger-color)';
        strengthText.textContent = 'Weak password';
        strengthText.style.color = 'var(--danger-color)';
    } else if (strength < 75) {
        strengthFill.style.background = 'var(--warning-color)';
        strengthText.textContent = 'Medium password';
        strengthText.style.color = 'var(--warning-color)';
    } else {
        strengthFill.style.background = 'var(--success-color)';
        strengthText.textContent = 'Strong password';
        strengthText.style.color = 'var(--success-color)';
    }
}

// Validate email format
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Show form validation feedback
function showFieldFeedback(fieldId, message, isValid = false) {
    const field = document.getElementById(fieldId);
    const feedback = field.parentNode.querySelector('.form-feedback');
    
    if (field && feedback) {
        field.classList.remove('is-valid', 'is-invalid');
        feedback.classList.remove('valid', 'invalid');
        
        if (message) {
            field.classList.add(isValid ? 'is-valid' : 'is-invalid');
            feedback.classList.add(isValid ? 'valid' : 'invalid');
            feedback.textContent = message;
        } else {
            feedback.textContent = '';
        }
    }
}

// Clear all form validation
function clearFormValidation(formId) {
    const form = document.getElementById(formId);
    if (form) {
        const fields = form.querySelectorAll('.form-control, .form-select');
        const feedbacks = form.querySelectorAll('.form-feedback');
        
        fields.forEach(field => {
            field.classList.remove('is-valid', 'is-invalid');
        });
        
        feedbacks.forEach(feedback => {
            feedback.textContent = '';
            feedback.classList.remove('valid', 'invalid');
        });
    }
}

// Show loading state on button
function setButtonLoading(buttonId, isLoading = true) {
    const button = document.getElementById(buttonId);
    const btnText = button.querySelector('.btn-text');
    const btnSpinner = button.querySelector('.btn-spinner');
    
    if (isLoading) {
        button.disabled = true;
        btnText.classList.add('d-none');
        btnSpinner.classList.remove('d-none');
    } else {
        button.disabled = false;
        btnText.classList.remove('d-none');
        btnSpinner.classList.add('d-none');
    }
}

// Redirect after successful auth
function redirectToApp() {
    // Small delay for better UX
    setTimeout(() => {
        window.location.href = '/';
    }, 1500);
}

// Check if user is already logged in
function checkExistingAuth() {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('currentUser');
    
    if (token && user) {
        console.log('User already logged in, redirecting...');
        redirectToApp();
        return true;
    }
    return false;
}