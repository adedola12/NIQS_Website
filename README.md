# NIQS Website — MERN Stack

**Nigerian Institute of Quantity Surveyors** — Full-stack website with 3-tier admin system.

## Tech Stack
- **Frontend**: Vite + React (.jsx) with React Router v6
- **Backend**: Node.js + Express (.js)
- **Database**: MongoDB Atlas (Mongoose ODM)
- **Auth**: JWT (httpOnly cookies)

## Quick Start

### 1. Server
```bash
cd server
cp .env.example .env   # Edit with your MongoDB URI
npm install
npm run seed            # Creates initial Main Admin
npm run dev
```

### 2. Client
```bash
cd client
npm install
npm run dev
```

Server runs on `http://localhost:5000`, Client on `http://localhost:5173`

## Admin Roles

| Role | Access |
|------|--------|
| **Main Admin** | Full access — manages admins (UAC), all content, delete rights |
| **National Admin** | National content — news, events, exco, jobs, partners |
| **State Chapter Admin** | Own chapter only — chapter news, events, exco |

### Default Admin Login
- **Email**: admin@niqs.org.ng
- **Password**: NiqsAdmin@2025
- Change password after first login!

## API Endpoints

| Route | Description |
|-------|-------------|
| `POST /api/auth/admin/login` | Admin login |
| `POST /api/auth/member/login` | Member login |
| `POST /api/auth/member/register` | Member registration |
| `GET /api/admin/dashboard` | Dashboard stats |
| `CRUD /api/admin` | Admin management (main_admin only) |
| `CRUD /api/news` | News articles |
| `CRUD /api/events` | Events |
| `CRUD /api/exco` | Executive council |
| `CRUD /api/chapters` | State chapters |
| `CRUD /api/jobs` | Job listings |
| `CRUD /api/partners` | Partners |
| `CRUD /api/members` | Members |
| `POST /api/contact` | Contact form |
| `POST /api/upload` | File upload |

## Project Structure
```
niqs-website/
├── client/           # Vite + React frontend
│   └── src/
│       ├── pages/
│       │   ├── public/    # 22 public pages
│       │   ├── auth/      # Login, Forgot/Reset Password
│       │   ├── portal/    # Mini member portal
│       │   └── admin/     # Admin panel (10 pages)
│       ├── components/    # Reusable components
│       ├── context/       # Auth context
│       └── api/           # Axios config
└── server/           # Express backend
    ├── models/       # 10 Mongoose models
    ├── routes/       # 11 route files
    ├── controllers/  # 10 controllers
    ├── middleware/    # Auth, role-check, upload
    └── utils/        # Seed script
```
