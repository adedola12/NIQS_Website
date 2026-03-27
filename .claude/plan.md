# NIQS Website - MERN Stack Implementation Plan

## Project Overview
Convert the existing NIQS single-page HTML website into a full MERN stack application with:
- **Client**: Vite + React (.jsx files)
- **Server**: Node.js + Express (.js files) + MongoDB Atlas
- **3-tier Admin System**: Main Admin, National Admin, State Chapter Admin
- **Mini Members Portal**: Basic member dashboard (placeholder for full portal)

---

## Project Structure

```
niqs-website/
├── client/                          # Vite + React frontend
│   ├── public/
│   │   └── niqs-logo.png
│   ├── src/
│   │   ├── main.jsx                 # Entry point
│   │   ├── App.jsx                  # Root with React Router
│   │   ├── index.css                # Global styles (from HTML)
│   │   ├── api/
│   │   │   └── axios.js             # Axios instance config
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # Auth state management
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   └── PageHero.jsx
│   │   │   ├── common/
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   ├── Toast.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── LoadingSpinner.jsx
│   │   │   │   └── ProtectedRoute.jsx
│   │   │   ├── home/
│   │   │   │   ├── Hero.jsx
│   │   │   │   ├── StatsStrip.jsx
│   │   │   │   ├── ServicesGrid.jsx
│   │   │   │   ├── NewsPreview.jsx
│   │   │   │   ├── EventsPreview.jsx
│   │   │   │   └── CTASection.jsx
│   │   │   └── admin/
│   │   │       ├── AdminSidebar.jsx
│   │   │       ├── AdminHeader.jsx
│   │   │       ├── StatsCard.jsx
│   │   │       └── DataTable.jsx
│   │   ├── pages/
│   │   │   ├── public/               # Public-facing pages
│   │   │   │   ├── Home.jsx
│   │   │   │   ├── About.jsx
│   │   │   │   ├── President.jsx
│   │   │   │   ├── Council.jsx
│   │   │   │   ├── PastPresidents.jsx
│   │   │   │   ├── Chapters.jsx
│   │   │   │   ├── ChapterDetail.jsx
│   │   │   │   ├── WAQSN.jsx
│   │   │   │   ├── YQSF.jsx
│   │   │   │   ├── Reciprocity.jsx
│   │   │   │   ├── BrandMaterials.jsx
│   │   │   │   ├── Membership.jsx
│   │   │   │   ├── Exams.jsx
│   │   │   │   ├── Research.jsx
│   │   │   │   ├── News.jsx
│   │   │   │   ├── NewsArticle.jsx
│   │   │   │   ├── Events.jsx
│   │   │   │   ├── Jobs.jsx
│   │   │   │   ├── Payment.jsx
│   │   │   │   ├── Contact.jsx
│   │   │   │   ├── Partnership.jsx
│   │   │   │   └── NPC.jsx
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── ForgotPassword.jsx
│   │   │   │   └── ResetPassword.jsx
│   │   │   ├── portal/               # Mini Members Portal
│   │   │   │   ├── PortalDashboard.jsx
│   │   │   │   ├── PortalProfile.jsx
│   │   │   │   └── PortalLayout.jsx
│   │   │   └── admin/                # Admin Panel
│   │   │       ├── AdminLayout.jsx
│   │   │       ├── Dashboard.jsx
│   │   │       ├── ManageAdmins.jsx       # Main Admin only
│   │   │       ├── ManageNews.jsx
│   │   │       ├── ManageEvents.jsx
│   │   │       ├── ManageExco.jsx
│   │   │       ├── ManageChapters.jsx
│   │   │       ├── ManageMembers.jsx
│   │   │       ├── ManageJobs.jsx
│   │   │       └── ManagePartners.jsx
│   │   └── utils/
│   │       └── roleHelpers.js
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                           # Node.js + Express backend
│   ├── server.js                     # Entry point
│   ├── config/
│   │   └── db.js                     # MongoDB Atlas connection
│   ├── middleware/
│   │   ├── auth.js                   # JWT verification
│   │   ├── roleCheck.js              # Role-based access control
│   │   └── upload.js                 # Multer file upload config
│   ├── models/
│   │   ├── User.js
│   │   ├── Admin.js
│   │   ├── News.js
│   │   ├── Event.js
│   │   ├── Exco.js                   # Executive council members
│   │   ├── Chapter.js
│   │   ├── Job.js
│   │   ├── Partner.js
│   │   ├── Member.js
│   │   └── Contact.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── admin.js
│   │   ├── news.js
│   │   ├── events.js
│   │   ├── exco.js
│   │   ├── chapters.js
│   │   ├── jobs.js
│   │   ├── partners.js
│   │   ├── members.js
│   │   ├── contact.js
│   │   └── upload.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── adminController.js
│   │   ├── newsController.js
│   │   ├── eventController.js
│   │   ├── excoController.js
│   │   ├── chapterController.js
│   │   ├── jobController.js
│   │   ├── partnerController.js
│   │   ├── memberController.js
│   │   └── contactController.js
│   ├── utils/
│   │   └── seedAdmin.js              # Seed initial Main Admin
│   ├── .env.example
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 3-Tier Admin Role System

### Role Hierarchy

| Role | Slug | Scope | Can Create |
|------|------|-------|------------|
| **Main Admin** | `main_admin` | Everything site-wide | National Admin, State Admin, all content |
| **National Admin** | `national_admin` | National-level content | National Exco, National Events, National News |
| **State Chapter Admin** | `state_admin` | Their assigned chapter only | Chapter Exco, Chapter Events, Chapter News |

### Permissions Matrix

| Action | Main Admin | National Admin | State Admin |
|--------|-----------|---------------|-------------|
| Manage other admins (UAC) | YES | NO | NO |
| Add/Edit/Delete National News | YES | YES | NO |
| Add/Edit/Delete National Events | YES | YES | NO |
| Add/Edit/Delete National Exco | YES | YES | NO |
| Add/Edit/Delete Chapter News | YES | YES (all) | Own chapter only |
| Add/Edit/Delete Chapter Events | YES | YES (all) | Own chapter only |
| Add/Edit/Delete Chapter Exco | YES | YES (all) | Own chapter only |
| Manage Jobs | YES | YES | NO |
| Manage Partners | YES | YES | NO |
| Manage Members | YES | YES | View only |
| View Dashboard Analytics | Full | National | Chapter-level |
| Delete any content | YES | NO | NO |

---

## Implementation Phases

### Phase 1: Project Scaffold & Server Core
1. Create project folder structure
2. Initialize server package.json with dependencies (express, mongoose, bcryptjs, jsonwebtoken, cors, dotenv, multer)
3. Initialize client with Vite + React
4. Set up MongoDB connection config
5. Create all Mongoose models
6. Create auth middleware (JWT) and role-check middleware
7. Seed script for initial Main Admin

### Phase 2: Server API Routes
1. Auth routes (login, register member, forgot/reset password)
2. Admin CRUD routes (protected by main_admin role)
3. News CRUD routes (scoped by role)
4. Events CRUD routes (scoped by role)
5. Exco CRUD routes (scoped by role)
6. Chapters routes
7. Jobs, Partners, Contact, Members routes
8. File upload route

### Phase 3: Client - Public Pages
1. Global styles extracted from HTML (CSS variables, typography, components)
2. Layout components (Navbar, Footer, PageHero)
3. Home page with all sections (Hero, Stats, Services, News Preview, Events Preview, CTA)
4. All public pages converted from HTML to React components
5. React Router setup with all routes

### Phase 4: Client - Auth & Members Portal
1. Login page
2. AuthContext for JWT token management
3. ProtectedRoute component
4. Mini Portal: Dashboard, Profile view
5. Forgot/Reset password pages

### Phase 5: Client - Admin Panel
1. Admin layout with sidebar navigation
2. Dashboard with role-aware stats
3. ManageAdmins page (Main Admin only - UAC)
4. CRUD pages for News, Events, Exco, Chapters, Jobs, Partners
5. Role-based menu visibility (hide options user can't access)
6. DataTable component with search/filter/pagination

---

## Key Technical Decisions

- **Auth**: JWT stored in httpOnly cookies (secure) + refresh token pattern
- **Passwords**: bcryptjs with 12 salt rounds
- **File uploads**: Multer with local storage (can swap to S3/Cloudinary later)
- **State management**: React Context (AuthContext) - no Redux needed
- **Routing**: react-router-dom v6
- **HTTP client**: Axios with interceptors for auth headers
- **CSS**: Global CSS file extracted from existing HTML design (preserving the exact look)
- **Admin UI**: Custom dashboard built with the same design system (navy/gold theme)

---

## Database Models Summary

**User** (for members): email, password, firstName, lastName, phone, membershipType, membershipId, isVerified
**Admin**: email, password, firstName, lastName, role (main_admin|national_admin|state_admin), assignedChapter (for state_admin), createdBy
**News**: title, content, image, category, tags, scope (national|chapter), chapterId, author, createdAt
**Event**: title, description, date, location, type, scope (national|chapter), chapterId, image, createdAt
**Exco**: name, title, image, bio, scope (national|chapter), chapterId, order
**Chapter**: name, slug, state, chairperson, address, email, phone
**Job**: title, company, location, type, description, logo, postedBy, createdAt
**Partner**: name, tier, logo, description, benefits, price
**Contact**: name, email, subject, message, createdAt
**Member**: (extends User with QS-specific fields - kept minimal for now)
