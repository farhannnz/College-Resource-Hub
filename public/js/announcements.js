// Announcements management

// Load announcements
async function loadAnnouncements() {
    const container = document.getElementById('announcementsList');
    showLoading('announcementsList');
    
    try {
        const params = new URLSearchParams();
        const category = document.getElementById('announcementCategoryFilter')?.value;
        const department = document.getElementById('announcementDepartmentFilter')?.value;
        
        if (category) params.append('category', category);
        if (department) params.append('department', department);
        
        const queryString = params.toString();
        const endpoint = queryString ? `/announcements?${queryString}` : '/announcements';
        
        console.log('Loading announcements from:', endpoint);
        console.log('Full URL:', window.location.origin + '/api' + endpoint);
        
        const announcements = await apiCall(endpoint);
        console.log('Announcements loaded:', announcements);
        console.log('Number of announcements:', announcements ? announcements.length : 0);
        
        displayAnnouncements(announcements);
        
    } catch (error) {
        console.error('Error loading announcements:', error);
        console.error('Error details:', error.message, error.stack);
        container.innerHTML = `
            <div class="alert alert-danger">
                <h5>Failed to load announcements</h5>
                <p>${error.message}</p>
                <p class="mb-0">Please check the console for more details.</p>
            </div>
        `;
    }
}

// Display announcements
function displayAnnouncements(announcements) {
    const container = document.getElementById('announcementsList');
    
    console.log('displayAnnouncements called with:', announcements);
    console.log('Is array?', Array.isArray(announcements));
    console.log('Length:', announcements ? announcements.length : 'null/undefined');
    
    if (!announcements || announcements.length === 0) {
        showEmptyState('announcementsList', 'No announcements found. Try adjusting your filters.', 'fas fa-bullhorn');
        return;
    }
    
    try {
        const announcementsHtml = announcements.map((announcement, index) => {
            console.log(`Processing announcement ${index}:`, announcement);
            return `
            <div class="card announcement-card priority-${announcement.priority || 'medium'} mb-3">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <div class="d-flex align-items-center">
                        <h5 class="card-title mb-0">${announcement.title || 'Untitled'}</h5>
                        <span class="badge bg-${getPriorityColor(announcement.priority || 'medium')} priority-badge ms-2">
                            ${(announcement.priority || 'medium').toUpperCase()}
                        </span>
                    </div>
                    <div class="d-flex align-items-center">
                        <span class="badge bg-secondary me-2">${announcement.category || 'general'}</span>
                        ${currentUser && (currentUser.role === 'admin' || announcement.createdBy?._id === currentUser.id) ? `
                            <div class="dropdown">
                                <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                                    <i class="fas fa-ellipsis-v"></i>
                                </button>
                                <ul class="dropdown-menu">
                                    <li><a class="dropdown-item" href="#" onclick="editAnnouncement('${announcement._id}')">
                                        <i class="fas fa-edit me-2"></i>Edit
                                    </a></li>
                                    <li><a class="dropdown-item text-danger" href="#" onclick="deleteAnnouncement('${announcement._id}')">
                                        <i class="fas fa-trash me-2"></i>Delete
                                    </a></li>
                                </ul>
                            </div>
                        ` : ''}
                    </div>
                </div>
                <div class="card-body">
                    <p class="card-text">${announcement.content || 'No content'}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="text-muted small">
                            <div><strong>By:</strong> ${announcement.createdBy?.name || 'Unknown'} (${announcement.createdBy?.role || 'N/A'})</div>
                            <div><strong>Department:</strong> ${announcement.department || 'all'}</div>
                            <div><strong>Date:</strong> ${formatDate(announcement.createdAt)}</div>
                            ${announcement.expiryDate ? `<div><strong>Expires:</strong> ${formatDate(announcement.expiryDate)}</div>` : ''}
                        </div>
                        <div class="text-end">
                            ${(announcement.targetAudience || ['all']).map(audience => 
                                `<span class="badge bg-info me-1">${audience}</span>`
                            ).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
        }).join('');
        
        console.log('Generated HTML length:', announcementsHtml.length);
        container.innerHTML = announcementsHtml;
        console.log('Announcements displayed successfully');
        
    } catch (error) {
        console.error('Error in displayAnnouncements:', error);
        container.innerHTML = `
            <div class="alert alert-danger">
                Error displaying announcements: ${error.message}
            </div>
        `;
    }
}

// Get priority color
function getPriorityColor(priority) {
    switch (priority) {
        case 'urgent': return 'danger';
        case 'high': return 'warning';
        case 'medium': return 'info';
        case 'low': return 'secondary';
        default: return 'secondary';
    }
}

// Filter announcements
function filterAnnouncements() {
    loadAnnouncements();
}

// Show announcement modal
function showAnnouncementModal(announcementId = null) {
    if (!currentUser || (currentUser.role !== 'faculty' && currentUser.role !== 'admin')) {
        showAlert('error', 'Access denied. Faculty privileges required.');
        return;
    }
    
    const isEdit = !!announcementId;
    const modalTitle = isEdit ? 'Edit Announcement' : 'Create Announcement';
    
    const modalHtml = `
        <div class="modal fade" id="announcementModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-${isEdit ? 'edit' : 'plus'} me-2"></i>${modalTitle}
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="announcementForm">
                            <div class="mb-3">
                                <label for="announcementTitle" class="form-label">Title</label>
                                <input type="text" class="form-control" id="announcementTitle" required>
                            </div>
                            
                            <div class="mb-3">
                                <label for="announcementContent" class="form-label">Content</label>
                                <textarea class="form-control" id="announcementContent" rows="4" required></textarea>
                            </div>
                            
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="announcementCategory" class="form-label">Category</label>
                                        <select class="form-select" id="announcementCategory" required>
                                            <option value="">Select Category</option>
                                            <option value="general">General</option>
                                            <option value="academic">Academic</option>
                                            <option value="events">Events</option>
                                            <option value="urgent">Urgent</option>
                                            <option value="maintenance">Maintenance</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="announcementPriority" class="form-label">Priority</label>
                                        <select class="form-select" id="announcementPriority" required>
                                            <option value="low">Low</option>
                                            <option value="medium" selected>Medium</option>
                                            <option value="high">High</option>
                                            <option value="urgent">Urgent</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="announcementDepartment" class="form-label">Department</label>
                                        <select class="form-select" id="announcementDepartment" required>
                                            <option value="all">All Departments</option>
                                            <option value="Civil Engineering">Civil Engineering</option>
                                            <option value="Electrical Engineering">Electrical Engineering</option>
                                            <option value="Electronics and Telecommunications Engineering">Electronics and Telecommunications Engineering</option>
                                            <option value="Computer Engineering">Computer Engineering</option>
                                            <option value="Chemical Engineering">Chemical Engineering</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="announcementExpiry" class="form-label">Expiry Date (Optional)</label>
                                        <input type="datetime-local" class="form-control" id="announcementExpiry">
                                    </div>
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Target Audience</label>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="targetAll" value="all" checked>
                                    <label class="form-check-label" for="targetAll">All</label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="targetStudents" value="students">
                                    <label class="form-check-label" for="targetStudents">Students</label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="targetFaculty" value="faculty">
                                    <label class="form-check-label" for="targetFaculty">Faculty</label>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="handleAnnouncementSubmit(${isEdit ? `'${announcementId}'` : 'null'})">
                            <span class="announcement-btn-text">${isEdit ? 'Update' : 'Create'}</span>
                            <span class="announcement-spinner d-none">
                                <span class="spinner-border spinner-border-sm me-2"></span>
                                ${isEdit ? 'Updating...' : 'Creating...'}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('modalsContainer').innerHTML = modalHtml;
    const modal = new bootstrap.Modal(document.getElementById('announcementModal'));
    modal.show();
    
    // Handle form submission
    document.getElementById('announcementForm').addEventListener('submit', function(e) {
        e.preventDefault();
        handleAnnouncementSubmit(announcementId);
    });
    
    // If editing, load announcement data
    if (isEdit) {
        loadAnnouncementForEdit(announcementId);
    }
}

// Handle announcement submission
async function handleAnnouncementSubmit(announcementId = null) {
    const title = document.getElementById('announcementTitle').value;
    const content = document.getElementById('announcementContent').value;
    const category = document.getElementById('announcementCategory').value;
    const priority = document.getElementById('announcementPriority').value;
    const department = document.getElementById('announcementDepartment').value;
    const expiryDate = document.getElementById('announcementExpiry').value;
    
    // Get target audience
    const targetAudience = [];
    if (document.getElementById('targetAll').checked) targetAudience.push('all');
    if (document.getElementById('targetStudents').checked) targetAudience.push('students');
    if (document.getElementById('targetFaculty').checked) targetAudience.push('faculty');
    
    // Validation
    if (!title || !content || !category || !priority || !department) {
        showAlert('error', 'Please fill in all required fields');
        return;
    }
    
    if (targetAudience.length === 0) {
        showAlert('error', 'Please select at least one target audience');
        return;
    }
    
    // Show loading state
    const btnText = document.querySelector('.announcement-btn-text');
    const btnSpinner = document.querySelector('.announcement-spinner');
    btnText.classList.add('d-none');
    btnSpinner.classList.remove('d-none');
    
    try {
        const requestBody = {
            title,
            content,
            category,
            priority,
            department,
            targetAudience
        };
        
        if (expiryDate) {
            requestBody.expiryDate = expiryDate;
        }
        
        const method = announcementId ? 'PUT' : 'POST';
        const endpoint = announcementId ? `/announcements/${announcementId}` : '/announcements';
        
        await apiCall(endpoint, {
            method,
            body: JSON.stringify(requestBody)
        });
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('announcementModal'));
        modal.hide();
        
        // Reload announcements
        loadAnnouncements();
        
        showAlert('success', `Announcement ${announcementId ? 'updated' : 'created'} successfully!`);
        
    } catch (error) {
        showAlert('error', error.message);
    } finally {
        // Reset button state
        btnText.classList.remove('d-none');
        btnSpinner.classList.add('d-none');
    }
}

// Delete announcement
async function deleteAnnouncement(announcementId) {
    if (!confirm('Are you sure you want to delete this announcement?')) {
        return;
    }
    
    try {
        await apiCall(`/announcements/${announcementId}`, {
            method: 'DELETE'
        });
        
        showAlert('success', 'Announcement deleted successfully');
        loadAnnouncements();
        
    } catch (error) {
        showAlert('error', 'Failed to delete announcement');
    }
}

// Edit announcement (placeholder - would need to load existing data)
function editAnnouncement(announcementId) {
    showAnnouncementModal(announcementId);
}

// Load announcement for editing (placeholder)
async function loadAnnouncementForEdit(announcementId) {
    // This would typically fetch the announcement data and populate the form
    // For now, we'll just show the modal
    showAlert('info', 'Edit functionality would load existing announcement data');
}