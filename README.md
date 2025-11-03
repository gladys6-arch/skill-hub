# Skill Hub

A modern web platform connecting learners and teachers to share skills and knowledge. Built with React frontend and Flask backend.

## Features

### For Students
- Browse and enroll in courses and skills
- Track learning progress with interactive dashboards
- Request study sessions with teachers
- Real-time chat and video sessions
- Certificate generation upon completion
- M-Pesa payment integration

### For Teachers
- Create and manage courses and skills
- Add modules, quizzes, and interactive content
- Monitor student progress with analytics
- Accept/reject student requests
- Conduct video sessions with students
- View earnings and payment history
- Subscription management

### For Admins
- User management dashboard
- Platform revenue analytics
- Student progress monitoring
- System administration tools

## Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **React Router** - Navigation
- **Recharts** - Data visualization
- **Tailwind CSS** - Styling
- **Bootstrap** - UI components

### Backend
- **Flask** - Python web framework
- **SQLAlchemy** - Database ORM
- **Flask-JWT-Extended** - Authentication
- **SQLite** - Database
- **M-Pesa API** - Payment processing

## Installation

### Prerequisites
- Node.js (v16+)
- Python (v3.8+)
- pip

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
flask db upgrade
python seed.py  # Optional: seed sample data
flask run
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Usage

1. **Start Backend**: `cd backend && flask run` (runs on http://localhost:5000)
2. **Start Frontend**: `cd frontend && npm run dev` (runs on http://localhost:5173)
3. **Access Application**: Open http://localhost:5173

### Default Accounts
- **Admin**: admin@skillhub.com / admin123
- **Teacher**: teacher@skillhub.com / teacher123
- **Student**: student@skillhub.com / student123

## Project Structure

```
skill-hub/
├── backend/
│   ├── models/          # Database models
│   ├── routes/          # API endpoints
│   ├── utils/           # Helper functions
│   ├── app.py          # Flask application
│   └── config.py       # Configuration
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   └── Routes/      # Route configurations
│   ├── public/         # Static assets
│   └── package.json    # Dependencies
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/admin-login` - Admin login

### Courses & Skills
- `GET /api/courses` - List all courses
- `POST /api/teacher/courses` - Create course
- `GET /api/teacher/skills` - List teacher skills

### Payments
- `POST /api/payments/mpesa` - M-Pesa STK Push
- `GET /api/teacher/balance` - Teacher earnings

## Configuration

### Environment Variables
Create `.env` file in backend directory:
```
FLASK_APP=app.py
FLASK_ENV=development
SECRET_KEY=your-secret-key
MPESA_CONSUMER_KEY=your-mpesa-key
MPESA_CONSUMER_SECRET=your-mpesa-secret
MPESA_SHORTCODE=your-shortcode
MPESA_PASSKEY=your-passkey
```

## Features in Detail

### Payment Integration
- M-Pesa STK Push for course payments
- Real-time payment verification
- Teacher earnings tracking

### Video Sessions
- Jitsi Meet integration for video calls
- Real-time chat during sessions
- Session management for teachers

### Progress Tracking
- Module completion tracking
- Quiz scoring system
- Certificate generation
- Analytics dashboard

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -am 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Create Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@skillhub.com or create an issue in the repository.