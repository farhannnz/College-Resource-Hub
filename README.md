# College Resource Hub

A centralized platform for academic resources, announcements, and interactive support with AI-powered chatbot assistance.

## Features

### Core Functionality
- **Student & Faculty Login System** - Role-based authentication with JWT
- **Resource Repository** - Upload, manage, and download study materials (PDFs, notes, assignments)
- **Admin Privileges** - Add, update, and delete study materials with approval workflow
- **Announcements & Events** - Priority-based announcement system with expiry dates
- **Discussion Forums** - Q&A section with categories, likes, and resolution tracking
- **AI Chatbot** - NLP-based assistant for FAQs, guidance, and resource navigation
- **Admin Dashboard** - Content and chatbot management interface

### User Roles
- **Students** - Access resources, participate in forums, view announcements
- **Faculty** - All student privileges + upload resources, create announcements
- **Admin** - All privileges + user management, content moderation, system administration

## Technical Stack

- **Frontend**: HTML5, CSS3 (animated & responsive), JavaScript, Bootstrap 5
- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcryptjs
- **File Upload**: Multer middleware
- **Security**: Helmet, CORS, Rate limiting
- **Hosting**: Netlify (frontend), MongoDB Atlas (database)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd college-resource-hub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Copy `.env.example` to `.env`
   - Update the following variables:
     ```
     MONGODB_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret_key
     NODE_ENV=development
     ```

4. **Create uploads directory**
   ```bash
   mkdir -p public/uploads
   ```

5. **Start the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Resources
- `GET /api/resources` - Get all approved resources
- `POST /api/resources/upload` - Upload new resource
- `GET /api/resources/:id/download` - Download resource
- `PATCH /api/resources/:id/approve` - Approve resource (admin)
- `DELETE /api/resources/:id` - Delete resource (admin)

### Announcements
- `GET /api/announcements` - Get active announcements
- `POST /api/announcements` - Create announcement (faculty/admin)
- `PUT /api/announcements/:id` - Update announcement
- `DELETE /api/announcements/:id` - Delete announcement

### Forums
- `GET /api/forums` - Get all forum posts
- `POST /api/forums` - Create new post
- `GET /api/forums/:id` - Get specific post with replies
- `POST /api/forums/:id/reply` - Add reply to post
- `POST /api/forums/:id/like` - Like/unlike post
- `PATCH /api/forums/:id/resolve` - Mark post as resolved

### Chatbot
- `POST /api/chatbot/chat` - Send message to chatbot
- `GET /api/chatbot/stats` - Get chatbot statistics (admin)

## File Structure

```
college-resource-hub/
├── models/
│   ├── User.js              # User schema
│   ├── Resource.js          # Resource schema
│   ├── Announcement.js      # Announcement schema
│   └── Forum.js             # Forum schema
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── resources.js         # Resource management routes
│   ├── announcements.js     # Announcement routes
│   ├── forums.js            # Forum routes
│   └── chatbot.js           # Chatbot routes
├── middleware/
│   └── auth.js              # Authentication middleware
├── public/
│   ├── css/
│   │   └── style.css        # Main stylesheet
│   ├── js/
│   │   ├── app.js           # Main application logic
│   │   ├── auth.js          # Authentication handling
│   │   ├── resources.js     # Resource management
│   │   ├── announcements.js # Announcement handling
│   │   ├── forums.js        # Forum functionality
│   │   └── chatbot.js       # Chatbot interface
│   ├── uploads/             # File upload directory
│   └── index.html           # Main HTML file
├── server.js                # Express server setup
├── package.json             # Dependencies and scripts
└── .env                     # Environment variables
```

## Usage

### For Students
1. Register with student credentials
2. Browse and download study resources
3. Participate in forum discussions
4. View announcements and events
5. Use AI chatbot for assistance

### For Faculty
1. Register with faculty credentials
2. Upload and manage study materials
3. Create and manage announcements
4. Moderate forum discussions
5. Access all student features

### For Administrators
1. Manage user accounts and roles
2. Approve/reject uploaded resources
3. Moderate all content
4. Access system analytics
5. Configure chatbot responses

## Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Rate limiting to prevent abuse
- File type validation for uploads
- CORS protection
- Helmet security headers
- Input validation and sanitization

## Success Metrics

- Number of active users (students/faculty)
- Frequency of study material uploads/downloads
- Forum engagement (posts, replies, resolutions)
- Chatbot usage statistics
- Reduction in communication gaps

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For technical support or questions:
- Create an issue in the repository
- Contact the development team
- Use the in-app chatbot for basic queries