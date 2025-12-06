// Signup page functionality

document.addEventListener('DOMContentLoaded', function() {
    console.log('Signup page loaded');
    
    // Check if user is already logged in
    if (checkExistingAuth()) {
        return;
    }
    
    // Setup form validation
    setupSignupValidation();
    
    // Setup form submission
    setupSignupSubmission();
    
    // Setup password strength checker
    setupPasswordStrength();
});

// Toggle student fields based on role selection
function toggleStudentFields() {
    const role = document.getElementById('role').value;
    const studentFields = document.getElementById('studentFields');
    const studentIdField = document.getElementById('studentId');
    
    if (role === 'student') {
        studentFields.style.display = 'block';
        studentIdField.required = true;
    } else {
        studentFields.style.display = 'none';
        studentIdField.required = false;
        studentIdField.value = '';
        showFieldFeedback('studentId', '');
    }
}

// Setup signup form validation
function setupSignupValidation() {
    const fields = {
        fullName: {
            validate: (value) => {
                if (!value.trim()) return { valid: false, message: 'Full name is required' };
                if (value.trim().length < 2) return { valid: false, message: 'Name must be at least 2 characters' };
                return { valid: true, message: 'Name looks good!' };
            }
        },
        email: {
            validate: (value) => {
                if (!value.trim()) return { valid: false, message: 'Email is required' };
                if (!validateEmail(value)) return { valid: false, message: 'Please enter a valid email address' };
                return { valid: true, message: 'Email looks good!' };
            }
        },
        role: {
            validate: (value) => {
                if (!value) return { valid: false, message: 'Please select your role' };
                return { valid: true, message: '' };
            }
        },
        department: {
            validate: (value) => {
                if (!value.trim()) return { valid: false, message: 'Department is required' };
                return { valid: true, message: 'Department looks good!' };
            }
        },
        studentId: {
            validate: (value) => {
                const role = document.getElementById('role').value;
                if (role === 'student') {
                    if (!value.trim()) return { valid: false, message: 'Student ID is required' };
                    if (value.trim().length < 3) return { valid: false, message: 'Student ID must be at least 3 characters' };
                }
                return { valid: true, message: 'Student ID looks good!' };
            }
        },
        password: {
            validate: (value) => {
                if (!value) return { valid: false, message: 'Password is required' };
                const { strength } = checkPasswordStrength(value);
                if (strength < 50) return { valid: false, message: 'Password is too weak' };
                return { valid: true, message: '' };
            }
        },
        confirmPassword: {
            validate: (value) => {
                const password = document.getElementById('password').value;
                if (!value) return { valid: false, message: 'Please confirm your password' };
                if (value !== password) return { valid: false, message: 'Passwords do not match' };
                return { valid: true, message: 'Passwords match!' };
            }
        }
    };
    
    // Setup validation for each field
    Object.keys(fields).forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            // Validate on blur
            field.addEventListener('blur', function() {
                const result = fields[fieldId].validate(this.value);
                showFieldFeedback(fieldId, result.message, result.valid);
            });
            
            // Clear validation on input
            field.addEventListener('input', function() {
                if (this.classList.contains('is-invalid')) {
                    showFieldFeedback(fieldId, '');
                }
            });
        }
    });
    
    // Special handling for role change
    document.getElementById('role').addEventListener('change', function() {
        toggleStudentFields();
        const result = fields.role.validate(this.value);
        showFieldFeedback('role', result.message, result.valid);
    });
}

// Setup password strength checker
function setupPasswordStrength() {
    const passwordField = document.getElementById('password');
    
    passwordField.addEventListener('input', function() {
        updatePasswordStrength(this.value);
        
        // Also validate confirm password if it has a value
        const confirmPassword = document.getElementById('confirmPassword');
        if (confirmPassword.value) {
            const isMatch = confirmPassword.value === this.value;
            showFieldFeedback('confirmPassword', 
                isMatch ? 'Passwords match!' : 'Passwords do not match', 
                isMatch
            );
        }
    });
    
    // Validate confirm password on input
    document.getElementById('confirmPassword').addEventListener('input', function() {
        const password = document.getElementById('password').value;
        const isMatch = this.value === password;
        
        if (this.value) {
            showFieldFeedback('confirmPassword', 
                isMatch ? 'Passwords match!' : 'Passwords do not match', 
                isMatch
            );
        }
    });
}

// Setup signup form submission
function setupSignupSubmission() {
    const signupForm = document.getElementById('signupForm');
    
    signupForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('fullName').value.trim(),
            email: document.getElementById('email').value.trim(),
            role: document.getElementById('role').value,
            department: document.getElementById('department').value.trim(),
            password: document.getElementById('password').value,
            confirmPassword: document.getElementById('confirmPassword').value,
            agreeTerms: document.getElementById('agreeTerms').checked
        };
        
        // Add student ID if role is student
        if (formData.role === 'student') {
            formData.studentId = document.getElementById('studentId').value.trim();
        }
        
        // Validate form
        if (!validateSignupForm(formData)) {
            return;
        }
        
        // Show loading state
        setButtonLoading('signupBtn', true);
        clearFormValidation('signupForm');
        
        try {
            console.log('Attempting signup...');
            
            const requestBody = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: formData.role,
                department: formData.department
            };
            
            if (formData.role === 'student') {
                requestBody.studentId = formData.studentId;
            }
            
            const response = await apiCall('/auth/register', {
                method: 'POST',
                body: JSON.stringify(requestBody)
            });
            
            console.log('Signup successful:', response);
            
            // Store auth data
            localStorage.setItem('authToken', response.token);
            localStorage.setItem('currentUser', JSON.stringify(response.user));
            
            // Show success message
            showAlert('success', `Welcome to College Resource Hub, ${response.user.name}!`);
            
            // Redirect to main app
            redirectToApp();
            
        } catch (error) {
            console.error('Signup error:', error);
            
            // Show error message
            showAlert('error', error.message || 'Registration failed. Please try again.');
            
            // Show field-specific errors if available
            if (error.message.includes('email')) {
                showFieldFeedback('email', 'Email already exists or is invalid', false);
            }
            
        } finally {
            // Hide loading state
            setButtonLoading('signupBtn', false);
        }
    });
}

// Validate signup form
function validateSignupForm(formData) {
    let isValid = true;
    
    // Full name validation
    if (!formData.name) {
        showFieldFeedback('fullName', 'Full name is required', false);
        isValid = false;
    } else if (formData.name.length < 2) {
        showFieldFeedback('fullName', 'Name must be at least 2 characters', false);
        isValid = false;
    }
    
    // Email validation
    if (!formData.email) {
        showFieldFeedback('email', 'Email is required', false);
        isValid = false;
    } else if (!validateEmail(formData.email)) {
        showFieldFeedback('email', 'Please enter a valid email address', false);
        isValid = false;
    }
    
    // Role validation
    if (!formData.role) {
        showFieldFeedback('role', 'Please select your role', false);
        isValid = false;
    }
    
    // Department validation
    if (!formData.department) {
        showFieldFeedback('department', 'Department is required', false);
        isValid = false;
    }
    
    // Student ID validation (if student)
    if (formData.role === 'student') {
        if (!formData.studentId) {
            showFieldFeedback('studentId', 'Student ID is required', false);
            isValid = false;
        } else if (formData.studentId.length < 3) {
            showFieldFeedback('studentId', 'Student ID must be at least 3 characters', false);
            isValid = false;
        }
    }
    
    // Password validation
    if (!formData.password) {
        showFieldFeedback('password', 'Password is required', false);
        isValid = false;
    } else {
        const { strength } = checkPasswordStrength(formData.password);
        if (strength < 50) {
            showFieldFeedback('password', 'Password is too weak', false);
            isValid = false;
        }
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
        showFieldFeedback('confirmPassword', 'Please confirm your password', false);
        isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
        showFieldFeedback('confirmPassword', 'Passwords do not match', false);
        isValid = false;
    }
    
    // Terms agreement validation
    if (!formData.agreeTerms) {
        showAlert('error', 'Please agree to the Terms of Service and Privacy Policy');
        isValid = false;
    }
    
    return isValid;
}

// Handle social signup
function handleSocialSignup(provider) {
    showAlert('info', `${provider} signup will be implemented soon!`);
}