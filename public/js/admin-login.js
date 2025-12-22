// Admin Login functionality
document.getElementById('adminLoginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const loginBtn = document.getElementById('loginBtn');
    
    // Show loading state
    loginBtn.disabled = true;
    loginBtn.querySelector('.btn-text').classList.add('d-none');
    loginBtn.querySelector('.btn-spinner').classList.remove('d-none');
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Check if user is admin
            if (data.user.role !== 'admin') {
                showAlert('Access Denied! Only administrators can access this portal.', 'danger');
                loginBtn.disabled = false;
                loginBtn.querySelector('.btn-text').classList.remove('d-none');
                loginBtn.querySelector('.btn-spinner').classList.add('d-none');
                return;
            }
            
            // Store token and user data
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            showAlert('Admin login successful! Redirecting...', 'success');
            
            // Redirect to main page after short delay
            setTimeout(() => {
                window.location.href = '/';
            }, 1000);
        } else {
            showAlert(data.message || 'Invalid admin credentials', 'danger');
            loginBtn.disabled = false;
            loginBtn.querySelector('.btn-text').classList.remove('d-none');
            loginBtn.querySelector('.btn-spinner').classList.add('d-none');
        }
    } catch (error) {
        showAlert('An error occurred. Please try again.', 'danger');
        loginBtn.disabled = false;
        loginBtn.querySelector('.btn-text').classList.remove('d-none');
        loginBtn.querySelector('.btn-spinner').classList.add('d-none');
    }
});

// Toggle password visibility
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const passwordIcon = document.getElementById('passwordIcon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        passwordIcon.classList.remove('fa-eye');
        passwordIcon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        passwordIcon.classList.remove('fa-eye-slash');
        passwordIcon.classList.add('fa-eye');
    }
}

// Show alert function
function showAlert(message, type) {
    const alertContainer = document.getElementById('alertContainer');
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
    alert.style.zIndex = '9999';
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    alertContainer.appendChild(alert);
    
    setTimeout(() => {
        alert.remove();
    }, 5000);
}
