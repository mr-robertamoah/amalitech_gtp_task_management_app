# Task Management Application - Frontend

A React-based frontend for the Task Management Application built with Vite, Redux, and Tailwind CSS.

## Features

- User authentication (login/register)
- Team management
- Project management
- Task creation and assignment
- Task status tracking
- User profile management
- Real-time notifications

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
VITE_BACKEND_URL=http://localhost:3000
```

For production, set this to your deployed backend URL.

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Docker Setup

```bash
# Build the Docker image
docker build -t task-management-frontend .

# Run the container
docker run -p 80:80 -e VITE_BACKEND_URL=http://your-backend-url task-management-frontend
```

## Main Routes

| Route | Description |
|-------|-------------|
| `/` | Home page - Dashboard with user's tasks |
| `/login` | User login page |
| `/register` | User registration page |
| `/profile` | User profile management |
| `/team/:teamId` | Team details and management |
| `/project/:projectId` | Project details and task management |

## API Integration

The application communicates with the backend through RESTful API endpoints. All API calls are made through the Axios instance configured in `src/api/axios.js`.

Authentication is handled via JWT tokens stored in Redux state and automatically included in API requests via Axios interceptors.

## Services

| Service | Description |
|---------|-------------|
| `userService` | User authentication and profile management |
| `teamService` | Team creation, updates, and member management |
| `projectService` | Project CRUD operations |
| `taskService` | Task creation, assignment, and status updates |
| `userTaskService` | User-specific task operations |

## State Management

Redux is used for global state management with the following slices:

- `userSlice` - Authentication state and user data
- `teamsSlice` - Teams data
- `projectsSlice` - Projects data
- `tasksSlice` - Tasks data
- `userTasksSlice` - User-specific tasks
- `alertsSlice` - Application notifications and alerts