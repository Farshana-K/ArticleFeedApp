# Article Feed Web Application

A full-stack article feed web application where users can create and manage articles, personalize their feed based on interests, and interact with articles through likes, dislikes, and blocks.

## Features

### Authentication

* User registration and login
* Login using email or phone number
* JWT-based authentication
* Access and refresh token handling using HTTP-only cookies
* Secure password hashing with bcrypt
* Logout functionality

### User Preferences

* Select article categories during registration
* Add or remove interests from Settings
* Personalized article feed based on selected interests

### Articles

* Create unlimited articles
* Add title, description, images, tags, and category
* Upload article images using Cloudinary
* View article details
* Edit own articles
* Delete own articles
* View all personal articles

### Article Interactions

* Like articles
* Dislike articles
* Block articles
* Remove interactions
* View interaction counts
* Blocked articles are excluded from the personalized feed

### Settings

* Update personal information
* Change password
* Manage article preferences
* View blocked articles
* Unblock articles
* Logout

### Authorization

* Protected authenticated routes
* Users can modify or delete only their own articles
* Admin-only category management
* Role-based authorization

## Tech Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* Redux Toolkit
* React Router
* Axios
* React Hook Form
* Zod
* Lucide React

### Backend

* Node.js
* Express.js
* TypeScript
* MongoDB
* Mongoose
* JWT
* bcryptjs
* Zod
* Cloudinary
* Multer
* Helmet
* CORS
* Cookie Parser
* Morgan

## Architecture

The backend follows an **MVC-inspired modular architecture**.

The main request flow is:

```text
Route
  ↓
Middleware
  ↓
Validator
  ↓
Controller
  ↓
Service
  ↓
Repository
  ↓
Model
  ↓
MongoDB
```

### Responsibilities

* **Routes** handle API endpoint definitions.
* **Middlewares** handle authentication, authorization, validation, and file uploads.
* **Validators** validate incoming request data using Zod.
* **Controllers** handle HTTP requests and responses.
* **Services** contain application and business logic.
* **Repositories** handle database access.
* **Models** define MongoDB/Mongoose data structures.

This separation keeps business logic independent from HTTP and database concerns and makes the application easier to maintain and extend.

## Project Structure

```text
ArticleFeedApp/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── constants/
│   │   ├── controllers/
│   │   ├── dto/
│   │   ├── errors/
│   │   ├── interfaces/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── validators/
│   │   ├── app.ts
│   │   └── server.ts
│   │
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── store/
│   │   ├── types/
│   │   ├── validators/
│   │   └── ...
│   │
│   └── package.json
│
└── README.md
```

## Authentication and Security

The application uses JWT-based authentication.

* Access tokens are short-lived.
* Refresh tokens are used to obtain a new access token.
* Tokens are stored using HTTP-only cookies.
* Protected endpoints require authentication.
* Passwords are hashed using bcrypt.
* Zod validates incoming request data.
* Helmet provides security-related HTTP headers.
* CORS restricts frontend access to the configured client URL.
* Article update and delete operations verify article ownership.
* Admin operations verify the authenticated user's role.

## Image Upload

Article images are uploaded through the backend and stored using Cloudinary.

The upload flow is:

```text
Frontend
   ↓
Multipart Form Data
   ↓
Multer
   ↓
Backend Upload Controller
   ↓
Cloudinary
   ↓
Image URL
   ↓
Article
```

The application stores the resulting Cloudinary URLs with the article rather than storing image files directly in MongoDB.

## Environment Variables

Create a `.env` file inside the `backend` directory.

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/article-feeds

# JWT
JWT_ACCESS_SECRET=replace_with_a_long_random_secret
JWT_REFRESH_SECRET=replace_with_a_different_long_random_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Client
CLIENT_URL=http://localhost:5173

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Important

Never commit the real `.env` file, JWT secrets, database credentials, or Cloudinary credentials to GitHub.

Use `.env.example` to document the required variables without exposing secrets.

## Installation

Clone the repository:

```bash
git clone https://github.com/Farshana-K/ArticleFeedApp.git
cd ArticleFeedApp
```

### Backend Setup

```bash
cd backend
npm install
```

Create the `.env` file using the environment variables described above.

Start the backend:

```bash
npm run dev
```

The backend runs on:

```text
http://localhost:5000
```

### Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
```

Start the frontend:

```bash
npm run dev
```

The frontend runs on:

```text
http://localhost:5173
```

## Database

The application uses MongoDB.

For local development, the default database URL is:

```text
mongodb://localhost:27017/article-feeds
```

A MongoDB Atlas connection string can also be used by replacing the `MONGODB_URI` value.

## API Overview

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
GET  /api/auth/me
```

### Users

```text
GET /api/users/profile
PUT /api/users/profile
PUT /api/users/password
PUT /api/users/preferences
```

### Categories

```text
GET    /api/categories
GET    /api/categories/:id
POST   /api/categories
PUT    /api/categories/:id
PATCH  /api/categories/:id/status
DELETE /api/categories/:id
```

Category creation, update, status management, and deletion require administrator authorization.

### Articles

```text
GET    /api/articles
GET    /api/articles/feed
GET    /api/articles/my
GET    /api/articles/blocked
GET    /api/articles/:id
POST   /api/articles
PUT    /api/articles/:id
DELETE /api/articles/:id
POST   /api/articles/upload-image
```

### Article Interactions

```text
POST   /api/articles/:id/interaction
DELETE /api/articles/:id/interaction
```

Supported interactions:

```text
like
dislike
block
```

## Validation

Request validation is handled using Zod.

Validation is applied at the API boundary before business logic is executed.

Examples include:

* Required fields
* Email format
* Phone number format
* Password requirements
* ObjectId validation
* Article fields
* Category IDs
* Article interaction types

## Testing and Type Checking

Run TypeScript type checking before committing changes.

### Backend

```bash
npm run type-check
```

### Frontend

```bash
npm run type-check
```

The project should pass type checking before changes are pushed to GitHub.

## Deployment

The application is designed to be deployed as two parts:

```text
Frontend
   ↓
Frontend Hosting

Backend
   ↓
Node.js / Express Server
   ↓
MongoDB
   ↓
Cloudinary
```

Before deployment:

1. Configure production environment variables.
2. Replace the development `CLIENT_URL` with the production frontend URL.
3. Configure the production MongoDB connection string.
4. Configure Cloudinary credentials.
5. Generate strong production JWT secrets.
6. Build the frontend.
7. Build and start the backend.
8. Verify authentication, article creation, image uploads, interactions, and personalized feeds.

## Live Demo

> Coming soon.

## GitHub Repository

[Article Feed Web Application](https://github.com/Farshana-K/ArticleFeedApp)

## Future Improvements

Possible future improvements include:

* Pagination for article feeds
* Search and filtering
* Article comments
* Notifications
* Advanced recommendation logic
* Automated testing
* CI/CD pipeline
* Containerization with Docker

## Author

**Farshana K**

B.Tech Computer Science and Engineering

Full-Stack Developer — MERN Stack
