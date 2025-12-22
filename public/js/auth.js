// Authentication functions

// Show login modal
function showLogin() {
    const modalHtml = `
        <div class="modal fade" id="loginModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-sign-in-alt me-2"></i>Login
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="loginForm">
                            <div class="mb-3">
                                <label for="loginEmail" class="form-label">Email</label>
                                <input type="email" class="form-control" id="loginEmail" required>
                            </div>
                            <div class="mb-3">
                                <label for="loginPassword" class="form-label">Password</label>
                                <input type="password" class="form-control" id="loginPassword" required>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="handleLogin()">
                            <span class="login-btn-text">Login</span>
                            <span class="login-spinner d-none">
                                <span class="spinner-border spinner-border-sm me-2"></span>
                                Logging in...
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('modalsContainer').innerHTML = modalHtml;
    const modal = new bootstrap.Modal(document.getElementById('loginModal'));
    modal.show();
    
    // Handle form submission
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        handleLogin();
    });
}

// Show register modal
function showRegister() {
    const modalHtml = `
        <div class="modal fade" id="registerModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-user-plus me-2"></i>Register
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="registerForm">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="registerName" class="form-label">Full Name</label>
                                        <input type="text" class="form-control" id="registerName" required>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="registerEmail" class="form-label">Email</label>
                                        <input type="email" class="form-control" id="registerEmail" required>
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="registerPassword" class="form-label">Password</label>
                                        <input type="password" class="form-control" id="registerPassword" required minlength="6">
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="confirmPassword" class="form-label">Confirm Password</label>
                                        <input type="password" class="form-control" id="confirmPassword" required>
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="registerRole" class="form-label">Role</label>
                                        <select class="form-select" id="registerRole" required onchange="toggleStudentFields()">
                                            <option value="">Select Role</option>
                                            <option value="student">Student</option>
                                            <option value="faculty">Faculty</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="registerDepartment" class="form-label">Department</label>
                                        <select class="form-select" id="registerDepartment" required>
                                            <option value="">Select Department</option>
                                            <option value="Civil Engineering">Civil Engineering</option>
                                            <option value="Electrical Engineering">Electrical Engineering</option>
                                            <option value="Electronics and Telecommunications Engineering">Electronics and Telecommunications Engineering</option>
                                            <option value="Computer Engineering">Computer Engineering</option>
                                            <option value="Chemical Engineering">Chemical Engineering</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div class="row" id="studentFields" style="display: none;">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="registerStudentId" class="form-label">Student ID</label>
                                        <input type="text" class="form-control" id="registerStudentId">
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="handleRegister()">
                            <span class="register-btn-text">Register</span>
                            <span class="register-spinner d-none">
                                <span class="spinner-border spinner-border-sm me-2"></span>
                                Registering...
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('modalsContainer').innerHTML = modalHtml;
    const modal = new bootstrap.Modal(document.getElementById('registerModal'));
    modal.show();
    
    // Handle form submission
    document.getElementById('registerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        handleRegister();
    });
}

// Toggle student-specific fields
function toggleStudentFields() {
    const role = document.getElementById('registerRole').value;
    const studentFields = document.getElementById('studentFields');
    const studentIdField = document.getElementById('registerStudentId');
    
    if (role === 'student') {
        studentFields.style.display = 'block';
        studentIdField.required = true;
    } else {
        studentFields.style.display = 'none';
        studentIdField.required = false;
        studentIdField.value = '';
    }
}

// Handle login
async function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showAlert('error', 'Please fill in all fields');
        return;
    }
    
    // Show loading state
    const btnText = document.querySelector('.login-btn-text');
    const btnSpinner = document.querySelector('.login-spinner');
    btnText.classList.add('d-none');
    btnSpinner.classList.remove('d-none');
    
    try {
        const response = await apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        // Store auth data
        authToken = response.token;
        currentUser = response.user;
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Update UI and show main app
        updateAuthUI();
        showMainApp();
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
        modal.hide();
        
        showAlert('success', `Welcome back, ${currentUser.name}!`);
        
    } catch (error) {
        console.error('Login error:', error);
    } finally {
        // Reset button state
        btnText.classList.remove('d-none');
        btnSpinner.classList.add('d-none');
    }
}

// Handle registration
async function handleRegister() {
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const role = document.getElementById('registerRole').value;
    const department = document.getElementById('registerDepartment').value;
    const studentId = document.getElementById('registerStudentId').value;
    
    // Validation
    if (!name || !email || !password || !role || !department) {
        showAlert('error', 'Please fill in all required fields');
        return;
    }
    
    if (password !== confirmPassword) {
        showAlert('error', 'Passwords do not match');
        return;
    }
    
    if (password.length < 6) {
        showAlert('error', 'Password must be at least 6 characters long');
        return;
    }
    
    if (role === 'student' && !studentId) {
        showAlert('error', 'Student ID is required for students');
        return;
    }
    
    // Show loading state
    const btnText = document.querySelector('.register-btn-text');
    const btnSpinner = document.querySelector('.register-spinner');
    btnText.classList.add('d-none');
    btnSpinner.classList.remove('d-none');
    
    try {
        const requestBody = {
            name,
            email,
            password,
            role,
            department
        };
        
        if (role === 'student') {
            requestBody.studentId = studentId;
        }
        
        const response = await apiCall('/auth/register', {
            method: 'POST',
            body: JSON.stringify(requestBody)
        });
        
        // Store auth data
        authToken = response.token;
        currentUser = response.user;
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Update UI
        updateAuthUI();
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
        modal.hide();
        
        showAlert('success', `Welcome to College Resource Hub, ${currentUser.name}!`);
        
    } catch (error) {
        console.error('Registration error:', error);
    } finally {
        // Reset button state
        btnText.classList.remove('d-none');
        btnSpinner.classList.add('d-none');
    }
}