# InsurAI - Insurance Management System

InsurAI is a modern, full-stack web application designed for insurance management, featuring a robust Spring Boot backend and a dynamic React frontend. It provides comprehensive tools for managing users, agents, and insurance policies with a focus on a premium user experience.

## 🚀 Features

- **User & Agent Portals**: Distinct dashboards for different user roles.
- **Policy Management**: Browse, purchase, and manage insurance plans.
- **Admin Dashboard**: Powerful controls for managing the platform.
- **Real-time Notifications**: WebSocket integration for instant alerts.
- **Secure Authentication**: JWT-based security with role-based access control.

## 🛠 Tech Stack

- **Backend**: Java 17, Spring Boot 3.5.1, Spring Security (JWT), Spring Data JPA.
- **Database**: MySQL 8.0.
- **Frontend**: React.js, Axios, SockJS/Stomp (WebSockets).
- **Build Tools**: Maven (Backend), NPM (Frontend).

## 📋 Prerequisites

Ensure you have the following installed:

- **Java Development Kit (JDK) 17** or higher
- **Node.js** (v16+) and **npm**
- **MySQL** Server (running on port 3306)

---

## ⚙️ Getting Started

### 1. Database Setup

1. Create a MySQL database named `insurai_db`.
2. The application is configured to automatically create tables (`ddl-auto=update`), but you need to ensure the database exists.

### 2. Backend Setup (`insurai-backend`)

The backend requires sensitive environment variables to run.

1. Navigate to the backend directory:

   ```bash
   cd insurai-backend
   ```

2. Create a `.env` file from the example:
   - Copy `.env.example` to a new file named `.env`.
   - Open `.env` and fill in your actual credentials:

     ```properties
     GROQ_API_KEY=your_groq_api_key
     DB_PASS=your_mysql_password
     JWT_SECRET=your_secure_jwt_secret
     ```

     *(Note: The `.env` file is git-ignored for security.)*

3. **Run the Application**:
   - **Windows (Recommended)**: Use the provided helper script which loads the `.env` variables automatically.

     ```powershell
     .\run_local.ps1
     ```

   - **Alternative (Manual)**: Set the environment variables in your IDE or terminal session and run:

     ```bash
     mvn spring-boot:run
     ```

The backend server will start on `http://localhost:8080`.

### 3. Frontend Setup (`insurai-frontend`)

1. Navigate to the frontend directory:

   ```bash
   cd insurai-frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm start
   ```

The frontend will start on `http://localhost:3000`.

---

## 📂 Project Structure

```
insurai/
├── insurai-backend/    # Spring Boot Application
│   ├── src/            # Java Source Code
│   ├── run_local.ps1   # Windows Run Script
│   └── pom.xml         # Maven Config
├── insurai-frontend/   # React Application
│   ├── src/            # React Components & Logic
│   └── package.json    # NPM Config
└── README.md           # Project Documentation
```

## 🔐 Credentials (Default)

*(For testing purposes only - change in production)*

- **Admin User**: (Created on first run if configured in startup logic)
- **Database**: `root` / `password` (Update in .env)
