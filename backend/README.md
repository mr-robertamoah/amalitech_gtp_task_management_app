# Task Management Application - Backend

A NestJS-based backend API for the Task Management Application with JWT authentication, DynamoDB integration, and AWS Lambda notifications.

## Features

- User authentication and authorization
- Team and project management
- Task creation, assignment, and tracking
- Comment system
- Email notifications
- DynamoDB integration

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- AWS account (for DynamoDB and Lambda functions)

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=1d

# AWS Configuration
AWS_REGION=your_aws_region
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key

# DynamoDB Configuration
DYNAMO_TABLE_NAME=your_dynamo_table_name

# CORS Configuration
ALLOWED_ORIGIN=http://localhost:5173

# Lambda Functions
EMAIL_LAMBDA_FUNCTION_NAME=send-email-function

# Server Port (optional)
PORT=3000
```

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run start:dev

# Build for production
npm run build

# Run production server
npm run start:prod
```

### Docker Setup

```bash
# Build the Docker image
docker build -t task-management-backend .

# Run the container
docker run -p 3000:3000 --env-file .env task-management-backend
```

## API Endpoints

### Authentication

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|-------------|----------|
| POST | `/auth/register` | Register a new user | `{ username, email, password }` | `{ access_token, user }` |
| POST | `/auth/login` | Login user | `{ email, password }` | `{ access_token, user }` |
| POST | `/auth/logout` | Logout user | - | `{ message }` |

### Users

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|-------------|----------|
| POST | `/users/:userId` | Update user profile | `{ username, email }` | Updated user object |
| POST | `/users/change-password` | Change password | `{ currentPassword, newPassword, confirmPassword }` | `{ message }` |
| DELETE | `/users/account` | Delete user account | - | `{ message }` |

### Teams

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|-------------|----------|
| GET | `/teams/:teamId` | Get team details | - | Team object |
| POST | `/teams` | Create a team | `{ name, description }` | Created team object |
| POST | `/teams/:teamId` | Update team | `{ name, description }` | Updated team object |
| DELETE | `/teams/:teamId` | Delete team | - | `{ message }` |
| POST | `/teams/:teamId/invite` | Invite users to team | `{ emails }` | `{ message }` |
| POST | `/teams/:teamId/respond-invitation` | Respond to invitation | `{ accept: boolean }` | `{ message }` |
| POST | `/teams/:teamId/remove-users` | Remove users from team | `{ userIds }` | `{ message }` |

### Projects

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|-------------|----------|
| GET | `/projects/:projectId` | Get project details | - | Project object |
| GET | `/projects/:projectId/public` | Get public project | - | Project object |
| POST | `/projects` | Create a project | `{ name, description, teamId, isPublic }` | Created project object |
| POST | `/projects/:projectId` | Update project | `{ name, description, isPublic }` | Updated project object |
| DELETE | `/projects/:projectId` | Delete project | - | `{ message }` |

### Tasks

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|-------------|----------|
| GET | `/tasks/:taskId` | Get task details | - | Task object |
| GET | `/tasks/users/:userId` | Get user's tasks | - | Array of tasks |
| GET | `/tasks/projects/:projectId` | Get project tasks | - | Array of tasks |
| GET | `/tasks/projects/:projectId/public` | Get public project tasks | - | Array of tasks |
| POST | `/tasks` | Create a task | `{ title, description, dueDate, projectId }` | Created task object |
| POST | `/tasks/:taskId` | Update task | `{ title, description, dueDate }` | Updated task object |
| POST | `/tasks/:taskId/change-status` | Change task status | `{ status }` | Updated task object |
| POST | `/tasks/:taskId/assign` | Assign task | `{ assigneeId }` | Updated task object |
| POST | `/tasks/:taskId/unassign` | Unassign task | - | Updated task object |
| DELETE | `/tasks/:taskId` | Delete task | - | `{ message }` |

### Comments

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|-------------|----------|
| GET | `/comments/tasks/:taskId` | Get task comments | - | Array of comments |
| POST | `/comments` | Create comment | `{ content, taskId }` | Created comment object |
| POST | `/comments/:commentId` | Update comment | `{ content }` | Updated comment object |
| DELETE | `/comments/:commentId` | Delete comment | - | `{ message }` |

## Authentication and Authorization

The application uses JWT (JSON Web Token) for authentication. Protected routes require a valid JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

Authorization is implemented at the service level, ensuring users can only access resources they have permission to.

## Database Structure

The application uses DynamoDB with the following main entities:

- **Users**: User accounts and profile information
- **Teams**: Team details and member associations
- **Projects**: Project information linked to teams
- **Tasks**: Task details linked to projects and assignees
- **Comments**: Comments linked to tasks and users

## Notification System

Email notifications are sent via AWS Lambda functions for events such as:
- Team invitations
- Task assignments
- Task status changes
- Comment notifications