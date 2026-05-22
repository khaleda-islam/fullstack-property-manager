# Property Management System

[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/) [![React](https://img.shields.io/badge/React-19.2-blue)](https://reactjs.org/) [![MongoDB](https://img.shields.io/badge/MongoDB-7.1-green)](https://www.mongodb.com/) [![Express](https://img.shields.io/badge/Express-5.2-lightgrey)](https://expressjs.com/) [![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8-black)](https://socket.io/) [![Auth0](https://img.shields.io/badge/Auth0-JWT-orange)](https://auth0.com/) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

**Property Management System** is a comprehensive full-stack web application designed to streamline property management operations, maintenance workflows, and real-time communication between **Landlords**, **Residents**, and **Contractors**. Built with modern **MERN stack** technologies, featuring **real-time messaging**, **automated notifications**, and **cloud-based file storage**.

## 📸 Screenshots

### Homepage
![Homepage](docs/Screenshot/Homepage.png)

### Dashboard
![Dashboard](docs/Screenshot/Dashboard.png)

---

## 📋 Table of Contents

- [🎯 Project Vision](#-project-vision)
- [✨ Key Features](#-key-features)
- [🚀 Quick Start](#-quick-start)
- [📋 Prerequisites](#-prerequisites)
- [⚙️ Installation](#️-installation)
- [🗄️ Database Setup](#️-database-setup)
- [🔐 Third-Party Services Configuration](#-third-party-services-configuration)
- [▶️ Running the Application](#️-running-the-application)
- [🧰 Technology Stack](#-technology-stack)
- [📚 Documentation](#-documentation)
- [🏗️ Architecture](#️-architecture)
- [🤝 Contributing](#-contributing)
- [📜 License](#-license)
- [📞 Support](#-support)

---

## 🎯 Project Vision

> *Simplifying property management through modern technology, real-time communication, and intuitive workflows.*

### **🌟 What Makes This Special?**
- 🏠 **All-in-One Platform** — Property management, maintenance tracking, messaging, and notifications in one place
- ⚡ **Real-Time Communication** — Instant messaging and live notifications via Socket.IO
- 🔐 **Enterprise-Grade Security** — Auth0 JWT authentication with role-based access control
- ☁️ **Cloud-First** — Cloudinary for file storage, MongoDB Atlas support, scalable architecture
- 📧 **Automated Workflows** — Smart email reminders for lease expiration and maintenance updates

> 🔥 **If this project helps you, please give it a star ⭐ — Your support means a lot!**

---

## ✨ Key Features

### **For Landlords** 🏢
- 📝 **Property Management** — Create, update, and manage multiple properties with images
- 👥 **Tenant Management** — Assign residents to properties with lease tracking
- 🔧 **Maintenance Oversight** — View all maintenance requests across properties
- 👷 **Contractor Management** — Search, assign, and rate contractors
- 📊 **Dashboard Analytics** — Track maintenance requests, rent status, and property overview
- 📧 **Automated Reminders** — Email alerts 14 and 7 days before lease expiration

### **For Residents** 🏠
- 🏘️ **Property Dashboard** — View assigned property details and lease information
- 📋 **Maintenance Requests** — Submit requests with photos and priority levels (Standard, Urgent, Emergency)
- 📸 **Photo Upload** — Attach up to 3 photos per maintenance request
- 📍 **Request Tracking** — Real-time status updates (Submitted → In Progress → Completed)
- 💬 **Direct Messaging** — Communicate directly with landlord
- 🔔 **Instant Notifications** — Get notified when contractors are assigned or job status changes

### **For Contractors** 🔨
- 📬 **Job Requests** — View available maintenance requests with property details
- ✅ **Accept/Decline** — Review and respond to job assignments
- 🚀 **Status Updates** — Update job progress (In Progress, Completed)
- ⭐ **Ratings & Reviews** — Build reputation with landlord ratings (0-10 scale)
- 📜 **Job History** — Track past completed jobs and performance

### **Shared Features** 🌐
- 💬 **Real-Time Messaging** — DM conversations between any two users
- 🔔 **Live Notifications** — Instant push notifications for important updates
- 👤 **Profile Management** — Update personal information, contact details, and profile photo
- 📱 **Responsive Design** — Works seamlessly on desktop, tablet, and mobile
- 🔒 **Secure Authentication** — Auth0 integration with social login support

📄 **[See detailed architecture →](docs/architecture_design_document.md)**

---

## 🚀 Quick Start

Get the application running in 5 minutes:

```bash
# 1. Clone the repository
git clone <repository-url>
cd fullstack-property-manager

# 2. Setup backend
cd backend
npm install
# Configure .env file (see configuration section)

# 3. Setup frontend
cd ../frontend
npm install

# 4. Start MongoDB (ensure it's running)

# 5. Run backend (new terminal)
cd backend
npm run dev

# 6. Run frontend (new terminal)
cd frontend
npm run dev
```

**Access the application:**
- 🌐 Frontend: `http://localhost:5173`
- 🔌 Backend API: `http://localhost:3000`

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

| Software | Minimum Version | Download Link | Purpose |
|----------|----------------|---------------|---------|
| **Node.js** | 18.0+ | [nodejs.org](https://nodejs.org) | JavaScript runtime |
| **npm** | 9.0+ | Included with Node.js | Package manager |
| **MongoDB** | 6.0+ | [mongodb.com](https://www.mongodb.com/try/download/community) | Database |
| **Git** | 2.0+ | [git-scm.com](https://git-scm.com) | Version control |

### **Required Third-Party Accounts**

You'll need free accounts for these services:

1. ✅ **[Auth0](https://auth0.com/)** — User authentication ([Setup Guide](docs/auth0_setup_guide.md))
2. ✅ **[Cloudinary](https://cloudinary.com/)** — Image/document storage ([Setup Guide](docs/cloudinary_setup_guide.md))
3. ⚙️ **[Brevo](https://www.brevo.com/)** (optional) — Email service ([Setup Guide](docs/email_management_guide.md))

---

## ⚙️ Installation

### 1️⃣ Clone the Repository

```bash
git clone <repository-url>
cd fullstack-property-manager
```

### 2️⃣ Install Backend Dependencies

```bash
cd backend
npm install
```

**Expected packages**: Express, MongoDB, Socket.IO, Auth0, Cloudinary, Brevo, node-cron

### 3️⃣ Install Frontend Dependencies

```bash
cd frontend
npm install
```

**Expected packages**: React, React Router, Auth0 React SDK, Socket.IO Client, Bootstrap

---

## 🗄️ Database Setup

### Option 1: Local MongoDB (Recommended for Development)

#### **Windows**
1. Download MongoDB Community Server from [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Run installer and install as Windows Service
3. MongoDB will start automatically

#### **macOS** (using Homebrew)
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### **Linux** (Ubuntu/Debian)
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
```

#### **Verify Installation**
```bash
mongosh  # Should connect to mongodb://127.0.0.1:27017
```

### Option 2: MongoDB Atlas (Cloud Database)

1. Create free account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create cluster (Free M0 tier available)
3. Get connection string from "Connect" → "Connect your application"
4. Use connection string in `.env` file

---

## 🔐 Third-Party Services Configuration

### Backend Configuration

Create `backend/.env` file with the following:

```env
# ── Server Configuration ────────────────────────────────────────
PORT=3000
CLIENT_URL=http://localhost:5173

# ── MongoDB Configuration ───────────────────────────────────────
MONGO_URI=mongodb://localhost:27017/property-management
# For MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/property-management

# ── Auth0 Configuration ─────────────────────────────────────────
AUTH0_DOMAIN=your-tenant.us.auth0.com
AUTH0_AUDIENCE=https://property-management-api/

# ── Cloudinary Configuration ────────────────────────────────────
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your-api-secret

# ── Brevo Email Service (Optional) ──────────────────────────────
BREVO_API_KEY=xkeysib-your-api-key-here
BREVO_FROM_EMAIL=noreply@yourdomain.com
BREVO_FROM_NAME=Property Management System
```

### Frontend Configuration (Optional)

Create `frontend/.env` (optional for local development):

```env
VITE_SERVER_URL=http://localhost:3000
```

> 💡 **Frontend defaults work for local development without this file.**

### Configuration Guides

| Service | Setup Guide | Purpose |
|---------|-------------|---------|
| **Auth0** | [📖 Auth0 Setup Guide](docs/auth0_setup_guide.md) | User authentication & JWT tokens |
| **Cloudinary** | [📖 Cloudinary Setup Guide](docs/cloudinary_setup_guide.md) | Image & PDF storage |
| **Brevo** | [📖 Email Management Guide](docs/email_management_guide.md) | Automated email reminders |

---

## ▶️ Running the Application

### Start Backend Server

```bash
cd backend

# Development mode (auto-restart on file changes)
npm run dev

# Production mode
npm start
```

**Expected output:**
```
✅ MongoDB connected
🌱 Database seeded with sample data
🚀 Server on http://localhost:3000
✅ Lease reminder job scheduled (9:00 AM daily)
```

| URL | Description |
|-----|-------------|
| `http://localhost:3000` | API base URL |
| `http://localhost:3000/health` | Health check endpoint |

### Start Frontend Server

Open a **new terminal**:

```bash
cd frontend
npm run dev
```

**Expected output:**
```
VITE v8.0.0  ready in 500 ms
➜  Local:   http://localhost:5173/
```

### Access the Application

1. Open browser to **`http://localhost:5173`**
2. Click **"Login"** (redirects to Auth0)
3. Sign up or log in
4. Complete onboarding (select role: Landlord, Resident, or Contractor)
5. Access your role-specific dashboard

### Seed Test Data

The application automatically seeds sample data on first run. To manually seed:

```bash
cd backend
npm run seed
```

**Seeded data includes:**
- 3 sample users (landlord, resident, contractor)
- 2 properties with images
- 1 property assignment
- Sample profiles and chat rooms

To clear all data and start fresh:

```bash
cd backend
npm run db:clear
```

> ⚠️ **Warning**: This deletes ALL data in your database!

📄 **[Full setup guide →](docs/application_setup_guide.md)**

---

## 🧰 Technology Stack

### **Backend Technologies**

| Technology | Version | Purpose | Documentation |
|------------|---------|---------|---------------|
| **Node.js** | 18+ | JavaScript runtime | [📖 Node.js Docs](https://nodejs.org/docs/) |
| **Express** | 5.2 | Web framework | [📖 Express Docs](https://expressjs.com/) |
| **MongoDB** | 7.1 | NoSQL database | [📖 MongoDB Docs](https://docs.mongodb.com/) |
| **Mongoose** | 9.3 | MongoDB ODM | [📖 Mongoose Docs](https://mongoosejs.com/) |
| **Socket.IO** | 4.8 | Real-time engine | [📖 Socket.IO Docs](https://socket.io/docs/) |
| **Auth0** | 1.7 | JWT authentication | [📖 Auth0 Docs](https://auth0.com/docs) |
| **Cloudinary** | 2.2 | File storage | [📖 Cloudinary Docs](https://cloudinary.com/documentation) |
| **Brevo** | 5.0 | Email service | [📖 Brevo Docs](https://developers.brevo.com/) |
| **node-cron** | 4.2 | Job scheduling | [📖 node-cron](https://github.com/node-cron/node-cron) |

### **Frontend Technologies**

| Technology | Version | Purpose | Documentation |
|------------|---------|---------|---------------|
| **React** | 19.2 | UI framework | [📖 React Docs](https://react.dev/) |
| **Vite** | 8.0 | Build tool | [📖 Vite Docs](https://vitejs.dev/) |
| **React Router** | 7.13 | Client-side routing | [📖 React Router Docs](https://reactrouter.com/) |
| **Bootstrap** | 5.3 | UI components | [📖 Bootstrap Docs](https://getbootstrap.com/) |
| **Auth0 React SDK** | 2.15 | Authentication | [📖 Auth0 React](https://auth0.com/docs/libraries/auth0-react) |
| **Socket.IO Client** | 4.8 | Real-time client | [📖 Socket.IO Client](https://socket.io/docs/v4/client-api/) |

### **Database Schema**

| Collection | Purpose | Key Features |
|------------|---------|-------------|
| **users** | User accounts | Auth0 integration, role-based (landlord/resident/contractor) |
| **profiles** | User details | Contact info, address, contractor ratings |
| **properties** | Property listings | Images, location, units, landlord ownership |
| **assignments** | Tenant-property links | Lease dates, documents, rent status |
| **maintenance** | Service requests | Photos, priority, status, contractor assignment |
| **rooms** | Chat rooms | DM between 2 users, last message, unread counts |
| **messages** | Chat messages | Real-time messaging history |
| **notifications** | System alerts | Push + persistent notifications |
| **ratings** | Contractor reviews | 0-10 scale, landlord feedback |

📄 **[Complete database design →](docs/architecture_design_document.md#database-design)**

---

## 📚 Documentation

### **Setup & Configuration Guides**

| Document | Description |
|----------|-------------|
| **[Application Setup Guide](docs/application_setup_guide.md)** | Complete installation and running guide |
| **[Auth0 Setup Guide](docs/auth0_setup_guide.md)** | Step-by-step Auth0 configuration |
| **[Cloudinary Setup Guide](docs/cloudinary_setup_guide.md)** | File storage setup and usage |
| **[Email Management Guide](docs/email_management_guide.md)** | Brevo email service configuration |

### **System Documentation**

| Document | Description |
|----------|-------------|
| **[Architecture Design Document](docs/architecture_design_document.md)** | Complete system architecture, database design, API endpoints |
| **[Messaging & Notification System](docs/messaging_notification_system_guide.md)** | Real-time messaging and notifications guide |

### **Quick Reference**

```bash
# Backend Commands
cd backend
npm install          # Install dependencies
npm run dev          # Development mode
npm start            # Production mode
npm run seed         # Seed database
npm run db:clear     # Clear database

# Frontend Commands
cd frontend
npm install          # Install dependencies
npm run dev          # Development mode
npm run build        # Production build
npm run preview      # Preview production build
```

---

## 🏗️ Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│                                                              │
│  React SPA (Vite) + Bootstrap UI + Socket.IO Client         │
│  • Role-based routing  • Real-time messaging                │
│  • Auth0 authentication  • Responsive design                │
└───────────────────────────┬─────────────────────────────────┘
                            │
                  HTTP/REST + WebSocket
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                    APPLICATION LAYER                         │
│                                                              │
│  Node.js + Express + Socket.IO Server                       │
│  • RESTful API  • JWT validation  • Real-time engine        │
│  • Business logic  • File uploads  • Email service          │
└───────────────────────────┬─────────────────────────────────┘
                            │
                       Mongoose ODM
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                      DATA LAYER                              │
│                                                              │
│  MongoDB Database + External Services                       │
│  • Document storage  • Auth0  • Cloudinary  • Brevo         │
└─────────────────────────────────────────────────────────────┘
```

### Key Architecture Patterns

- ✅ **MVC Pattern** — Routes → Controllers → Models → Database
- ✅ **Service Layer** — External integrations (Email, File Storage)
- ✅ **Real-Time Layer** — Socket.IO for messaging and notifications
- ✅ **Middleware Pipeline** — Authentication, CORS, error handling
- ✅ **Job Scheduling** — Cron jobs for automated tasks

### Security Architecture

- 🔐 **JWT Authentication** — Auth0 RS256 tokens
- 🔒 **Role-Based Access Control** — Landlord, Resident, Contractor roles
- 🛡️ **CORS Protection** — Configured allowed origins
- 🔑 **Environment Variables** — Secrets management via .env
- 📁 **File Upload Security** — Cloudinary validation and size limits

📄 **[Complete architecture documentation →](docs/architecture_design_document.md)**

---



## 📜 License

This project is licensed under the **[MIT License](LICENSE)**.

### What this means:
- ✅ **Commercial use** — Use in commercial projects
- ✅ **Modification** — Modify the code as needed
- ✅ **Distribution** — Distribute your modifications
- ✅ **Private use** — Use privately without restrictions
- ⚠️ **Attribution** — Include original license and copyright notice

---



<div align="center">

### **🎉 Thank you for using Property Management System!**

*Simplifying property management, one feature at a time.*

[![Made with ❤️](https://img.shields.io/badge/Made%20with-❤️-red.svg)](https://github.com/your-username/fullstack-property-manager) [![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue.svg)](https://www.mongodb.com/mern-stack) [![Contributions Welcome](https://img.shields.io/badge/Contributions-Welcome-brightgreen.svg)](CONTRIBUTING.md)

---

**⭐ Don't forget to star the repository if you found it helpful! ⭐**

</div>