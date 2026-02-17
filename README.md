# 🏥 InsurAI - Modern Insurance Management Platform

Welcome to **InsurAI**—a re-engineered, full-stack insurance management system designed for scalability, governance, and seamless user experience.

This platform connects **Users**, **Agents**, **Administrators**, and **Insurance Companies** in a unified ecosystem, featuring a robust Spring Boot backend and a dynamic React frontend.

---

## 🚀 Key Features

* **🏢 Company Management**: Insurance companies can register, manage their own policies, and view analytics.
* **👑 Super Admin Governance**: Approval workflows for new companies, system-wide oversight, and emergency controls.
* **📄 Policy & Claims**: Users can browse policies, purchase plans, and submit claims with document uploads.
* **👥 Role-Based Portals**: Distinct dashboards for Super Admins, Companies, Admins, Agents, and Users.
* **🔔 Real-time Notifications**: WebSocket integration for instant alerts and updates.
* **🎨 Unified Design System**: Consistent UI/UX with a custom design token system and premium aesthetics.

---

## 🛠 Tech Stack

### Backend

* **Language**: Java 17
* **Framework**: Spring Boot 3.x (Spring Security, Spring Data JPA)
* **Database**: MySQL 8.0
* **Security**: JWT Authentication & Role-Based Access Control (RBAC)
* **Build Tool**: Maven

### Frontend

* **Framework**: React.js (v18+)
* **Styling**: CSS Modules, Custom Design Tokens (`design-tokens.css`)
* **State Management**: React Context / Hooks
* **API Client**: Axios

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

1. **Java Development Kit (JDK) 17** or higher.
2. **Node.js** (v16+) and **npm**.
3. **MySQL Server** (running on port 3306).
4. **Git**.

---

## ⚙️ Quick Start Guide

Follow these steps to get the project up and running locally.

### 1. Database Setup

1. **Create the Database**:
    Open your MySQL client (e.g., MySQL Workbench, DBeaver) and run:

    ```sql
    CREATE DATABASE insurai_db;
    ```

2. **Run Migration Script**:
    The project includes a migration script to set up the initial schema and required tables.

    ```bash
    # If using command line
    mysql -u root -p insurai_db < database_migration.sql
    ```

    *Alternatively, you can let Spring Boot auto-generate tables (`ddl-auto=update`), but running the script is recommended for consistent state.*

### 2. Backend Setup (`insurai-backend`)

1. Navigate to the backend directory:

    ```bash
    cd insurai-backend
    ```

2. **Configure Environment Variables**:
    Create a `.env` file in the `insurai-backend` directory (copy from `.env.example` if available) and add your credentials:

    ```properties
    DB_URL=jdbc:mysql://localhost:3306/insurai_db
    DB_USER=root
    DB_PASS=your_mysql_password
    JWT_SECRET=your_secure_jwt_secret_key_ensure_this_is_long_enough
    GROQ_API_KEY=your_groq_api_key_optional
    ```

3. **Run the Application**:
    * **Windows (PowerShell)**:

        ```powershell
        ./run_local.ps1
        ```

    * **Manual (Maven)**:

        ```bash
        ./mvnw spring-boot:run
        ```

    The backend server will start on `http://localhost:8080`.

### 3. Frontend Setup (`insurai-frontend`)

1. Navigate to the frontend directory:

    ```bash
    cd ../insurai-frontend
    ```

2. **Install Dependencies**:

    ```bash
    npm install
    ```

3. **Start the Development Server**:

    ```bash
    npm start
    ```

    The frontend will launch at `http://localhost:3000`.

---

## 🔐 User Roles & Default Credentials

To fully test the system, you'll need users for different roles.

### Create a Super Admin

Run this SQL command in your database to create the initial Super Admin account:

```sql
-- Password usually needs to be BCrypt hashed. 
-- For a default setup (check your backend logic), you might need to register via API or insert directly.
-- Using a hash for 'password': $2a$10$w.... (example)

INSERT INTO user (name, email, password, role, is_active) 
VALUES ('Super Admin', 'admin@insurai.com', '$2a$10$YourHashedPasswordHere', 'SUPER_ADMIN', true);
```

### Roles Hierarchy

* **SUPER_ADMIN**: Full system control, approves companies.
* **COMPANY**: Manages their own insurance policies.
* **ADMIN**: internal staff management (Users/Agents).
* **AGENT**: Handles consultations and policy recommendations.
* **USER**: End-customer who buys policies and claims insurance.

---

## 🧪 Testing the Application

### 1. Company Registration Flow

1. **Register** a new account with the role "Company" (via API or provided UI if available).
2. **Login as Super Admin** and navigate to the Dashboard.
3. **Approve** the pending company registration.
4. **Login as the Company** to access the Policy Management dashboard.

### 2. Policy Creation & Purchase

1. **As a Company**, create a new Insurance Policy.
2. **Login as a User**, browse policies, and purchase the newly created policy.

### 3. Claims Process

1. **As a User**, go to "My Policies" and file a claim.
2. **Upload Documents** as proof (PDF/Images).
3. **As an Agent/Admin**, review and process the claim.

---

## 📂 Project Structure

```
insurai/
├── insurai-backend/      # Spring Boot Application
│   ├── src/main/java/    # Source Code (Controllers, Services, Models)
│   ├── src/main/resources/ # Config (application.properties, templates)
│   └── public/           # Static assets
├── insurai-frontend/     # React Application
│   ├── src/components/   # Reusable UI Components (StandardCard, etc.)
│   ├── src/pages/        # Dashboard Pages (User, Agent, Admin, Company)
│   ├── src/styles/       # CSS Design Tokens & Global Styles
│   └── public/           # Static assets, index.html
├── database_migration.sql # Initial Database Setup Script
└── README.md             # Project Documentation
```

---

## 🐛 Troubleshooting

* **Backend Fails to Start**: Check that MySQL is running and the credentials in `.env` (or `application.properties`) are correct.
* **Frontend API Errors**: Ensure the backend is running on port `8080`. Check the browser console/network tab for CORS issues or 500 errors.
* **Login Fails**: Verify the user exists in the database and `is_active` is set to `true`.

---

**Version**: 2.0 (Re-engineered)
**Maintained by**: InsurAI Dev Team
