# ArticleFeedApp

A full-stack article feed application built with **React, TypeScript, Node.js, Express, and MongoDB**.

## Features

* User registration and login
* Email verification with OTP
* Personalized article feed
* Create, edit, and delete articles
* Like and dislike articles
* Block and unblock articles
* Category-based preferences
* Profile and password management

## Tech Stack

**Frontend:** React, TypeScript, Redux Toolkit, Tailwind CSS
**Backend:** Node.js, Express, TypeScript
**Database:** MongoDB, Mongoose
**Validation:** Zod
**Authentication:** JWT, HTTP-only cookies

## Backend Architecture

```text
Route
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

The backend follows a layered architecture with separation of concerns and applies **SOLID principles** to improve maintainability, scalability, and testability.

## Project Structure

```text
backend/
└── src/
    ├── controllers/
    ├── services/
    ├── repositories/
    ├── models/
    ├── interfaces/
    ├── validators/
    ├── middlewares/
    ├── routes/
    └── config/
```

## Live Project

**Frontend:** https://article-feed-frontend-xi.vercel.app
**Backend:** https://articlefeedapp-backend.onrender.com
