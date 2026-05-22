# Architecture Design Document
## Property Management System

**Version**: 1.0  
**Last Updated**: May 22, 2026  
**Document Status**: Current

---

## Table of Contents
1. [System Overview](#system-overview)
2. [High-Level Architecture](#high-level-architecture)
3. [Technology Stack](#technology-stack)
4. [Backend Architecture](#backend-architecture)
5. [Frontend Architecture](#frontend-architecture)
6. [Database Design](#database-design)
7. [API Design](#api-design)
8. [Real-Time Communication](#real-time-communication)
9. [Authentication & Authorization](#authentication--authorization)
10. [File Storage Architecture](#file-storage-architecture)
11. [Email System Architecture](#email-system-architecture)
12. [Security Architecture](#security-architecture)
13. [Deployment Architecture](#deployment-architecture)
14. [Scalability Considerations](#scalability-considerations)
15. [System Workflows](#system-workflows)

---

## System Overview

### Purpose
The Property Management System is a full-stack web application designed to streamline communication and workflow between three primary user roles: **Landlords**, **Residents**, and **Contractors**. The system facilitates property management, maintenance request handling, real-time messaging, and automated notifications.

### Key Features
- **Property Management**: CRUD operations for properties with image storage
- **Tenant Assignment**: Link residents to properties with lease management
- **Maintenance Workflow**: Submit, assign, track, and complete maintenance requests
- **Real-Time Messaging**: Direct messaging between all user types
- **Notifications**: Real-time and persistent notification system
- **Rating System**: Landlords rate contractors after job completion
- **Automated Reminders**: Email notifications for lease expiration
- **File Management**: Image and PDF storage via Cloudinary

### Target Users
1. **Landlords** (Property Owners)
   - Manage multiple properties
   - Assign residents to properties
   - Handle maintenance requests
   - Assign contractors to jobs
   - Rate contractor performance

2. **Residents** (Tenants)
   - View property details
   - Submit maintenance requests with photos
   - Track request status
   - Communicate with landlord

3. **Contractors** (Service Providers)
   - View available maintenance requests
   - Accept/decline job assignments
   - Update job status
   - View ratings and job history

---

## High-Level Architecture

### Architecture Pattern
The system follows a **Client-Server Architecture** with a **Three-Tier Pattern**:

```
┌─────────────────────────────────────────────────────────────────────┐
│                         PRESENTATION TIER                            │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              React SPA (Single Page Application)              │  │
│  │                                                                │  │
│  │  • React Components  • React Router  • Auth0 React SDK       │  │
│  │  • Bootstrap UI      • Socket.IO Client  • State Management  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              ▲  │                                    │
└──────────────────────────────│──│────────────────────────────────────┘
                               │  │
                    HTTP/REST  │  │  WebSocket (Socket.IO)
                    + JWT Auth │  │
                               │  ▼
┌──────────────────────────────────────────────────────────────────────┐
│                         APPLICATION TIER                             │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                   Node.js + Express Server                    │  │
│  │                                                                │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │  │
│  │  │   Routes    │  │ Controllers  │  │   Middleware     │   │  │
│  │  │             │  │              │  │  • Auth (JWT)    │   │  │
│  │  │ • Users     │  │ • Property   │  │  • CORS          │   │  │
│  │  │ • Properties│  │ • Maintenance│  │  • Error Handler │   │  │
│  │  │ • Messages  │  │ • Messages   │  │                  │   │  │
│  │  │ • etc.      │  │ • etc.       │  │                  │   │  │
│  │  └─────────────┘  └──────────────┘  └──────────────────────┘   │  │
│  │                                                                │  │
│  │  ┌─────────────────────────┐  ┌──────────────────────────┐   │  │
│  │  │   Socket.IO Handler     │  │      Services            │   │  │
│  │  │  • Real-time messaging  │  │  • Email (Brevo)         │   │  │
│  │  │  • Notifications        │  │  • File Storage          │   │  │
│  │  │  • Online tracking      │  │    (Cloudinary)          │   │  │
│  │  └─────────────────────────┘  └──────────────────────────┘   │  │
│  │                                                                │  │
│  │  ┌─────────────────────────┐                                  │  │
│  │  │      Cron Jobs          │                                  │  │
│  │  │  • Lease reminders      │                                  │  │
│  │  │    (Daily at 9 AM)      │                                  │  │
│  │  └─────────────────────────┘                                  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              ▲  │                                    │
└──────────────────────────────│──│────────────────────────────────────┘
                               │  │
                       Mongoose │  │ MongoDB Driver
                         (ODM)  │  │
                               │  ▼
┌──────────────────────────────────────────────────────────────────────┐
│                           DATA TIER                                  │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    MongoDB Database                           │  │
│  │                                                                │  │
│  │  Collections:                                                 │  │
│  │  • users          • properties      • assignments            │  │
│  │  • profiles       • maintenance     • rooms                  │  │
│  │  • messages       • notifications   • ratings                │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                      EXTERNAL SERVICES                               │
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────┐    │
│  │   Auth0      │  │  Cloudinary  │  │   Brevo (Email)       │    │
│  │              │  │              │  │                       │    │
│  │ • JWT Tokens │  │ • Images     │  │ • Transactional       │    │
│  │ • User Auth  │  │ • PDFs       │  │   Emails              │    │
│  │ • SSO        │  │ • CDN        │  │ • Lease Reminders     │    │
│  └──────────────┘  └──────────────┘  └───────────────────────────┘    │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

### Communication Patterns

#### 1. **HTTP/REST** (Stateless)
- Client ↔ Server for CRUD operations
- JWT-based authentication
- JSON data format

#### 2. **WebSocket** (Stateful)
- Real-time messaging
- Live notifications
- Online presence tracking

#### 3. **Event-Driven**
- Cron jobs for scheduled tasks
- Database triggers for notifications
- Socket events for real-time updates

---

## Technology Stack

### Frontend Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.2.4 | UI framework |
| **Vite** | 8.0.0 | Build tool & dev server |
| **React Router** | 7.13.1 | Client-side routing |
| **Bootstrap** | 5.3.8 | UI components & styling |
| **Auth0 React SDK** | 2.15.1 | Authentication |
| **Socket.IO Client** | 4.8.3 | Real-time communication |

**Why React?**
- Component-based architecture for reusability
- Large ecosystem and community support
- Virtual DOM for performance
- Hooks for state management

**Why Vite?**
- Fast development server with HMR (Hot Module Replacement)
- Optimized production builds
- ES modules support
- Better than Create React App

### Backend Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18+ | JavaScript runtime |
| **Express** | 5.2.1 | Web framework |
| **MongoDB** | 7.1.0 | NoSQL database |
| **Mongoose** | 9.3.0 | MongoDB ODM |
| **Socket.IO** | 4.8.3 | Real-time engine |
| **express-oauth2-jwt-bearer** | 1.7.4 | JWT validation |
| **node-cron** | 4.2.1 | Job scheduling |
| **@getbrevo/brevo** | 5.0.4 | Email service |
| **Cloudinary** | 2.2.0 | File storage |

**Why Node.js + Express?**
- JavaScript full-stack (same language frontend/backend)
- Non-blocking I/O for real-time features
- Large npm ecosystem
- Easy WebSocket integration

**Why MongoDB?**
- Flexible schema for evolving data models
- Document-based storage (natural JSON mapping)
- Horizontal scalability
- Rich query capabilities

### Development Tools

| Tool | Purpose |
|------|---------|
| **Nodemon** | Auto-restart on file changes |
| **ESLint** | Code linting |
| **dotenv** | Environment variable management |
| **Git** | Version control |

---

## Backend Architecture

### Layered Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         ROUTES                               │
│  Define API endpoints and HTTP methods                      │
│  • /api/users, /api/properties, /api/maintenance, etc.     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                      MIDDLEWARE                              │
│  Request processing and validation                          │
│  • checkJwt (Auth0 JWT validation)                          │
│  • CORS                                                      │
│  • Error handling                                            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                     CONTROLLERS                              │
│  Business logic and request handling                        │
│  • propertyController, maintenanceController, etc.          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                       SERVICES                               │
│  External service integrations                              │
│  • emailService (Brevo)                                      │
│  • cloudinaryService                                         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                        MODELS                                │
│  Data schemas and validation                                │
│  • User, Property, Maintenance, Message, etc.                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATABASE                                │
│  MongoDB - Data persistence                                 │
└─────────────────────────────────────────────────────────────┘
```

### Directory Structure

```
backend/
├── config/
│   ├── config.js           # Configuration constants
│   ├── db.js               # MongoDB connection
│   └── seed.js             # Database seeding logic
│
├── controllers/            # Business logic
│   ├── userController.js
│   ├── propertyController.js
│   ├── maintenanceController.js
│   ├── messageController.js
│   ├── notificationController.js
│   └── ...
│
├── middleware/
│   └── auth.js             # JWT validation middleware
│
├── models/                 # Mongoose schemas
│   ├── User.js
│   ├── Property.js
│   ├── Maintenance.js
│   ├── Room.js
│   ├── Message.js
│   └── ...
│
├── routes/                 # API endpoint definitions
│   ├── users.js
│   ├── properties.js
│   ├── maintenance.js
│   └── ...
│
├── services/               # External service wrappers
│   ├── emailService.js     # Brevo email integration
│   └── cloudinaryService.js # File upload service
│
├── socket/
│   └── socketHandler.js    # Socket.IO event handlers
│
├── jobs/
│   └── leaseReminderJob.js # Cron jobs
│
├── scripts/                # Utility scripts
│   ├── seed.js
│   └── clearDb.js
│
└── server.js               # Application entry point
```

### Key Components

#### 1. **Server Entry Point** (`server.js`)
```javascript
// Responsibilities:
// • Initialize Express app
// • Configure middleware (CORS, JSON parsing)
// • Mount API routes
// • Initialize Socket.IO
// • Connect to MongoDB
// • Start HTTP server
// • Start cron jobs
```

#### 2. **Routes** (API Endpoints)
```javascript
// Pattern: HTTP Method + Path → Controller Function
// Example: GET /api/properties → getProperties()
// 
// All routes protected with checkJwt middleware
// Routes are modular and mounted in server.js
```

#### 3. **Controllers** (Business Logic)
```javascript
// Responsibilities:
// • Extract data from request (body, params, query)
// • Validate input
// • Call services if needed
// • Interact with models (database)
// • Format response
// • Handle errors
```

#### 4. **Models** (Data Layer)
```javascript
// Mongoose schemas define:
// • Field names and types
// • Validation rules
// • Default values
// • Indexes for query optimization
// • Virtual properties
// • Instance/static methods
```

#### 5. **Middleware** (Request Processing)
```javascript
// checkJwt: Validates Auth0 JWT token
// • Extracts token from Authorization header
// • Verifies signature using Auth0 public key
// • Attaches user info to req.auth
// • Rejects invalid/expired tokens
```

#### 6. **Services** (External Integrations)
```javascript
// emailService: Brevo email API wrapper
// cloudinaryService: Image/PDF upload wrapper
// 
// Benefits:
// • Centralized configuration
// • Reusable across controllers
// • Easy to mock for testing
```

---

## Frontend Architecture

### Component-Based Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         App.jsx                              │
│  • Global layout                                             │
│  • Authentication flow                                       │
│  • Socket.IO initialization                                  │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ▼                             ▼
┌──────────────┐            ┌──────────────────┐
│   Navbar     │            │   MainRouter     │
│  Component   │            │  (Role-based)    │
└──────────────┘            └────────┬─────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
                    ▼                ▼                ▼
          ┌─────────────────┐ ┌──────────────┐ ┌─────────────────┐
          │   Landlord      │ │  Resident    │ │  Contractor     │
          │   Dashboard     │ │  Dashboard   │ │  Dashboard      │
          └─────────────────┘ └──────────────┘ └─────────────────┘
                    │                │                │
                    │                │                │
          ┌─────────┴────────┐       │                │
          ▼                  ▼       ▼                ▼
    ┌──────────┐      ┌──────────┐  ...           ...
    │Properties│      │Completed │
    │Dashboard │      │Requests  │
    └──────────┘      └──────────┘
```

### Directory Structure

```
frontend/src/
├── assets/                 # Static assets (images, fonts)
│
├── components/             # Reusable UI components
│   ├── Navbar.jsx
│   ├── Sidebar components (Landlord, Resident, Contractor)
│   ├── Modal components (Edit, View, Create)
│   ├── Alert.jsx
│   ├── Toast.jsx
│   └── ...
│
├── pages/                  # Page-level components
│   ├── Home.jsx
│   ├── Contact.jsx
│   ├── OnboardingPage.jsx
│   ├── MessagesPage.jsx
│   ├── ProfilePage.jsx
│   │
│   ├── landlord/
│   │   ├── LandlordDashboard1.jsx
│   │   ├── PropertyDashboard.jsx
│   │   ├── PropertyManagementPage.jsx
│   │   └── CompletedRequests.jsx
│   │
│   ├── resident/
│   │   ├── ResidentDashboard.jsx
│   │   ├── PropertyDetail.jsx
│   │   ├── SubmitMaintenance.jsx
│   │   └── MaintenanceStatus.jsx
│   │
│   └── contractor/
│       ├── ContractorDashboard.jsx
│       ├── MaintenanceRequests.jsx
│       ├── MyJobs.jsx
│       └── Ratings.jsx
│
├── services/               # API & external services
│   ├── api/
│   │   ├── index.js       # Central export
│   │   ├── http.js        # HTTP client wrapper
│   │   ├── userApi.js
│   │   ├── propertyApi.js
│   │   ├── maintenanceApi.js
│   │   └── ...
│   │
│   └── socket.js          # Socket.IO client
│
├── context/
│   └── UserContext.jsx    # Global user state
│
├── router/
│   └── MainRouter.jsx     # Role-based routing
│
├── constants/
│   └── canadianCities.js  # Static data
│
├── App.jsx                # Main application component
├── main.jsx               # Entry point
└── index.css              # Global styles
```

### State Management Strategy

#### 1. **Local State** (useState)
- Component-specific data
- Form inputs
- UI state (modals, dropdowns)

#### 2. **Context API** (UserContext)
- Global user information (`dbUser`)
- Shared across all components
- Avoids prop drilling

#### 3. **Server State** (via API calls)
- Data fetched from backend
- Cached in component state
- Re-fetched on mount or action

**No Redux?**
- Application state is simple
- Most data fetched on-demand
- Context API sufficient for global user state

### Routing Strategy

```javascript
// Role-based routing with protection
<Route path="/landlord/*" 
       element={isLandlord ? <LandlordDashboard /> : <Navigate to="/" />} />

<Route path="/resident/*" 
       element={isResident ? <ResidentDashboard /> : <Navigate to="/" />} />

<Route path="/contractor/*" 
       element={isContractor ? <ContractorDashboard /> : <Navigate to="/" />} />
```

**Benefits**:
- Prevents unauthorized access
- Clean separation of concerns
- Easy to maintain

---

## Database Design

### Entity Relationship Diagram

```
┌─────────────┐           ┌──────────────┐           ┌─────────────┐
│    User     │           │   Property   │           │  Assignment │
│─────────────│           │──────────────│           │─────────────│
│ auth0Id (PK)│◄──┐       │ _id (PK)     │◄──┐       │ _id (PK)    │
│ name        │   │       │ landlordId   │   │       │ propertyId  │
│ email       │   │       │ name         │   │       │ landlordId  │
│ role        │   │       │ location     │   └───────│ residentId  │
│ picture     │   │       │ units        │           │ leaseExpire │
└─────────────┘   │       │ image        │           │ leaseDoc    │
                  │       │ description  │           │ status      │
                  │       └──────────────┘           │ rentPaid    │
                  │                                  └─────────────┘
                  │                                          │
                  │                                          │
┌─────────────┐   │       ┌──────────────┐                 │
│   Profile   │   │       │ Maintenance  │                 │
│─────────────│   │       │──────────────│                 │
│ auth0Id (FK)├───┘       │ _id (PK)     │                 │
│ firstName   │           │ residentId   │◄────────────────┘
│ lastName    │           │ propertyId   │
│ email       │           │ landlordId   │
│ contactNum  │           │ subject      │
│ address     │           │ description  │
│ city        │           │ priority     │
│ state       │           │ status       │
│ photo       │           │ photos[]     │
│ jobType     │           │ assignStatus │
│ avgRating   │           │ contractorId │
└─────────────┘           └──────────────┘
                                  │
                                  │
        ┌─────────────┐           │         ┌──────────────┐
        │    Room     │           │         │   Rating     │
        │─────────────│           │         │──────────────│
        │ _id (PK)    │           │         │ _id (PK)     │
        │ participants│           │         │ contractorId │
        │   [2 users] │           │         │ landlordId   │
        │ lastMessage │           │         │ maintenance  │◄──┘
        │ unreadCount │           │         │   Id (FK)    │
        └──────┬──────┘           │         │ rating       │
               │                  │         │ comment      │
               │                  │         └──────────────┘
               │                  │
               │                  │
        ┌──────▼──────┐    ┌──────▼──────────┐
        │   Message   │    │  Notification   │
        │─────────────│    │─────────────────│
        │ _id (PK)    │    │ _id (PK)        │
        │ roomId (FK) │    │ userId          │
        │ senderId    │    │ type            │
        │ senderName  │    │ title           │
        │ message     │    │ message         │
        │ read        │    │ read            │
        │ deleted     │    │ data            │
        └─────────────┘    └─────────────────┘
```

### Database Schema Details

#### **User Collection**
```javascript
{
  auth0Id: String (unique, indexed),  // Primary identifier
  name: String,
  email: String,
  picture: String,                    // URL from Auth0
  role: Enum["resident", "landlord", "contractor"],
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**: `auth0Id` (unique)  
**Relationships**: 1:1 with Profile, 1:N with Properties (if landlord)

#### **Profile Collection**
```javascript
{
  auth0Id: String (unique, indexed),  // Foreign key to User
  firstName: String,
  lastName: String,
  email: String,
  contactNumber: String,
  address: String,
  city: String,
  state: String,
  photo: {
    url: String,
    publicId: String                  // Cloudinary identifier
  },
  jobType: String,                    // Contractor only
  averageRating: Number,              // Contractor only (0-10)
  totalRatings: Number,               // Contractor only
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**: `auth0Id` (unique)  
**Why Separate from User?**: Keeps auth data clean, allows optional profile fields

#### **Property Collection**
```javascript
{
  _id: ObjectId,
  landlordId: String (indexed),       // auth0Id of landlord
  name: String,
  location: String,
  units: Number,
  image: {
    url: String,
    publicId: String
  },
  description: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**: `landlordId`  
**Relationships**: N:1 with User (landlord), 1:N with Assignments

#### **Assignment Collection**
```javascript
{
  _id: ObjectId,
  propertyId: ObjectId (indexed),     // Foreign key to Property
  landlordId: String,                 // auth0Id
  residentId: String (unique),        // auth0Id - one assignment per resident
  leaseExpireDate: Date,
  leaseDocument: {
    url: String,
    publicId: String,
    fileName: String
  },
  status: Enum["active", "expired", "terminated"],
  rentPaid: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**: `residentId` (unique), `propertyId`  
**Constraint**: One resident can only be assigned to one property at a time

#### **Maintenance Collection**
```javascript
{
  _id: ObjectId,
  residentId: String (indexed),       // Submitter
  propertyId: ObjectId,               // Foreign key to Property
  landlordId: String (indexed),       // Property owner
  subject: String,
  description: String,
  priority: Enum["Standard", "Urgent", "Emergency"],
  status: Enum["Submitted", "In Progress", "Completed"],
  photos: [
    { url: String, publicId: String }
  ],
  assignmentStatus: Enum["Unassigned", "Pending", "Accepted", "Declined"],
  contractorId: String,               // If assigned
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**: `residentId`, `landlordId`, `propertyId`, `createdAt` (descending)  
**Compound Index**: `{ landlordId: 1, createdAt: -1 }` for landlord dashboard queries

#### **Room Collection** (Chat Rooms)
```javascript
{
  _id: ObjectId,
  participants: [String, String],     // Exactly 2 auth0Ids (sorted)
  lastMessage: {
    text: String,
    senderId: String,
    senderName: String,
    sentAt: Date
  },
  unreadCount: Map<String, Number>,   // { "auth0|user1": 3, "auth0|user2": 0 }
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**: `participants`  
**Validation**: Array length must be exactly 2

#### **Message Collection**
```javascript
{
  _id: ObjectId,
  roomId: ObjectId (indexed),         // Foreign key to Room
  senderId: String,                   // auth0Id
  senderName: String,                 // Cached for display
  message: String,
  read: Boolean,
  deleted: Boolean,                   // Soft delete
  createdAt: Date
}
```

**Indexes**: Compound `{ roomId: 1, createdAt: 1 }` for chat history queries

#### **Notification Collection**
```javascript
{
  _id: ObjectId,
  userId: String (indexed),           // Recipient auth0Id
  type: String,                       // "maintenance_status", etc.
  title: String,
  message: String,
  read: Boolean,
  data: Object,                       // Additional context
  createdAt: Date
}
```

**Indexes**: Compound `{ userId: 1, createdAt: -1 }` for notification feed

#### **Rating Collection**
```javascript
{
  _id: ObjectId,
  contractorId: String (indexed),
  landlordId: String,
  maintenanceId: ObjectId (unique),   // One rating per job
  rating: Number,                     // 0-10
  comment: String,
  createdAt: Date
}
```

**Indexes**: `contractorId`, `maintenanceId` (unique)  
**Business Rule**: One rating per maintenance job

### Database Design Principles

1. **Denormalization for Performance**
   - `senderName` cached in Message (avoid JOIN on display)
   - `landlordId` in Maintenance (avoid Property lookup)
   - `lastMessage` in Room (fast conversation list)

2. **Indexing Strategy**
   - Index all foreign keys
   - Compound indexes for common query patterns
   - Unique indexes for business constraints

3. **Embedded vs. Referenced Documents**
   - **Embedded**: Small, bounded arrays (photos in Maintenance)
   - **Referenced**: Large, unbounded, or shared data (Property, User)

4. **Soft Deletes**
   - Messages marked as `deleted` but not removed
   - Maintains conversation integrity

---

## API Design

### RESTful API Principles

All API endpoints follow REST conventions:
- **Nouns** for resources (not verbs)
- **Plural** resource names
- **HTTP methods** indicate action
- **Status codes** indicate result

### API Base URL
- **Development**: `http://localhost:3000/api`
- **Production**: `https://yourdomain.com/api`

### Authentication
All endpoints (except health check) require:
```
Authorization: Bearer <JWT_TOKEN>
```

### API Endpoints Summary

#### **User Management**
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/users/me` | Get current user | ✅ |
| POST | `/api/users/onboard` | Create user after Auth0 signup | ✅ |

#### **Property Management**
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/properties` | Get all properties (landlord) | ✅ |
| GET | `/api/properties/:id` | Get property by ID | ✅ |
| POST | `/api/properties` | Create property | ✅ |
| PUT | `/api/properties/:id` | Update property | ✅ |
| DELETE | `/api/properties/:id` | Delete property | ✅ |

#### **Assignment Management**
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/assignments/my` | Get resident's assignment | ✅ |
| GET | `/api/assignments/property/:propertyId` | Get property assignments | ✅ |
| POST | `/api/assignments` | Create assignment | ✅ |
| PATCH | `/api/assignments/:id/rent-status` | Update rent status | ✅ |
| DELETE | `/api/assignments/:id` | Remove assignment | ✅ |

#### **Maintenance Management**
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/maintenance/my` | Get resident's requests | ✅ |
| GET | `/api/maintenance/assigned` | Get landlord's requests | ✅ |
| GET | `/api/maintenance/my-jobs` | Get contractor's active jobs | ✅ |
| GET | `/api/maintenance/past-jobs` | Get contractor's completed jobs | ✅ |
| GET | `/api/maintenance/contractors` | Search contractors | ✅ |
| POST | `/api/maintenance` | Create maintenance request | ✅ |
| PATCH | `/api/maintenance/:id/status` | Update status | ✅ |
| PATCH | `/api/maintenance/:id/assign` | Assign contractor | ✅ |
| PATCH | `/api/maintenance/:id/respond` | Accept/decline assignment | ✅ |
| DELETE | `/api/maintenance/:id` | Delete request | ✅ |

#### **Messaging**
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/rooms` | Get user's chat rooms | ✅ |
| POST | `/api/rooms/find-or-create` | Create/find DM room | ✅ |
| GET | `/api/messages/:roomId` | Get room messages | ✅ |
| PATCH | `/api/rooms/:roomId/read` | Mark messages as read | ✅ |

#### **Notifications**
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/notifications` | Get user's notifications | ✅ |
| PATCH | `/api/notifications/:id/read` | Mark as read | ✅ |
| PATCH | `/api/notifications/read-all` | Mark all as read | ✅ |

#### **Ratings**
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/ratings` | Rate contractor | ✅ |
| GET | `/api/ratings/contractor/:contractorId` | Get contractor ratings | ✅ |

#### **Profile**
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/profile` | Get user's profile | ✅ |
| PUT | `/api/profile` | Update profile | ✅ |

### API Response Format

**Success Response**:
```json
{
  "data": { ... },
  "status": 200
}
```

**Error Response**:
```json
{
  "error": "Error message",
  "status": 400
}
```

### HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Unexpected server error |

---

## Real-Time Communication

### Socket.IO Architecture

```
┌────────────────────────────────────────────────────────┐
│                   Socket.IO Server                      │
│                                                         │
│  ┌──────────────────────────────────────────────────┐ │
│  │         Connection Middleware                     │ │
│  │  • Validate JWT token                             │ │
│  │  • Extract user ID from token                     │ │
│  │  • Attach userId to socket object                 │ │
│  └──────────────────────────────────────────────────┘ │
│                         │                              │
│                         ▼                              │
│  ┌──────────────────────────────────────────────────┐ │
│  │         Online User Tracking                      │ │
│  │  onlineUsers = {                                  │ │
│  │    "auth0|user1": "socketId_abc123",             │ │
│  │    "auth0|user2": "socketId_xyz789"              │ │
│  │  }                                                │ │
│  └──────────────────────────────────────────────────┘ │
│                         │                              │
│                         ▼                              │
│  ┌──────────────────────────────────────────────────┐ │
│  │         Event Handlers                            │ │
│  │  • open_dm        - Join chat room                │ │
│  │  • send_dm        - Send message                  │ │
│  │  • delete_dm      - Delete message                │ │
│  │  • typing         - Typing indicator              │ │
│  │  • disconnect     - Clean up on disconnect        │ │
│  └──────────────────────────────────────────────────┘ │
│                                                         │
└────────────────────────────────────────────────────────┘
```

### Socket Events Flow

#### **1. Connection**
```
Client                          Server
  │                               │
  │──── Connect with JWT ────────▶│
  │                               │ Validate token
  │                               │ Store socketId
  │◄──── Connection OK ───────────│
  │                               │
```

#### **2. Sending Message**
```
Client A                      Server                    Client B
  │                             │                          │
  │── send_dm ─────────────────▶│                          │
  │   { roomId, message }       │ Save to DB               │
  │                             │ Update Room              │
  │                             │                          │
  │◄─ receive_dm ──────────────│                          │
  │                             │─── receive_dm ──────────▶│
  │                             │                          │
  │                             │─── notification ────────▶│
  │                             │   (if online)            │
```

#### **3. Typing Indicator**
```
Client A                      Server                    Client B
  │                             │                          │
  │── typing ──────────────────▶│                          │
  │   { roomId, isTyping }      │                          │
  │                             │─── user_typing ─────────▶│
  │                             │   (broadcast to room)     │
```

### WebSocket vs HTTP Decision Matrix

| Feature | Protocol | Reason |
|---------|----------|--------|
| Send message | WebSocket | Real-time delivery |
| Load message history | HTTP | One-time fetch |
| Typing indicator | WebSocket | Real-time status |
| Notifications | WebSocket | Instant push |
| User list | HTTP | Fetch on demand |
| Property CRUD | HTTP | Standard REST |

---

## Authentication & Authorization

### Auth0 Integration

```
┌─────────────────────────────────────────────────────────────┐
│                    Authentication Flow                       │
│                                                              │
│  1. User clicks "Login" in React app                        │
│  2. Auth0 React SDK redirects to Auth0 login page           │
│  3. User enters credentials                                 │
│  4. Auth0 validates credentials                             │
│  5. Auth0 redirects back to app with authorization code     │
│  6. React SDK exchanges code for JWT token                  │
│  7. Token stored in memory (not localStorage)               │
│  8. React app calls backend /api/users/me with token        │
│  9. Backend validates JWT and returns user data             │
│  10. User data stored in React Context                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### JWT Token Structure

```json
{
  "header": {
    "alg": "RS256",
    "typ": "JWT",
    "kid": "key-id"
  },
  "payload": {
    "sub": "auth0|6581c2f3e4b012345abcdef",
    "aud": "https://property-management-api/",
    "iss": "https://your-tenant.us.auth0.com/",
    "iat": 1715000000,
    "exp": 1715086400,
    "scope": "openid profile email"
  },
  "signature": "..."
}
```

**Key Fields**:
- `sub`: User's unique ID (used as `auth0Id` in database)
- `aud`: API audience (must match backend configuration)
- `iss`: Token issuer (Auth0 tenant)
- `exp`: Expiration timestamp

### Backend JWT Validation

```javascript
// middleware/auth.js
const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}/`,
  tokenSigningAlg: "RS256",
});

// Validation steps:
// 1. Extract token from Authorization header
// 2. Fetch public key from Auth0 JWKS endpoint
// 3. Verify signature using public key
// 4. Check expiration and claims
// 5. Attach user info to req.auth.payload
```

### Role-Based Access Control

**Roles**: Stored in User.role field
- `resident`
- `landlord`
- `contractor`

**Authorization Pattern**:
```javascript
// Controller checks role
const userId = req.auth.payload.sub;
const user = await User.findOne({ auth0Id: userId });

if (user.role !== 'landlord') {
  return res.status(403).json({ error: 'Access denied' });
}
```

### Frontend Route Protection

```javascript
// Role-based navigation
const isLandlord = dbUser?.role === "landlord";

<Route 
  path="/landlord/*" 
  element={isLandlord ? <LandlordDashboard /> : <Navigate to="/" />} 
/>
```

---

## File Storage Architecture

### Cloudinary Integration

```
┌─────────────────────────────────────────────────────────────┐
│                    File Upload Flow                          │
│                                                              │
│  1. User selects file (image/PDF) in frontend               │
│  2. Frontend converts to Base64 string                      │
│  3. Frontend sends Base64 in JSON payload to backend        │
│  4. Backend uploads to Cloudinary API                       │
│  5. Cloudinary returns secure URL and public ID             │
│  6. Backend stores URL + publicId in MongoDB                │
│  7. Backend returns full object to frontend                 │
│  8. Frontend displays image using URL                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### File Organization

| File Type | Cloudinary Folder | Model Field | Max Size |
|-----------|-------------------|-------------|----------|
| Property images | `t6pms/properties` | `Property.image` | 10MB |
| Profile photos | `t6pms/profiles` | `Profile.photo` | 5MB |
| Maintenance photos | `t6pms/maintenance` | `Maintenance.photos[]` | 5MB each (max 3) |
| Lease documents | `t6pms/leases` | `Assignment.leaseDocument` | 10MB |

### Image Transformations

```javascript
// Profile photo upload with transformation
await cloudinary.uploader.upload(base64Image, {
  folder: "t6pms/profiles",
  transformation: [
    { width: 400, height: 400, crop: "fill", gravity: "face" }
  ]
});
```

### File Deletion Strategy

```javascript
// On update/delete, remove old file from Cloudinary
if (oldPublicId) {
  await cloudinary.uploader.destroy(oldPublicId);
}
```

**Benefits**:
- No orphaned files
- Cost optimization
- Storage cleanup

---

## Email System Architecture

### Brevo (Email Service) Integration

```
┌─────────────────────────────────────────────────────────────┐
│                 Automated Email System                       │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Cron Job Scheduler                         │ │
│  │  node-cron: "0 9 * * *" (Daily at 9:00 AM)            │ │
│  └──────────────────┬─────────────────────────────────────┘ │
│                     │                                        │
│                     ▼                                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │           Lease Reminder Job                            │ │
│  │  1. Query all active assignments                        │ │
│  │  2. Calculate days until lease expiration               │ │
│  │  3. Filter assignments expiring in 7 or 14 days         │ │
│  │  4. Get landlord and property details                   │ │
│  │  5. Call emailService.sendLeaseExpiryEmail()            │ │
│  └──────────────────┬─────────────────────────────────────┘ │
│                     │                                        │
│                     ▼                                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Email Service                              │ │
│  │  1. Build HTML email template                           │ │
│  │  2. Populate with dynamic data                          │ │
│  │  3. Call Brevo API                                      │ │
│  │  4. Log success/failure                                 │ │
│  └──────────────────┬─────────────────────────────────────┘ │
│                     │                                        │
│                     ▼                                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Brevo API                                  │ │
│  │  • Validates sender                                     │ │
│  │  • Queues email for delivery                            │ │
│  │  • Handles SMTP delivery                                │ │
│  │  • Tracks delivery status                               │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Email Types

| Email Type | Trigger | Recipient | Status |
|------------|---------|-----------|--------|
| Lease Expiry (14 days) | Cron job | Landlord | ✅ Implemented |
| Lease Expiry (7 days) | Cron job | Landlord | ✅ Implemented |
| Maintenance Status | Contractor updates job | Resident | 📅 Planned |
| Contractor Assignment | Landlord assigns | Contractor | 📅 Planned |
| Rent Reminder | 3 days before due | Resident | 📅 Planned |

---

## Security Architecture

### Security Layers

```
┌────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                          │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  Layer 1: Network Security                            │ │
│  │  • HTTPS in production                                │ │
│  │  • CORS configuration                                 │ │
│  │  • Rate limiting (future)                             │ │
│  └──────────────────────────────────────────────────────┘ │
│                          │                                 │
│  ┌──────────────────────┼──────────────────────────────┐ │
│  │  Layer 2: Authentication                              │ │
│  │  • Auth0 JWT validation                               │ │
│  │  • RS256 asymmetric encryption                        │ │
│  │  • Token expiration (24 hours)                        │ │
│  └──────────────────────┼──────────────────────────────┘ │
│                          │                                 │
│  ┌──────────────────────┼──────────────────────────────┐ │
│  │  Layer 3: Authorization                               │ │
│  │  • Role-based access control                          │ │
│  │  • Resource ownership validation                      │ │
│  │  • Frontend route protection                          │ │
│  └──────────────────────┼──────────────────────────────┘ │
│                          │                                 │
│  ┌──────────────────────┼──────────────────────────────┐ │
│  │  Layer 4: Data Validation                             │ │
│  │  • Mongoose schema validation                         │ │
│  │  • Input sanitization                                 │ │
│  │  • Max length constraints                             │ │
│  └──────────────────────┼──────────────────────────────┘ │
│                          │                                 │
│  ┌──────────────────────┼──────────────────────────────┐ │
│  │  Layer 5: Secrets Management                          │ │
│  │  • Environment variables (.env)                       │ │
│  │  • .gitignore for sensitive files                     │ │
│  │  • No hardcoded credentials                           │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Security Best Practices Implemented

1. **Authentication**
   - ✅ JWT with RS256 (asymmetric encryption)
   - ✅ Token stored in memory (not localStorage)
   - ✅ Secure Auth0 integration
   - ✅ Token expiration enforced

2. **Authorization**
   - ✅ All API routes protected with `checkJwt` middleware
   - ✅ Resource ownership validation in controllers
   - ✅ Role-based access control
   - ✅ Frontend route guards

3. **Data Security**
   - ✅ CORS configured for allowed origins
   - ✅ Mongoose schema validation
   - ✅ No SQL injection (using Mongoose ODM)
   - ✅ Input length limits

4. **Secrets Management**
   - ✅ All credentials in `.env` file
   - ✅ `.env` in `.gitignore`
   - ✅ No hardcoded secrets in code

5. **File Upload Security**
   - ✅ Base64 validation
   - ✅ File size limits (10MB)
   - ✅ Cloudinary handles file validation
   - ✅ Secure URLs with signed uploads

### Security Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| XSS attacks | React auto-escapes JSX, no dangerouslySetInnerHTML |
| CSRF | JWT in header (not cookies), SameSite policy |
| SQL injection | MongoDB with Mongoose (NoSQL) |
| Brute force | Auth0 rate limiting |
| Token theft | Short expiration (24h), HTTPS only |
| File upload abuse | Size limits, type validation, Cloudinary scanning |

---

## Deployment Architecture

### Development Environment

```
Developer Machine
├── MongoDB (localhost:27017)
├── Backend Server (localhost:3000)
│   └── Serves API + Frontend static files
└── Frontend Dev Server (localhost:5173)
    └── Vite HMR for development
```

### Production Environment

```
┌─────────────────────────────────────────────────────────────┐
│                      Production Setup                        │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Load Balancer / Reverse Proxy              │ │
│  │                    (Nginx / Caddy)                       │ │
│  │  • HTTPS termination                                    │ │
│  │  • Static file caching                                  │ │
│  │  • Rate limiting                                         │ │
│  └──────────────────┬─────────────────┬───────────────────┘ │
│                     │                 │                      │
│                     ▼                 ▼                      │
│  ┌─────────────────────────┐  ┌──────────────────────────┐ │
│  │   Static Files (CDN)    │  │   Node.js Server         │ │
│  │   • React build         │  │   • Express API          │ │
│  │   • Images, CSS, JS     │  │   • Socket.IO            │ │
│  └─────────────────────────┘  │   • Background jobs      │ │
│                                └──────────┬───────────────┘ │
│                                           │                  │
│                                           ▼                  │
│                                ┌──────────────────────────┐ │
│                                │   MongoDB Atlas          │ │
│                                │   (Cloud Database)       │ │
│                                └──────────────────────────┘ │
│                                                              │
│  External Services:                                         │
│  • Auth0 (Authentication)                                   │
│  • Cloudinary (File Storage)                                │
│  • Brevo (Email Service)                                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Deployment Options

#### Option 1: Traditional VPS (DigitalOcean, Linode)
```bash
# Single server deployment
- Install Node.js, MongoDB, Nginx
- Clone repository
- Build frontend (npm run build)
- Run backend with PM2
- Configure Nginx as reverse proxy
```

#### Option 2: Platform as a Service (Heroku, Render)
```bash
# Managed deployment
- Connect GitHub repository
- Set environment variables
- Auto-deploy on push to main branch
- Managed SSL, scaling, logs
```

#### Option 3: Containerized (Docker + Kubernetes)
```yaml
# Docker Compose or K8s
services:
  - frontend (nginx serving static files)
  - backend (Node.js API)
  - mongodb (or external MongoDB Atlas)
```

### Environment Variables for Production

```env
# Server
PORT=3000
CLIENT_URL=https://yourdomain.com
NODE_ENV=production

# Database
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/prod-db

# Auth0
AUTH0_DOMAIN=your-tenant.us.auth0.com
AUTH0_AUDIENCE=https://property-management-api/

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=123456789
CLOUDINARY_API_SECRET=secret

# Brevo
BREVO_API_KEY=xkeysib-production-key
BREVO_FROM_EMAIL=noreply@yourdomain.com
```

---

## Scalability Considerations

### Current Architecture Limits

| Component | Current | Bottleneck | Solution |
|-----------|---------|------------|----------|
| Backend | Single server | CPU/Memory | Horizontal scaling |
| Database | Single MongoDB | Connections | Replica set |
| File Storage | Cloudinary | API limits | Already scalable |
| Real-time | Single Socket.IO | Memory for connections | Redis adapter |

### Scalability Strategies

#### 1. **Database Scaling**
```
Current: Single MongoDB instance
Future: MongoDB Replica Set
  - Primary (write) + Secondary (read) nodes
  - Automatic failover
  - Read distribution
```

#### 2. **Application Scaling**
```
Current: Single Node.js server
Future: Multiple instances behind load balancer
  - PM2 cluster mode (multi-core)
  - Horizontal scaling (multiple servers)
  - Stateless design (no session storage in memory)
```

#### 3. **Socket.IO Scaling**
```
Current: In-memory onlineUsers object
Future: Redis adapter for Socket.IO
  - Shared state across multiple servers
  - Pub/sub for event broadcasting
  - Session persistence
```

#### 4. **Caching Strategy**
```
Future optimizations:
  - Redis for frequently accessed data
  - CDN for static assets
  - API response caching (ETags)
  - Database query caching
```

### Performance Optimizations

1. **Database Indexes** ✅
   - All foreign keys indexed
   - Compound indexes for common queries
   - Monitored with MongoDB explain()

2. **API Response Size** ✅
   - Pagination for lists
   - Limit message history (50 at a time)
   - Projection to return only needed fields

3. **Frontend Optimizations** ✅
   - Code splitting (React.lazy)
   - Image optimization via Cloudinary
   - Vite production build optimization
   - Bootstrap CDN for common styles

4. **Real-time Optimizations** ✅
   - Room-based event broadcasting
   - Typing indicator debouncing
   - Unread counter batching

---

## System Workflows

### Workflow 1: User Registration & Onboarding

```
1. User clicks "Login" button
2. Redirected to Auth0 login page
3. User signs up with email/password or social login
4. Auth0 creates account and returns to app
5. Frontend calls GET /api/users/me
   → 404: User not in database
6. Frontend shows onboarding page
7. User selects role (landlord, resident, contractor)
8. Frontend calls POST /api/users/onboard { role }
9. Backend creates User and Profile records
10. User redirected to role-specific dashboard
```

### Workflow 2: Maintenance Request Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│                 MAINTENANCE REQUEST FLOW                     │
│                                                              │
│  1. Resident submits request with photos                    │
│     POST /api/maintenance                                   │
│     { subject, description, priority, photos }              │
│                                                              │
│  2. Backend creates Maintenance record                      │
│     Status: "Submitted"                                     │
│     AssignmentStatus: "Unassigned"                          │
│                                                              │
│  3. Landlord views request in dashboard                     │
│     GET /api/maintenance/assigned                           │
│                                                              │
│  4. Landlord searches and selects contractor                │
│     GET /api/maintenance/contractors?jobType=plumber        │
│                                                              │
│  5. Landlord assigns contractor                             │
│     PATCH /api/maintenance/:id/assign                       │
│     { contractorId }                                        │
│     → AssignmentStatus: "Pending"                           │
│     → Notification sent to contractor                       │
│                                                              │
│  6. Contractor reviews and accepts                          │
│     PATCH /api/maintenance/:id/respond                      │
│     { response: "accept" }                                  │
│     → AssignmentStatus: "Accepted"                          │
│     → Notification sent to resident                         │
│                                                              │
│  7. Contractor updates status to "In Progress"              │
│     PATCH /api/maintenance/:id/contractor-status            │
│     { status: "In Progress" }                               │
│     → Notification sent to resident                         │
│                                                              │
│  8. Contractor marks job as "Completed"                     │
│     PATCH /api/maintenance/:id/contractor-status            │
│     { status: "Completed" }                                 │
│     → Notification sent to resident & landlord              │
│                                                              │
│  9. Landlord rates contractor                               │
│     POST /api/ratings                                       │
│     { maintenanceId, contractorId, rating, comment }        │
│     → Contractor's average rating updated                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Workflow 3: Real-Time Messaging

```
1. User A opens Messages page
   → GET /api/rooms (fetch conversation list)

2. User A clicks on User B's conversation
   → GET /api/messages/:roomId (fetch history)
   → socket.emit("open_dm", { roomId })

3. User A types message
   → Frontend shows local "typing..." indicator
   → socket.emit("typing", { roomId, isTyping: true })

4. User B sees "User A is typing..."
   → socket.on("user_typing") updates UI

5. User A sends message
   → socket.emit("send_dm", { roomId, message, senderName })

6. Backend saves to database
   → Message.create({ ... })
   → Room.update({ lastMessage, unreadCount })

7. Backend broadcasts to room
   → io.to(roomId).emit("receive_dm", message)

8. User B receives message instantly
   → socket.on("receive_dm") appends to chat

9. User B sees notification if not in room
   → socket.on("new_message_notification")
```

---

## Conclusion

This Property Management System is built with a modern, scalable architecture that prioritizes:

✅ **Security** — JWT authentication, role-based access, secure file storage  
✅ **Real-time** — Socket.IO for instant messaging and notifications  
✅ **Maintainability** — Clean separation of concerns, modular design  
✅ **Scalability** — Stateless API, MongoDB indexes, cloud services  
✅ **User Experience** — Responsive UI, intuitive workflows, instant feedback  

The architecture supports future enhancements such as:
- Advanced analytics and reporting
- Multi-language support
- Mobile app (React Native)
- Payment processing integration
- Advanced contractor marketplace features

---

## Document History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | May 22, 2026 | Initial architecture document | Development Team |

---

**End of Architecture Design Document**
