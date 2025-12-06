// Forums management

// Load forum posts
async function loadForums() {
    showLoading('forumsList');
    
    try {
        const forums = await apiCall('/forums');
        displayForums(forums);
        
    } catch (error) {
        showEmptyState('forumsList', 'Failed to load forum posts. Please try again.', 'fas fa-exclamation-triangle');
    }
}

// Display forum posts
function displayForums(forums) {
    const container = document.getElementById('forumsList');
    
    if (!forums || forums.length === 0) {
        showEmptyState('forumsList', 'No forum posts found. Be the first to start a discussion!', 'fas fa-comments');
        return;
    }
    
    const forumsHtml = forums.map(forum => `
        <div class="card forum-card mb-3" onclick="viewForumPost('${forum._id}')">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <div class="flex-grow-1">
                        <h5 class="card-title mb-1">
                            ${forum.isPinned ? '<i class="fas fa-thumbtack text-warning me-2"></i>' : ''}
                            ${forum.title}
                            ${forum.isResolved ? '<span class="resolved-badge ms-2">Resolved</span>' : ''}
                        </h5>
                        <div class="forum-meta mb-2">
                            <span class="badge bg-primary me-2">${forum.category}</span>
                            ${forum.subject ? `<span class="badge bg-secondary me-2">${forum.subject}</span>` : ''}
                            <small class="text-muted">
                                by ${forum.author.name} (${forum.author.role}) • ${formatDate(forum.createdAt)}
                            </small>
                        </div>
                    </div>
                </div>
                
                <p class="card-text text-truncate-2">${forum.content}</p>
                
                <div class="forum-stats">
                    <span><i class="fas fa-eye me-1"></i>${forum.views} views</span>
                    <span><i class="fas fa-reply me-1"></i>${forum.replies.length} replies</span>
                    <span><i class="fas fa-heart me-1"></i>${forum.likes.length} likes</span>
                </div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = forumsHtml;
}

// Show create post modal
function showCreatePostModal() {
    if (!currentUser) {
        showAlert('error', 'Please login to create a post');
        return;
    }
    
    const modalHtml = `
        <div class="modal fade" id="createPostModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-plus me-2"></i>Create New Post
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="createPostForm">
                            <div class="mb-3">
                                <label for="postTitle" class="form-label">Title</label>
                                <input type="text" class="form-control" id="postTitle" required>
                            </div>
                            
                            <div class="mb-3">
                                <label for="postContent" class="form-label">Content</label>
                                <textarea class="form-control" id="postContent" rows="5" required></textarea>
                            </div>
                            
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="postCategory" class="form-label">Category</label>
                                        <select class="form-select" id="postCategory" required>
                                            <option value="">Select Category</option>
                                            <option value="general">General</option>
                                            <option value="academic">Academic</option>
                                            <option value="technical">Technical</option>
                                            <option value="career">Career</option>
                                            <option value="events">Events</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="postSubject" class="form-label">Subject (Optional)</label>
                                        <input type="text" class="form-control" id="postSubject" placeholder="e.g., Mathematics, Computer Science">
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="handleCreatePost()">
                            <span class="create-post-btn-text">Create Post</span>
                            <span class="create-post-spinner d-none">
                                <span class="spinner-border spinner-border-sm me-2"></span>
                                Creating...
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('modalsContainer').innerHTML = modalHtml;
    const modal = new bootstrap.Modal(document.getElementById('createPostModal'));
    modal.show();
    
    // Handle form submission
    document.getElementById('createPostForm').addEventListener('submit', function(e) {
        e.preventDefault();
        handleCreatePost();
    });
}

// Handle create post
async function handleCreatePost() {
    const title = document.getElementById('postTitle').value;
    const content = document.getElementById('postContent').value;
    const category = document.getElementById('postCategory').value;
    const subject = document.getElementById('postSubject').value;
    
    // Validation
    if (!title || !content || !category) {
        showAlert('error', 'Please fill in all required fields');
        return;
    }
    
    // Show loading state
    const btnText = document.querySelector('.create-post-btn-text');
    const btnSpinner = document.querySelector('.create-post-spinner');
    btnText.classList.add('d-none');
    btnSpinner.classList.remove('d-none');
    
    try {
        const requestBody = {
            title,
            content,
            category
        };
        
        if (subject) {
            requestBody.subject = subject;
        }
        
        await apiCall('/forums', {
            method: 'POST',
            body: JSON.stringify(requestBody)
        });
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('createPostModal'));
        modal.hide();
        
        // Reload forums
        loadForums();
        
        showAlert('success', 'Post created successfully!');
        
    } catch (error) {
        showAlert('error', error.message);
    } finally {
        // Reset button state
        btnText.classList.remove('d-none');
        btnSpinner.classList.add('d-none');
    }
}

// View forum post
function viewForumPost(postId) {
    showForumPostModal(postId);
}

// Show forum post modal
async function showForumPostModal(postId) {
    try {
        const post = await apiCall(`/forums/${postId}`);
        
        const modalHtml = `
            <div class="modal fade" id="forumPostModal" tabindex="-1">
                <div class="modal-dialog modal-xl">
                    <div class="modal-content">
                        <div class="modal-header">
                            <div class="flex-grow-1">
                                <h5 class="modal-title">
                                    ${post.isPinned ? '<i class="fas fa-thumbtack text-warning me-2"></i>' : ''}
                                    ${post.title}
                                    ${post.isResolved ? '<span class="resolved-badge ms-2">Resolved</span>' : ''}
                                </h5>
                                <div class="forum-meta">
                                    <span class="badge bg-primary me-2">${post.category}</span>
                                    ${post.subject ? `<span class="badge bg-secondary me-2">${post.subject}</span>` : ''}
                                    <small class="text-muted">
                                        by ${post.author.name} (${post.author.role}) • ${formatDate(post.createdAt)}
                                    </small>
                                </div>
                            </div>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-4">
                                <p class="lead">${post.content}</p>
                                <div class="d-flex align-items-center gap-3">
                                    <button class="btn btn-sm btn-outline-primary" onclick="likePost('${post._id}')">
                                        <i class="fas fa-heart me-1"></i>Like (${post.likes.length})
                                    </button>
                                    <span class="text-muted"><i class="fas fa-eye me-1"></i>${post.views} views</span>
                                    ${currentUser && (currentUser.id === post.author._id || currentUser.role === 'admin') ? `
                                        <button class="btn btn-sm btn-outline-success" onclick="toggleResolved('${post._id}', ${post.isResolved})">
                                            <i class="fas fa-check me-1"></i>
                                            Mark as ${post.isResolved ? 'Unresolved' : 'Resolved'}
                                        </button>
                                    ` : ''}
                                </div>
                            </div>
                            
                            <hr>
                            
                            <h6>Replies (${post.replies.length})</h6>
                            <div id="repliesList" class="mb-4">
                                ${post.replies.map(reply => `
                                    <div class="card mb-3">
                                        <div class="card-body">
                                            <div class="d-flex justify-content-between align-items-start mb-2">
                                                <div>
                                                    <strong>${reply.author.name}</strong>
                                                    <span class="badge bg-secondary ms-2">${reply.author.role}</span>
                                                </div>
                                                <small class="text-muted">${formatDate(reply.createdAt)}</small>
                                            </div>
                                            <p class="mb-2">${reply.content}</p>
                                            <button class="btn btn-sm btn-outline-primary" onclick="likeReply('${post._id}', '${reply._id}')">
                                                <i class="fas fa-heart me-1"></i>Like (${reply.likes.length})
                                            </button>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                            
                            ${currentUser ? `
                                <div class="card">
                                    <div class="card-header">
                                        <h6 class="mb-0">Add Reply</h6>
                                    </div>
                                    <div class="card-body">
                                        <form id="replyForm">
                                            <div class="mb-3">
                                                <textarea class="form-control" id="replyContent" rows="3" placeholder="Write your reply..." required></textarea>
                                            </div>
                                            <button type="button" class="btn btn-primary" onclick="handleAddReply('${post._id}')">
                                                <span class="reply-btn-text">Add Reply</span>
                                                <span class="reply-spinner d-none">
                                                    <span class="spinner-border spinner-border-sm me-2"></span>
                                                    Adding...
                                                </span>
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            ` : `
                                <div class="alert alert-info">
                                    <i class="fas fa-info-circle me-2"></i>
                                    Please <a href="#" onclick="showLogin()">login</a> to add replies.
                                </div>
                            `}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('modalsContainer').innerHTML = modalHtml;
        const modal = new bootstrap.Modal(document.getElementById('forumPostModal'));
        modal.show();
        
    } catch (error) {
        showAlert('error', 'Failed to load forum post');
    }
}

// Handle add reply
async function handleAddReply(postId) {
    const content = document.getElementById('replyContent').value;
    
    if (!content.trim()) {
        showAlert('error', 'Please enter a reply');
        return;
    }
    
    // Show loading state
    const btnText = document.querySelector('.reply-btn-text');
    const btnSpinner = document.querySelector('.reply-spinner');
    btnText.classList.add('d-none');
    btnSpinner.classList.remove('d-none');
    
    try {
        await apiCall(`/forums/${postId}/reply`, {
            method: 'POST',
            body: JSON.stringify({ content })
        });
        
        // Close modal and reload
        const modal = bootstrap.Modal.getInstance(document.getElementById('forumPostModal'));
        modal.hide();
        
        showAlert('success', 'Reply added successfully!');
        
        // Reload the post
        setTimeout(() => showForumPostModal(postId), 500);
        
    } catch (error) {
        showAlert('error', error.message);
    } finally {
        // Reset button state
        btnText.classList.remove('d-none');
        btnSpinner.classList.add('d-none');
    }
}

// Like post
async function likePost(postId) {
    if (!currentUser) {
        showAlert('error', 'Please login to like posts');
        return;
    }
    
    try {
        await apiCall(`/forums/${postId}/like`, {
            method: 'POST'
        });
        
        // Reload the post
        showForumPostModal(postId);
        
    } catch (error) {
        showAlert('error', 'Failed to like post');
    }
}

// Toggle resolved status
async function toggleResolved(postId, currentStatus) {
    try {
        await apiCall(`/forums/${postId}/resolve`, {
            method: 'PATCH'
        });
        
        showAlert('success', `Post marked as ${currentStatus ? 'unresolved' : 'resolved'}`);
        
        // Reload the post
        showForumPostModal(postId);
        
        // Also reload the forums list
        loadForums();
        
    } catch (error) {
        showAlert('error', 'Failed to update post status');
    }
}

// Like reply (placeholder)
function likeReply(postId, replyId) {
    showAlert('info', 'Reply like functionality would be implemented here');
}