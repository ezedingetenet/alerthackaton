# Digital Health & Innovation Forum - Quick Start Guide

## What's Been Built

### Backend (Node.js + Express + PostgreSQL)
✓ REST API with JWT authentication
✓ Complete database schema (7 tables with relationships)
✓ All endpoints for registrations, exhibitors, schedule, support tickets, and admin stats
✓ Role-based access control (admin vs user)
✓ Database seed with schedule items and admin account

### Frontend (HTML/CSS/Vanilla JS)
✓ Public website with dynamic schedule loading
✓ User registration form (3-step multi-form)
✓ Customer support ticketing system
✓ Complete admin dashboard with 5 management pages
✓ Responsive sidebar navigation

---

## Getting Started

### 1. Database Setup
Install PostgreSQL and create database:
```sql
CREATE DATABASE digital_health_forum;
```

Run the schema:
```bash
psql -U postgres -d digital_health_forum -f BackEnd/db/schema.sql
```

### 2. Backend Setup
```bash
cd BackEnd
npm install
```

Create `.env` file (copy from `.env.example` and update database credentials):
```
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=digital_health_forum
```

Start the server:
```bash
npm start
```
Server runs on `http://localhost:3000`

### 3. Frontend Setup
Open FrontEnd/index.html in a browser (use Live Server extension or any local server)

---

## Default Admin Account
- **Email:** admin@digitalhealthforum.com
- **Password:** admin123

---

## Key Features

### For Users:
1. **Register** - Multi-step form with solo/team options
2. **View Schedule** - Dynamically loaded from backend
3. **Submit Support Tickets** - Create and track support requests
4. **Manage Registrations** - View personal registration status

### For Admins:
1. **Dashboard** - Overview statistics and charts
2. **Manage Registrations** - Approve/reject, filter by type/status
3. **Manage Exhibitors** - Review and approve exhibitor applications
4. **Edit Schedule** - Add, edit, delete schedule items in real-time
5. **Support Tickets** - View, reply to, and manage support tickets

---

## API Base URL
```
http://localhost:3000/api
```

## Main Endpoints

**Auth:**
- POST `/auth/register` - User registration
- POST `/auth/login` - User login

**Registrations:**
- POST `/registrations` - Submit registration
- GET `/registrations/mine` - View own registration
- GET `/registrations` (admin) - View all
- GET `/registrations/stats` (admin) - Statistics
- PUT `/registrations/:id/status` (admin) - Approve/reject

**Exhibitors:**
- POST `/exhibitors/apply` - Apply as exhibitor
- GET `/exhibitors` (admin) - View applications
- PUT `/exhibitors/:id/status` (admin) - Approve/reject

**Schedule:**
- GET `/schedule` - View public schedule
- POST `/schedule` (admin) - Add item
- PUT `/schedule/:id` (admin) - Edit item
- DELETE `/schedule/:id` (admin) - Delete item

**Support Tickets:**
- POST `/tickets` - Create ticket
- GET `/tickets/mine` - View own tickets
- GET `/tickets/:id/messages` - View conversation
- POST `/tickets/:id/messages` - Send message
- GET `/tickets` (admin) - View all tickets
- PUT `/tickets/:id/status` (admin) - Update status

**Admin:**
- GET `/admin/stats` - Dashboard statistics

---

## File Structure
```
Pro/
├── BackEnd/
│   ├── server.js
│   ├── package.json
│   ├── .env
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── adminOnly.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── registrations.js
│   │   ├── exhibitors.js
│   │   ├── schedule.js
│   │   └── tickets.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── registrationController.js
│   │   ├── exhibitorController.js
│   │   ├── scheduleController.js
│   │   ├── ticketController.js
│   │   └── adminController.js
│   └── db/
│       └── schema.sql
│
└── FrontEnd/
    ├── index.html (updated with dynamic schedule)
    ├── register.html (3-step registration form)
    ├── contact.html (support ticketing)
    ├── style/
    │   └── style.css
    └── admin/
        ├── login.html
        ├── dashboard.html
        ├── registrations.html
        ├── exhibitors.html
        ├── schedule.html
        └── tickets.html
```

---

## Testing Workflow

1. **User Registration:**
   - Go to register.html → Fill form → Submit
   - User appears in admin registrations panel

2. **Admin Approval:**
   - Login at admin/login.html
   - Go to Registrations → Approve/Reject

3. **Support Ticket:**
   - Go to contact.html (must be logged in)
   - Submit ticket
   - Admin can reply in admin/tickets.html

4. **Schedule Management:**
   - Admin can add/edit/delete schedule items
   - Changes appear immediately on index.html

---

## Important Notes

- JWT tokens stored in localStorage (expires in 7 days)
- CORS configured for localhost access
- All passwords hashed with bcryptjs
- Database uses UUIDs for all primary keys
- Timestamps auto-managed (created_at, updated_at)

---

## Next Steps

1. Update JWT_SECRET in .env for production
2. Add email notifications (optional)
3. Add file uploads for exhibitor documents (optional)
4. Deploy backend to cloud (Heroku, Railway, etc.)
5. Customize styling to match brand guidelines
