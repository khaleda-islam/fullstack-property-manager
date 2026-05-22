# Application Setup & Running Guide

## Table of Contents
1. [Quick Start](#quick-start)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Environment Configuration](#environment-configuration)
5. [Database Setup](#database-setup)
6. [Running the Application](#running-the-application)
7. [Accessing the Application](#accessing-the-application)
8. [Seeding Test Data](#seeding-test-data)
9. [Common Issues](#common-issues)
10. [Useful Commands](#useful-commands)

---

## Quick Start

**For experienced developers** — quick setup commands:

```bash
# Clone repository
git clone <repository-url>
cd fullstack-property-manager

# Backend setup
cd backend
npm install
cp .env.example .env  # Configure your environment variables
npm run dev

# Frontend setup (new terminal)
cd ../frontend
npm install
npm run dev
```

**Default URLs**:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`

---

## Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software

| Software | Minimum Version | Download Link | Purpose |
|----------|----------------|---------------|---------|
| **Node.js** | v18.0.0+ | [nodejs.org](https://nodejs.org) | JavaScript runtime |
| **npm** | v9.0.0+ | Included with Node.js | Package manager |
| **MongoDB** | v6.0.0+ | [mongodb.com](https://www.mongodb.com/try/download/community) | Database |
| **Git** | v2.0.0+ | [git-scm.com](https://git-scm.com) | Version control |

### Account Prerequisites

You'll need accounts for these third-party services:

1. **Auth0** — User authentication ([Setup Guide](./auth0_setup_guide.md))
2. **Cloudinary** — Image/document storage ([Setup Guide](./cloudinary_setup_guide.md))
3. **Brevo (optional)** — Email service ([Setup Guide](./email_management_guide.md))

---

## Installation

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd fullstack-property-manager
```

### Step 2: Install Backend Dependencies

```bash
cd backend
npm install
```

**Expected output**:
```
added 150 packages, and audited 151 packages in 15s
```

### Step 3: Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

**Expected output**:
```
added 300 packages, and audited 301 packages in 20s
```

---

## Environment Configuration

### Backend Environment Setup

#### Step 1: Create `.env` File

Navigate to the `backend` folder and create a `.env` file:

```bash
cd backend
touch .env  # On Windows: type nul > .env
```

#### Step 2: Configure Environment Variables

Edit `backend/.env` and add the following:

```env
# ── Server Configuration ────────────────────────────────────────
PORT=3000
CLIENT_URL=http://localhost:5173

# ── MongoDB Configuration ───────────────────────────────────────
MONGO_URI=mongodb://localhost:27017/property-management

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
BREVO_FROM_NAME=T6PMS Property Management
```

**⚠️ Important**:
- Replace all placeholder values with your actual credentials
- See individual setup guides for obtaining these values:
  - [Auth0 Setup Guide](./auth0_setup_guide.md)
  - [Cloudinary Setup Guide](./cloudinary_setup_guide.md)
  - [Email Setup Guide](./email_management_guide.md)

### Frontend Environment Setup (Optional)

Create `frontend/.env` (optional — defaults work for local development):

```env
# Backend server URL (default: same origin in production)
VITE_SERVER_URL=http://localhost:3000
```

**Note**: For local development, this is **optional**. The frontend will default to `http://localhost:3000` if not specified.

---

## Database Setup

### Option 1: Local MongoDB (Recommended for Development)

#### Step 1: Install MongoDB

**Windows**:
1. Download MongoDB Community Server from [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Run the installer (`.msi` file)
3. Choose "Complete" installation
4. Install as a Windows Service
5. MongoDB will start automatically

**macOS** (using Homebrew):
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux** (Ubuntu/Debian):
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
```

#### Step 2: Verify MongoDB is Running

```bash
# Check if MongoDB is running
mongosh  # Should connect to mongodb://127.0.0.1:27017
```

If connected successfully, type `exit` to quit.

#### Step 3: Update `.env` File

```env
MONGO_URI=mongodb://localhost:27017/property-management
```

### Option 2: MongoDB Atlas (Cloud Database)

#### Step 1: Create MongoDB Atlas Account
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new cluster (select Free Tier - M0)

#### Step 2: Get Connection String
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string

#### Step 3: Update `.env` File

```env
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/property-management?retryWrites=true&w=majority
```

Replace `username`, `password`, and cluster URL with your actual values.

---

## Running the Application

### Start MongoDB (If Using Local MongoDB)

**Windows**:
- MongoDB should start automatically as a Windows Service
- If not, open Services and start "MongoDB Server"

**macOS/Linux**:
```bash
# macOS (Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongodb
```

### Start Backend Server

Open a terminal in the `backend` folder:

```bash
cd backend

# Development mode (with auto-restart on file changes)
npm run dev

# OR Production mode
npm start
```

**Expected output**:
```
✅ MongoDB connected
🌱 Database seeded with sample data
🚀 Server on http://localhost:3000
✅ Lease reminder job scheduled (9:00 AM daily)
```

**✅ Backend is ready** when you see "Server on http://localhost:3000"

### Start Frontend Server

Open a **new terminal** in the `frontend` folder:

```bash
cd frontend
npm run dev
```

**Expected output**:
```
VITE v8.0.0  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h + enter to show help
```

**✅ Frontend is ready** when you see "Local: http://localhost:5173/"

---

## Accessing the Application

### Open in Browser

Navigate to: **http://localhost:5173**

### First Time Access

1. **Home Page**: You'll see the public home page
2. **Click "Login"**: You'll be redirected to Auth0 login page
3. **Sign Up**: Create a new account or log in with existing credentials
4. **Onboarding**: After first login, you'll be prompted to select a role:
   - **Landlord** — Manage properties, tenants, and contractors
   - **Resident** — Submit maintenance requests, view property details
   - **Contractor** — Accept jobs, update work status, receive ratings

### Test Accounts (Seeded Data)

The application automatically seeds test accounts on first run:

| Role | Email | Password | Purpose |
|------|-------|----------|---------|
| Landlord | `landlord@example.com` | *(Set in Auth0)* | Pre-configured with properties |
| Resident | `resident@example.com` | *(Set in Auth0)* | Assigned to a property |
| Contractor | `contractor@example.com` | *(Set in Auth0)* | Available for maintenance jobs |

**Note**: These are database records. You'll need to create matching Auth0 accounts with the same emails, or create your own accounts through the application.

---

## Seeding Test Data

The application automatically seeds sample data on first run when the database is empty.

### Manual Seeding

To manually seed or re-seed the database:

```bash
cd backend
npm run seed
```

**What gets seeded**:
- ✅ 3 sample users (landlord, resident, contractor)
- ✅ 3 sample profiles with contact information
- ✅ 2 sample properties with images
- ✅ 1 property assignment (resident → property)
- ✅ Chat rooms between users

### Clear Database

To clear all data and start fresh:

```bash
cd backend
npm run db:clear
```

**⚠️ Warning**: This will delete **ALL** data in your database. Use with caution!

---

## Common Issues

### Issue 1: MongoDB Connection Failed

**Error**: `MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017`

**Solution**:
```bash
# Check if MongoDB is running
mongosh

# If not running, start it:
# Windows: Start "MongoDB Server" service
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongodb
```

### Issue 2: Port Already in Use

**Error**: `Error: listen EADDRINUSE: address already in use :::3000`

**Solution**:
```bash
# Windows PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process

# OR change port in backend/.env
PORT=3001
```

### Issue 3: Auth0 Redirect Error

**Error**: `Invalid callback URL` or redirect fails after login

**Solution**:
1. Open Auth0 Dashboard → Applications → Your Application
2. Go to **Settings** tab
3. Add to **Allowed Callback URLs**: `http://localhost:5173`
4. Add to **Allowed Logout URLs**: `http://localhost:5173`
5. Add to **Allowed Web Origins**: `http://localhost:5173`
6. Click **"Save Changes"**

### Issue 4: Cloudinary Upload Fails

**Error**: `Invalid cloud name` or upload errors

**Solution**:
1. Verify credentials in `backend/.env`:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
2. Check [Cloudinary Dashboard](https://cloudinary.com/console) → Settings → Account
3. Ensure credentials match exactly (no extra spaces)

### Issue 5: Frontend Shows Blank Page

**Solution**:
```bash
# Clear cache and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Issue 6: Cannot Create User

**Error**: User created in Auth0 but not showing in application

**Solution**:
- First login triggers onboarding flow
- Complete the role selection in the onboarding page
- This creates the user record in MongoDB

---

## Useful Commands

### Backend Commands

```bash
cd backend

# Development mode (auto-restart)
npm run dev

# Production mode
npm start

# Seed database
npm run seed

# Clear database
npm run db:clear

# Test lease reminder email job
node scripts/testLeaseReminder.js
```

### Frontend Commands

```bash
cd frontend

# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### MongoDB Commands

```bash
# Connect to MongoDB shell
mongosh

# Show databases
show dbs

# Use specific database
use property-management

# Show collections
show collections

# View all users
db.users.find().pretty()

# View all properties
db.properties.find().pretty()

# Count documents
db.users.countDocuments()

# Drop database (delete all data)
db.dropDatabase()
```

---

## Development Workflow

### Typical Development Session

1. **Start MongoDB** (if not running as service)
2. **Start Backend** in one terminal:
   ```bash
   cd backend
   npm run dev
   ```
3. **Start Frontend** in another terminal:
   ```bash
   cd frontend
   npm run dev
   ```
4. **Open Browser** to `http://localhost:5173`
5. **Make Changes** — both servers auto-reload on file changes

### Making Code Changes

**Backend Changes**:
- Edit files in `backend/` folder
- Server automatically restarts (nodemon)
- Refresh browser to see API changes

**Frontend Changes**:
- Edit files in `frontend/src/` folder
- Vite hot-reloads automatically
- Changes appear instantly in browser

---

## Production Deployment

### Building for Production

#### Backend
```bash
cd backend
# Backend runs directly with Node.js
npm start
```

#### Frontend
```bash
cd frontend
npm run build
```

This creates a `dist/` folder with optimized static files.

### Serving Production Build

The backend is configured to serve the frontend build automatically:

1. Build the frontend: `npm run build` (in frontend folder)
2. The backend `server.js` serves files from `frontend/dist/`
3. All API routes use `/api/*` prefix
4. Non-API routes serve React app (client-side routing)

### Environment Variables for Production

Update these in production `.env`:

```env
# Production URLs
PORT=3000
CLIENT_URL=https://yourdomain.com

# Production MongoDB (use MongoDB Atlas)
MONGO_URI=mongodb+srv://...

# Auth0 - Update callback URLs in dashboard
AUTH0_DOMAIN=your-tenant.us.auth0.com
AUTH0_AUDIENCE=https://property-management-api/

# Other services (same as development)
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
BREVO_API_KEY=...
```

---

## Project Structure Quick Reference

```
fullstack-property-manager/
│
├── backend/                 # Node.js + Express backend
│   ├── config/             # Database and seed configuration
│   ├── controllers/        # Route handlers
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API routes
│   ├── middleware/         # Auth middleware
│   ├── services/           # Email, Cloudinary services
│   ├── socket/             # Socket.IO handler
│   ├── jobs/               # Cron jobs
│   ├── scripts/            # Utility scripts
│   ├── server.js           # Main server file
│   ├── package.json        # Dependencies
│   └── .env                # Environment variables
│
├── frontend/               # React + Vite frontend
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API calls, Socket.IO
│   │   ├── context/       # React context
│   │   ├── router/        # Routing configuration
│   │   ├── App.jsx        # Main app component
│   │   └── main.jsx       # Entry point
│   ├── public/            # Static assets
│   ├── package.json       # Dependencies
│   └── .env               # Environment variables (optional)
│
├── docs/                   # Documentation
│   ├── application_setup_guide.md        # This file
│   ├── auth0_setup_guide.md
│   ├── cloudinary_setup_guide.md
│   ├── email_management_guide.md
│   └── messaging_notification_system_guide.md
│
└── README.md              # Project overview
```

---

## Getting Help

### Documentation

- **[Auth0 Setup](./auth0_setup_guide.md)** — User authentication setup
- **[Cloudinary Setup](./cloudinary_setup_guide.md)** — Image/file storage setup
- **[Email Management](./email_management_guide.md)** — Brevo email service setup
- **[Messaging & Notifications](./messaging_notification_system_guide.md)** — Real-time features

### Troubleshooting Steps

1. **Check all services are running**:
   - MongoDB
   - Backend server
   - Frontend server

2. **Verify environment variables**:
   - All required variables set in `backend/.env`
   - Values are correct (no typos, extra spaces)

3. **Check console for errors**:
   - Backend terminal output
   - Browser console (F12)

4. **Clear caches**:
   ```bash
   # Backend
   rm -rf node_modules package-lock.json
   npm install

   # Frontend
   rm -rf node_modules package-lock.json dist
   npm install
   ```

5. **Reset database**:
   ```bash
   cd backend
   npm run db:clear
   npm run seed
   ```

---

## Summary Checklist

Before running the application, ensure you have:

- [ ] Node.js v18+ installed
- [ ] MongoDB installed and running
- [ ] Auth0 account configured
- [ ] Cloudinary account configured
- [ ] Backend dependencies installed (`npm install`)
- [ ] Frontend dependencies installed (`npm install`)
- [ ] Backend `.env` file configured
- [ ] Backend server running (`npm run dev`)
- [ ] Frontend server running (`npm run dev`)
- [ ] Browser open to `http://localhost:5173`

**Ready to go!** 🚀

---

## Quick Reference Card

| Action | Command | Location |
|--------|---------|----------|
| Install backend | `npm install` | `backend/` |
| Install frontend | `npm install` | `frontend/` |
| Start backend | `npm run dev` | `backend/` |
| Start frontend | `npm run dev` | `frontend/` |
| Seed database | `npm run seed` | `backend/` |
| Clear database | `npm run db:clear` | `backend/` |
| Build frontend | `npm run build` | `frontend/` |
| Access app | Browser → `http://localhost:5173` | — |
| Access API | Browser → `http://localhost:3000` | — |
| MongoDB shell | `mongosh` | Terminal |

---

**Happy Coding!** 🎉
