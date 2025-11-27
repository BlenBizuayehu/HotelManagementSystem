# TaskFlow - Modern Task & Project Management System

A full-stack task and project management application built with React, TypeScript, Node.js, Express, and MongoDB.

## Features

- 🔐 **Authentication**: Secure JWT-based authentication system
- 📁 **Projects**: Create and manage multiple projects
- ✅ **Tasks**: Organize tasks with status, priority, and assignments
- 👥 **Team Collaboration**: Add members to projects
- 📊 **Dashboard**: Overview of projects and tasks
- 🎨 **Modern UI**: Clean and intuitive user interface

## Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- React Router
- Axios

### Backend
- Node.js
- Express
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone or navigate to the project directory**

2. **Backend Setup**
   ```bash
   cd taskflow-system/backend
   npm install
   cp .env.example .env
   # Edit .env with your MongoDB connection string and JWT secret
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd taskflow-system/frontend
   npm install
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## Project Structure

```
taskflow-system/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   └── types.ts
│   └── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get single project
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tasks
- `GET /api/tasks` - Get all tasks (with optional filters)
- `GET /api/tasks/:id` - Get single task
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

## Environment Variables

### Backend (.env)
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/taskflow
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## License

MIT
