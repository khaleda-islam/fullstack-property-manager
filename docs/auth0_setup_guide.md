# Auth0 Setup Guide for Property Management Application

## Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Part 1: Create Auth0 Account](#part-1-create-auth0-account)
4. [Part 2: Create Application](#part-2-create-application)
5. [Part 3: Create API](#part-3-create-api)
6. [Part 4: Configure Application Settings](#part-4-configure-application-settings)
7. [Part 5: Update Application Code](#part-5-update-application-code)
8. [Part 6: Testing](#part-6-testing)
9. [Troubleshooting](#troubleshooting)

---

## Overview

This guide will walk you through setting up Auth0 authentication for the Property Management Application, which uses:
- **Frontend**: React (Single Page Application)
- **Backend**: Node.js + Express + MongoDB
- **Authentication**: Auth0

---

## Prerequisites

Before starting, ensure you have:
- A valid email address for Auth0 registration
- Your Property Management Application code (React frontend + Node backend)
- Node.js and npm installed
- MongoDB installed and running

---

## Part 1: Create Auth0 Account

### Step 1: Sign Up for Auth0

1. Go to [https://auth0.com/](https://auth0.com/)
2. Click **"Sign Up"** (top right corner)
3. Choose one of these sign-up options:
   - Sign up with **Google**
   - Sign up with **GitHub**
   - Or use **Email/Password**
4. Complete the registration form
5. Verify your email if required

### Step 2: Create Your Tenant

After signing up, Auth0 will prompt you to create a tenant:

1. **Account Type**: Select **"Company"**
2. **Company Name**: Enter `Property Management Systems` (or your preferred name)
3. **Tenant Domain Name**: Choose a unique name (e.g., `property-mgmt-2025`)
   - This will become: `your-name.us.auth0.com` or `your-name.ca.auth0.com`
4. **Region**: Choose **Canada** or **US** (select the region closest to your users)
5. **Environment**: Select **"Development"**
6. **Technology**: Select **"React"** or **"Single Page Application"**
7. Click **"Create Tenant"**

---

## Part 2: Create Application

### Step 3: Create a New Application

1. In the Auth0 Dashboard, navigate to **Applications** → **Applications** (left sidebar)
2. Click **"+ Create Application"**
3. Fill in the application details:
   - **Name**: `Property Management`
   - **Application Type**: Select **"Single Page Web Applications"**
4. Click **"Create"**

### Step 4: Save Your Credentials

After creation, you'll see the **Quick Start** page:

1. Click on the **"Settings"** tab
2. **Copy and save** these important credentials (you'll need them later):
   - **Domain**: (e.g., `dev-abc123xyz.us.auth0.com`)
   - **Client ID**: (long alphanumeric string)

> ⚠️ **Important**: Keep these credentials secure. Don't commit them to version control.

---

## Part 3: Create API

### Step 5: Create a New API

1. In the left sidebar, go to **Applications** → **APIs**
2. Click **"+ Create API"**
3. Fill in the API details:
   - **Name**: `Property Management API`
   - **Identifier**: `https://property-management-api/`
     - ⚠️ **Critical**: Use exactly this identifier. It doesn't need to be a real website.
   - **Signing Algorithm**: `RS256` (should be pre-selected)
4. Click **"Create"**

### Step 6: Configure API Settings

1. After creation, click on the **"Settings"** tab
2. Scroll down to **"Access Settings"** section
3. Enable the following options:
   - ✅ **"Allow Skipping User Consent"** (recommended for development)
   - ✅ **"Allow Offline Access"** (enables refresh tokens)
4. Scroll to the bottom and click **"Save"**

### Step 7: Authorize Your Application to Access the API ⭐ CRITICAL STEP

This is the **most critical step** for making authentication work:

**Using Application Access Tab (Recommended):**

1. While in your API, click on the **"Application Access"** tab
2. Click **"Edit"** button next to "Property Management"
3. Check ✅ **"Always grant all permissions"**
4. **Organization Support**: Select **"None - Machine to machine access cannot be scoped to an organization"**
5. Click **"Save"**

**Verification:**
- Go back to the **"Application Access"** tab
- Confirm **"Property Management"** shows a **green checkmark** ✅
- Status should show: `0 / 0 permissions granted` (this is normal if no custom permissions are defined)

---

## Part 4: Configure Application Settings

### Step 8: Configure Application URIs

1. Go to **Applications** → **Applications** → **Property Management**
2. Click on the **"Settings"** tab
3. Scroll down to **"Application URIs"** section

**Configure the following fields:**

**Application Login URI:**
- **Leave this field EMPTY** (or delete any pre-filled values)

**Allowed Callback URLs:**
```
http://localhost:5173, http://localhost:3000
```

**Allowed Logout URLs:**
```
http://localhost:5173, http://localhost:3000
```

**Allowed Web Origins:**
```
http://localhost:5173, http://localhost:3000
```

4. Scroll to the bottom and click **"Save Changes"**

---

## Part 5: Update Application Code

### Step 9: Update Frontend Environment Variables

Navigate to your React frontend directory and create/update `.env`:

```dotenv
VITE_SERVER_URL=http://localhost:3000
VITE_AUTH0_DOMAIN=YOUR_AUTH0_DOMAIN_HERE
VITE_AUTH0_CLIENT_ID=YOUR_CLIENT_ID_HERE
VITE_AUTH0_AUDIENCE=https://property-management-api/
```

**Example:**
```dotenv
VITE_SERVER_URL=http://localhost:3000
VITE_AUTH0_DOMAIN=dev-qwf27uae6tl3n7ro.ca.auth0.com
VITE_AUTH0_CLIENT_ID=y8aY1tgUjTKOyAazM8fypinONayiAz95
VITE_AUTH0_AUDIENCE=https://property-management-api/
```

### Step 10: Update Backend Environment Variables

Navigate to your backend directory and update `.env`:

```dotenv
PORT=3000
MONGO_URI=mongodb://localhost:27017/property-management
CLIENT_URL=http://localhost:5173

# Auth0 Configuration
AUTH0_DOMAIN=YOUR_AUTH0_DOMAIN_HERE
AUTH0_AUDIENCE=https://property-management-api/
```

### Step 11: Verify Frontend Code Setup

Ensure your `main.jsx` file is configured correctly:

```javascript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css';
import './index.css'
import { Auth0Provider } from "@auth0/auth0-react";
import { BrowserRouter } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        scope: "openid profile email",
      }}
      cacheLocation="localstorage"
      useRefreshTokens={true}
    >
      <BrowserRouter>
        <UserProvider>
          <App />
        </UserProvider>
      </BrowserRouter>
    </Auth0Provider>
  </StrictMode>,
)
```

---

## Part 6: Testing

### Step 12: Start Your Application

1. **Stop all running servers** (press `Ctrl+C`)

2. **Start MongoDB**:
   ```bash
   mongod
   ```

3. **Start Backend**:
   ```bash
   cd backend
   npm start
   ```

4. **Start Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

### Step 13: Test Authentication Flow

1. **Clear browser cache** or open **Incognito/Private window**
2. **Open**: `http://localhost:5173`
3. **Click "Login" or "Sign In"**
4. **Expected Flow**:
   - ✅ Redirects to Auth0 login page
   - ✅ Shows signup/login form
   - ✅ May show "Authorize App" consent screen (click "Accept")
   - ✅ Redirects back to your app
   - ✅ User is logged in

---

## Troubleshooting

### Issue 1: 401 Unauthorized Error

**Solution:**
1. Go to **Applications** → **APIs** → **Property Management API**
2. Click **"Application Access"** tab
3. Click **"Edit"** next to "Property Management"
4. Check ✅ **"Always grant all permissions"**
5. Click **"Save"**
6. Restart both servers
7. Clear browser cache

### Issue 2: Redirect URI Mismatch

**Solution:**
1. Verify **Allowed Callback URLs** includes: `http://localhost:5173`
2. Ensure no trailing slashes
3. Click **"Save Changes"**

### Issue 3: Environment Variables Not Loading

**Solution:**
1. Verify `.env` is in root directory
2. Variables must start with `VITE_` for React
3. **Restart dev server** after changing `.env`
4. Check for typos

---

## Quick Reference

### Frontend `.env` Template
```dotenv
VITE_SERVER_URL=http://localhost:3000
VITE_AUTH0_DOMAIN=your-tenant.region.auth0.com
VITE_AUTH0_CLIENT_ID=your_client_id_here
VITE_AUTH0_AUDIENCE=https://property-management-api/
```

### Backend `.env` Template
```dotenv
PORT=3000
MONGO_URI=mongodb://localhost:27017/property-management
CLIENT_URL=http://localhost:5173
AUTH0_DOMAIN=your-tenant.region.auth0.com
AUTH0_AUDIENCE=https://property-management-api/
```

### Debugging Checklist

- [ ] Auth0 Domain matches exactly
- [ ] Client ID matches exactly
- [ ] API identifier is: `https://property-management-api/`
- [ ] Callback URLs include: `http://localhost:5173`
- [ ] Application authorized in API settings (Step 7)
- [ ] Servers restarted after `.env` changes
- [ ] Browser cache cleared

---

## Security Best Practices for Production

1. Create separate Production tenant
2. Update Callback URLs to production domain
3. Enable MFA (Multi-Factor Authentication)
4. Use HTTPS
5. Rotate secrets regularly
6. Never commit `.env` to version control

---

**Document Version**: 1.0  
**Last Updated**: May 2026  
**Application**: Property Management System

---

**© 2026 Property Management Application - Auth0 Setup Guide**