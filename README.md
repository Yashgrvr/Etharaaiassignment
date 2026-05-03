# Ethara AI Workspace - Task Management System

A full-stack MERN (MongoDB, Express.js, React, Node.js) application for project and task management, featuring role-based access control for Admins and Members.

## 🚀 Features
- **Admin Dashboard**: Create projects and assign tasks to specific employees.
- **Member Dashboard**: View assigned tasks and mark them as completed.
- **Authentication**: Secure login using JWT (JSON Web Tokens) and bcrypt password hashing.
- **Role-Based Access**: Specialized views and permissions for Admin and Member roles.

## 🛠️ Tech Stack
- **Frontend**: React.js, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas
- **Deployment**: Railway

## 🌐 Live Links
- **Frontend**: [https://glistening-clarity-copy-production.up.railway.app/](https://glistening-clarity-copy-production.up.railway.app/)
- **Backend**: [https://glistening-clarity-production.up.railway.app](https://glistening-clarity-production.up.railway.app)

## 🔑 Test Credentials
| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | admin@123.com | admin123 |
| **Member** | emp@123.com | emp123 |

## ⚠️ Important Deployment Note (CORS)
The application is fully deployed. However, due to last-minute cross-domain mapping on Railway, some browsers might block the login request via **CORS Policy**. 
- **Workaround**: Please use the "Allow CORS: Access-Control-Allow-Origin" extension to bypass this restriction for the live demo.
- **Local Verification**: The entire MERN flow has been verified on a local environment and the GitHub repository contains the fixed CORS headers in `server.js`.
