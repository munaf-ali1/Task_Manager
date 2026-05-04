# Team Task Manager

A full-stack MERN application for managing team projects and tasks with role-based access control.

## Features

- **Authentication**: Signup and Login with JWT.
- **Roles**: Admin (create projects, manage any task) and Member (view assigned projects, manage tasks within their projects).
- **Projects**: Group tasks logically. Only Admins can create or delete projects.
- **Tasks**: Kanban-style tasks with statuses (Todo, In Progress, Done) and due dates.
- **Dashboard**: High-level overview of task statuses and overdue tasks.

## Tech Stack

- **Frontend**: React, Vite, React Router DOM, Axios, plain CSS.
- **Backend**: Node.js, Express, MongoDB, Mongoose, JSON Web Tokens.

## Project Structure

- `backend/`: Express server, mongoose models, controllers, and routes.
- `frontend/`: React application scaffolded with Vite.

## Setup Instructions

### Prerequisites
- Node.js (v16+ recommended)
- MongoDB running locally or a MongoDB Atlas URI

### 1. Clone the repository
\`\`\`bash
git clone <repository-url>
cd team-task-manager
\`\`\`

### 2. Backend Setup
\`\`\`bash
cd backend
npm install
\`\`\`

Create a \`.env\` file in the `backend/` directory with the following variables:
\`\`\`env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/team-task-manager
JWT_SECRET=supersecretjwtkey
\`\`\`

Run the backend:
\`\`\`bash
# Development
npm run dev

# Production
npm start
\`\`\`

### 3. Frontend Setup
\`\`\`bash
cd frontend
npm install
\`\`\`

Run the frontend:
\`\`\`bash
npm run dev
\`\`\`

The frontend runs on \`http://localhost:5173\` and proxies/connects to the backend at \`http://localhost:5000\`.

## API Endpoints

### Auth
- \`POST /api/auth/register\` - Register a new user
- \`POST /api/auth/login\` - Authenticate and get token
- \`GET /api/auth/me\` - Get current logged in user
- \`GET /api/auth/users\` - Get all users

### Projects
- \`GET /api/projects\` - Get all projects (based on role)
- \`POST /api/projects\` - Create project (Admin only)
- \`GET /api/projects/:id\` - Get single project
- \`PUT /api/projects/:id\` - Update project (Admin only)
- \`DELETE /api/projects/:id\` - Delete project (Admin only)

### Tasks
- \`GET /api/tasks\` - Get tasks
- \`POST /api/tasks\` - Create task
- \`GET /api/tasks/:id\` - Get single task
- \`PUT /api/tasks/:id\` - Update task
- \`DELETE /api/tasks/:id\` - Delete task
- \`GET /api/tasks/summary\` - Get tasks summary for dashboard

## Railway Deployment

This project is structured to be easily deployed on [Railway](https://railway.app/).

1. Create a new project on Railway.
2. Add a **MongoDB** database from the Railway marketplace.
3. Link your GitHub repository.
4. Deploy the \`backend\` directory as a web service. Set the following Environment Variables in Railway:
   - \`PORT\` = (Railway will assign this, or default to 8080)
   - \`MONGO_URI\` = (Use the internal connection string of your Railway MongoDB instance)
   - \`JWT_SECRET\` = (Generate a strong secret key)
5. Deploy the \`frontend\` directory as a static site. Set the root directory appropriately and specify the build command (\`npm run build\`).
6. Update the Axios baseURL in \`frontend/src/services/api/axios.js\` to point to your live backend Railway URL.
