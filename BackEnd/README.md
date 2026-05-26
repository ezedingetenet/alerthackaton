# Digital Health & Innovation Forum - Backend API

## Setup Instructions

### 1. Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Setup
1. Create a PostgreSQL database:
```sql
CREATE DATABASE digital_health_forum;
```

2. Connect to the database and run the schema:
```bash
psql -U postgres -d digital_health_forum -f db/schema.sql
```

3. Verify the admin user was created:
- Email: `admin@digitalhealthforum.com`
- Password: `admin123` (hashed)

### 4. Environment Configuration
The `.env` file is already configured for local development. Update if needed:
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` for your database
- `JWT_SECRET` should be changed for production
- `CORS_ORIGIN` should include your frontend URL

### 5. Start the Server
```bash
npm start
```

The server will run on `http://localhost:3000`

## API Base URL
All endpoints start with `/api`

## Authentication
- Register: `POST /auth/register`
- Login: `POST /auth/login` — returns JWT token
- Include token in requests: `Authorization: Bearer <token>`

## Main Endpoints

### Schedule (Public)
- `GET /schedule` — Get all schedule items

### Registrations (User)
- `POST /registrations` — Submit registration
- `GET /registrations/mine` — View own registration

### Registrations (Admin)
- `GET /registrations` — View all registrations (with filters)
- `GET /registrations/stats` — Get registration statistics
- `PUT /registrations/:id/status` — Approve/reject registration

### Exhibitors (User)
- `POST /exhibitors/apply` — Submit exhibitor application
- `GET /exhibitors/mine` — View own application

### Exhibitors (Admin)
- `GET /exhibitors` — View all applications
- `PUT /exhibitors/:id/status` — Approve/reject application

### Support Tickets (User)
- `POST /tickets` — Create support ticket
- `GET /tickets/mine` — View own tickets
- `GET /tickets/:id/messages` — View ticket conversation
- `POST /tickets/:id/messages` — Send message in ticket

### Support Tickets (Admin)
- `GET /tickets` — View all tickets (with filters)
- `PUT /tickets/:id/status` — Update ticket status/priority

### Admin Dashboard
- `GET /admin/stats` — Get all dashboard statistics

## Testing the API

### Health Check
```bash
curl http://localhost:3000/api/health
```

### Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","full_name":"John Doe","phone":"1234567890"}'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@digitalhealthforum.com","password":"admin123"}'
```

### Get Schedule
```bash
curl http://localhost:3000/api/schedule
```

## Database Schema

### Tables
- `users` — User accounts (admin & regular users)
- `registrations` — Event registrations (solo & team)
- `team_members` — Members of team registrations
- `exhibitor_applications` — Exhibitor applications
- `schedule_items` — Event schedule entries
- `support_tickets` — Customer support tickets
- `ticket_messages` — Messages within tickets

See `db/schema.sql` for detailed schema.

## Error Handling
All endpoints return consistent error responses:
```json
{ "error": "Error message here" }
```

HTTP Status Codes:
- 200 — Success
- 201 — Created
- 400 — Bad Request
- 401 — Unauthorized
- 403 — Forbidden
- 404 — Not Found
- 500 — Server Error
