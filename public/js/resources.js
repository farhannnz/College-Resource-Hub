// Resources management

// Load resources
async function loadResources() {
    showLoading('resourcesList');
    
    try {
        const params = new URLSearchParams();
        const category = document.getElementById('categoryFilter')?.value;
        const subject = document.getElementById('subjectFilter')?.value;
        const department = document.getElementById('departmentFilter')?.value;
        
        if (category) params.append('category', category);
        if (subject) params.append('subject', subject);
        if (department) params.append('department', department);
        
        const queryString = params.toString();
        const endpoint = queryString ? `/resources?${queryString}` : '/resources';
        
        const resources = await apiCall(endpoint);
        displayResources(resources);
        
    } catch (error) {
        showEmptyState('resourcesList', 'Failed to load resources. Please try again.', 'fas fa-exclamation-triangle');
    }
}

// Display resources
function displayResources(resources) {
    const container = document.getElementById('resourcesList');
    
    if (!resources || resources.length === 0) {
        showEmptyState('resourcesList', 'No resources found. Try adjusting your filters.', 'fas fa-search');
        return;
    }
    
    // Add stagger animation class
    container.className = 'row stagger-animation';
    
    const resourcesHtml = resources.map((resource, index) => `
        <div class="col-md-6 col-lg-4 mb-4">
            <div class="card resource-card h-100">
                <div class="card-body">
                    <h5 class="card-title">${resource.title}</h5>
                    <p class="card-text text-truncate-3">${resource.description}</p>
                    
                    <div class="resource-meta mb-3">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="badge bg-primary">${resource.category}</span>
                            <small class="text-muted">${formatFileSize(resource.fileSize)}</small>
                        </div>
                        <div class="small text-muted">
                            <div><strong>Subject:</strong> ${resource.subject}</div>
                            <div><strong>Department:</strong> ${resource.department}</div>
                            <div><strong>Semester:</strong> ${resource.semester}</div>
                            <div><strong>Uploaded by:</strong> ${resource.uploadedBy.name} (${resource.uploadedBy.role})</div>
                            <div><strong>Downloads:</strong> ${resource.downloads}</div>
                            <div><strong>Date:</strong> ${formatDate(resource.createdAt)}</div>
                        </div>
                    </div>
                    
                    <div class="resource-actions">
                        <button class="btn btn-primary btn-sm" onclick="downloadResource('${resource._id}')">
                            <i class="fas fa-download me-1"></i>Download
                        </button>
                        ${currentUser && currentUser.role === 'admin' ? `
                            <button class="btn btn-danger btn-sm ms-2" onclick="deleteResource('${resource._id}')">
                                <i class="fas fa-trash me-1"></i>Delete
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = resourcesHtml;
}

// Filter resources
function filterResources() {
    loadResources();
}

// Show upload modal
function showUploadModal() {
    if (!currentUser) {
        showAlert('error', 'Please login to upload resources');
        return;
    }
    
    const modalHtml = `
        <div class="modal fade" id="uploadModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-upload me-2"></i>Upload Resource
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="uploadForm" enctype="multipart/form-data">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="uploadTitle" class="form-label">Title</label>
                                        <input type="text" class="form-control" id="uploadTitle" required>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="uploadCategory" class="form-label">Category</label>
                                        <select class="form-select" id="uploadCategory" required>
                                            <option value="">Select Category</option>
                                            <option value="notes">Notes</option>
                                            <option value="assignments">Assignments</option>
                                            <option value="presentations">Presentations</option>
                                            <option value="books">Books</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <label for="uploadDescription" class="form-label">Description</label>
                                <textarea class="form-control" id="uploadDescription" rows="3" required></textarea>
                            </div>
                            
                            <div class="row">
                                <div class="col-md-4">
                                    <div class="mb-3">
                                        <label for="uploadSubject" class="form-label">Subject</label>
                                        <input type="text" class="form-control" id="uploadSubject" required>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="mb-3">
                                        <label for="uploadDepartment" class="form-label">Department</label>
                                        <input type="text" class="form-control" id="uploadDepartment" value="${currentUser.department || ''}" required>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="mb-3">
                                        <label for="uploadSemester" class="form-label">Semester</label>
                                        <input type="text" class="form-control" id="uploadSemester" required>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <label for="uploadFile" class="form-label">File</label>
                                <input type="file" class="form-control" id="uploadFile" accept=".pdf,.doc,.docx,.ppt,.pptx,.txt" required>
                                <div class="form-text">Supported formats: PDF, DOC, DOCX, PPT, PPTX, TXT (Max: 10MB)</div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="handleUpload()">
                            <span class="upload-btn-text">Upload</span>
                            <span class="upload-spinner d-none">
                                <span class="spinner-border spinner-border-sm me-2"></span>
                                Uploading...
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('modalsContainer').innerHTML = modalHtml;
    const modal = new bootstrap.Modal(document.getElementById('uploadModal'));
    modal.show();
    
    // Handle form submission
    document.getElementById('uploadForm').addEventListener('submit', function(e) {
        e.preventDefault();
        handleUpload();
    });
}

// Handle file upload
async function handleUpload() {
    const title = document.getElementById('uploadTitle').value;
    const category = document.getElementById('uploadCategory').value;
    const description = document.getElementById('uploadDescription').value;
    const subject = document.getElementById('uploadSubject').value;
    const department = document.getElementById('uploadDepartment').value;
    const semester = document.getElementById('uploadSemester').value;
    const file = document.getElementById('uploadFile').files[0];
    
    // Validation
    if (!title || !category || !description || !subject || !department || !semester || !file) {
        showAlert('error', 'Please fill in all fields and select a file');
        return;
    }
    
    // File size validation (10MB)
    if (file.size > 10 * 1024 * 1024) {
        showAlert('error', 'File size must be less than 10MB');
        return;
    }
    
    // Show loading state
    const btnText = document.querySelector('.upload-btn-text');
    const btnSpinner = document.querySelector('.upload-spinner');
    btnText.classList.add('d-none');
    btnSpinner.classList.remove('d-none');
    
    try {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('category', category);
        formData.append('description', description);
        formData.append('subject', subject);
        formData.append('department', department);
        formData.append('semester', semester);
        formData.append('file', file);
        
        const response = await fetch('/api/resources/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            body: formData
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Upload failed');
        }
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('uploadModal'));
        modal.hide();
        
        // Reload resources
        loadResources();
        
        const approvalMessage = currentUser.role === 'admin' || currentUser.role === 'faculty' 
            ? 'Resource uploaded and approved successfully!' 
            : 'Resource uploaded successfully! It will be visible after admin approval.';
            
        showAlert('success', approvalMessage);
        
    } catch (error) {
        showAlert('error', error.message);
    } finally {
        // Reset button state
        btnText.classList.remove('d-none');
        btnSpinner.classList.add('d-none');
    }
}

// Download resource
async function downloadResource(resourceId) {
    try {
        const response = await apiCall(`/resources/${resourceId}/download`);
        
        // Create download link
        const link = document.createElement('a');
        link.href = response.downloadUrl;
        link.download = '';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showAlert('success', 'Download started');
        
        // Reload resources to update download count
        setTimeout(() => loadResources(), 1000);
        
    } catch (error) {
        showAlert('error', 'Download failed. Please try again.');
    }
}

// Delete resource (admin only)
async function deleteResource(resourceId) {
    if (!confirm('Are you sure you want to delete this resource?')) {
        return;
    }
    
    try {
        await apiCall(`/resources/${resourceId}`, {
            method: 'DELETE'
        });
        
        showAlert('success', 'Resource deleted successfully');
        loadResources();
        
    } catch (error) {
        showAlert('error', 'Failed to delete resource');
    }
}