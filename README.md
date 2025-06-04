# Task Management Application

A comprehensive task management application built with React, NestJS, and AWS services. This application allows teams to collaborate on projects, manage tasks, and track progress efficiently.

It is a multi team application so you can create multiple teams, invite members to teams, create projects (groups tasks) and add tasks, assign tasks to team members, track task progress, and view team.

## Project Structure

- **`/frontend`**: React-based frontend application built with Vite
- **`/backend`**: NestJS-based RESTful API
- **`/email-lambda`**: AWS Lambda function for sending email notifications
- **`/notification-lambda`**: AWS Lambda function for handling notifications
- **`/solutions architecture`**: Architecture diagrams and documentation

## Features

- User authentication and authorization
- Team creation and management
- Project management
- Task creation, assignment, and tracking
- Comment system for tasks
- Real-time notifications
- Email notifications for important events
- User profile management

## Technology Stack

### Frontend
- React with Vite
- Redux for state management
- React Router for navigation
- Tailwind CSS for styling
- Axios for API communication

### Backend
- NestJS framework
- JWT authentication
- AWS DynamoDB for data storage
- AWS Lambda for serverless functions

### Infrastructure
#### Version 1
- AWS S3 and CloudFront for frontend hosting
- AWS ECS for backend container hosting
- AWS DynamoDB for database
- AWS Lambda for serverless functions

- url: http://amalitech-task-management-frontend-react-1234.s3-website.eu-central-1.amazonaws.com
- diagram: ** task management.drawio v1.png ** in solutions architecture directory
#### Version 2
- AWS ECS for frontend container hosting
- AWS ECS for backend container hosting
- AWS DynamoDB for database
- AWS Lambda for serverless functions
  
- url: http://task-management-alb-new-1581417271.eu-north-1.elb.amazonaws.com
- diagram: ** task management.drawio v2.png ** in solutions architecture directory

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- AWS account (for DynamoDB and Lambda functions)
- Docker and Docker Compose (optional)

### Local Development Setup

#### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Update the environment variables in the `.env` file with your AWS credentials and other configurations.

5. Start the development server:
   ```bash
   npm run start:dev
   ```

#### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file:
   ```bash
   echo "VITE_BACKEND_URL=http://localhost:3000" > .env
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Docker Setup

To run the entire application using Docker:

1. Make sure Docker and Docker Compose are installed on your system.

2. Build and start the containers:
   ```bash
   docker-compose up --build
   ```

This will start both the frontend and backend services in containers.

## Lambda Functions

### Email Lambda

The email lambda function handles sending emails for various events in the application:
- Team invitations
- Task assignments
- Password reset requests

Setup instructions are available in the `/email-lambda/README.md` file.

### Notification Lambda

The notification lambda function processes and delivers real-time notifications:
- Task status changes
- New comments
- Project updates

Setup instructions are available in the `/notification-lambda/README.md` file.

## API Documentation

The backend API provides endpoints for all application features. Detailed API documentation can be found in the backend README file.

Key endpoints include:
- Authentication: `/auth/*`
- User management: `/users/*`
- Team operations: `/teams/*`
- Project management: `/projects/*`
- Task operations: `/tasks/*`
- Comments: `/comments/*`

## Frontend Routes

The frontend application includes the following main routes:
- `/`: Home/Dashboard
- `/login`: User login
- `/register`: User registration
- `/profile`: User profile management
- `/team/:teamId`: Team details and management
- `/project/:projectId`: Project details and task management

## Authentication and Authorization

The application uses JWT (JSON Web Token) for authentication. Protected routes and API endpoints require a valid JWT token.

Authorization is implemented at both the frontend and backend levels to ensure users can only access resources they have permission to.

## Deployment

Deployment scripts and configurations are included for AWS services:
- Frontend: Deploy to S3 and CloudFront using `deploy-frontend.sh`
- Backend: Deploy to ECS using the provided task definition
- Lambda functions: Deploy using the scripts in their respective directories

## License

This project is licensed under the MIT License - see the LICENSE file for details.