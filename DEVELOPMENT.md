# Development Guide

## Architecture Overview

### Backend Architecture
- **Express Server**: RESTful API with CORS support
- **Database**: SQLite with better-sqlite3 (WAL mode for concurrency)
- **Telegram Client**: gramjs library for MTProto protocol
- **Authentication**: JWT tokens, bcrypt password hashing
- **Streaming**: HTTP Range request support for efficient video delivery

### Frontend Architecture
- **Framework**: Angular 17+ (standalone components)
- **Styling**: Tailwind CSS for responsive Netflix-style UI
- **State Management**: Angular services with RxJS observables
- **Routing**: Lazy-loadable routes with guards
- **HTTP**: HttpClient with interceptors for auth

## Running the Application

### Backend Development
```bash
cd backend
npm run dev
# Watches server.js and auto-restarts on changes
```

### Frontend Development
```bash
cd frontend
npm start
# Runs on http://localhost:4200 with live reload
```

## Key Files & Responsibilities

### Backend

**`server.js`**
- Express app initialization
- Route registration
- Middleware setup (CORS, JSON parsing)
- Telegram client initialization
- Graceful shutdown

**`database/index.js`**
- SQLite database initialization
- Schema creation (users, videos tables)
- Index creation for performance

**`telegram/client.js`**
- gramjs TelegramClient setup
- Event handlers for new messages
- File download streaming
- Session management

**`routes/`**
- `auth.routes.js` - User registration & login
- `video.routes.js` - Video list, details, streaming
- `admin.routes.js` - Admin management (videos, users)

**`scripts/`**
- `init-telegram.js` - First-time Telegram authentication
- `init-admin.js` - Create initial admin user

### Frontend

**`services/`**
- `auth.service.ts` - JWT token & user management
- `video.service.ts` - Video API calls
- `admin.service.ts` - Admin endpoints

**`pages/`**
- `home/` - Video grid with categories
- `player/` - Video player with details
- `login/` - Authentication form
- `admin-dashboard/` - Admin management UI

**`components/`**
- `navbar/` - Top navigation
- `video-card/` - Video thumbnail card
- `video-player/` - HTML5 video wrapper
- `login-form/` - Login/register form
- `category-list/` - Category filter

**`guards/`**
- `auth.guard.ts` - Require authentication
- `admin.guard.ts` - Require admin role

## Database Schema

### Users Table
```
id (PK INTEGER)
email (TEXT UNIQUE NOT NULL)
password_hash (TEXT NOT NULL)
role (TEXT DEFAULT 'user')
created_at (DATETIME DEFAULT CURRENT_TIMESTAMP)
```

### Videos Table
```
id (PK INTEGER)
title (TEXT NOT NULL)
description (TEXT)
telegram_message_id (INTEGER UNIQUE)
thumbnail (TEXT)
category (TEXT)
duration (INTEGER)
uploaded_at (DATETIME DEFAULT CURRENT_TIMESTAMP)
```

## API Flow Examples

### User Login Flow
1. Frontend: `POST /auth/login` with email/password
2. Backend: Hash check, generate JWT token
3. Frontend: Store token in localStorage, set Authorization header
4. Requests now include: `Authorization: Bearer <token>`

### Video Streaming Flow
1. Frontend: Request `GET /videos/stream/:id`
2. Backend: Check authentication
3. Backend: Get telegram_message_id from DB
4. Backend: Download from Telegram via gramjs
5. Frontend HTML5 video: Supports Range requests for seeking

### Admin Video Update Flow
1. Frontend: `PUT /admin/video/:id` with new metadata
2. Backend: Verify admin role
3. Backend: Update video in SQLite
4. Frontend: Reload video grid

## Telegram Integration Details

### Session Management
- First run: `npm run init-telegram`
- User provides phone number, enters code from Telegram app
- Session string stored in `.env` as `TELEGRAM_SESSION`
- Subsequent runs: Auto-login using stored session

### Message Listener
- gramjs subscribes to `NewMessage` events on configured channel
- When video posted: Extracts `telegram_message_id` and basic metadata
- Creates "draft" video entry in database
- Admin fills in title, description, category via dashboard

### Streaming
- `/stream/:id` endpoint receives Range headers from HTML5 player
- gramjs `client.downloadFile()` called with byte offset/limit
- Direct pipe to HTTP response = efficient buffering & seeking

## Adding New Features

### Add a Video Field
1. Update `videos` table schema in `database/index.js`
2. Add field to Video interface in `frontend/services/video.service.ts`
3. Add form input to `admin-dashboard.component.ts`
4. Update admin route handler in `backend/routes/admin.routes.js`

### Add Admin Route
1. Create function in `backend/routes/admin.routes.js`
2. Add middleware: `adminAuth` for role checking
3. Create service method in `frontend/services/admin.service.ts`
4. Call from component

### Add Frontend Page
1. Create component in `frontend/src/app/pages/`
2. Add route to `app.routes.ts`
3. Add navigation in `navbar.component.ts`
4. Implement page template and logic

## Environment Variables

### Backend `.env`
```
PORT=3000
DB_PATH=./database.sqlite
JWT_SECRET=change-in-production
TELEGRAM_API_ID=from_my.telegram.org
TELEGRAM_API_HASH=from_my.telegram.org
TELEGRAM_CHANNEL=-1001234567890
TELEGRAM_SESSION=<filled_by_init_telegram.js>
FRONTEND_URL=http://localhost:4200
```

## Common Tasks

### Debug Backend Errors
```bash
cd backend
NODE_OPTIONS='--trace-warnings' npm run dev
```

### Check Database
```bash
# SQLite CLI
sqlite3 backend/database.sqlite
> .schema
> SELECT * FROM videos;
```

### Regenerate Session
```bash
cd backend
rm .env TELEGRAM_SESSION
npm run init-telegram
```

### Clear Backend
```bash
cd backend
rm -rf database.sqlite database.sqlite-*
npm run init-admin
```

## Performance Tips

- **Database**: Indexes on telegram_message_id and category (already added)
- **Frontend**: Lazy-load routes in future
- **Streaming**: Range requests = only download requested bytes
- **Auth**: JWT tokens expire in 7 days (configurable)

## Security Checklist

- [ ] Change JWT_SECRET in production
- [ ] Use HTTPS instead of HTTP
- [ ] Add rate limiting to auth endpoints
- [ ] Sanitize video descriptions (XSS prevention)
- [ ] Validate file sizes before download
- [ ] Restrict admin endpoints to specific IPs if needed
- [ ] Keep Telegram credentials private (.env in .gitignore)

## Testing Checklist

- [ ] Backend starts without errors
- [ ] Database initializes with schema
- [ ] Telegram login completes
- [ ] Admin user created
- [ ] Frontend builds without errors
- [ ] Login form works
- [ ] Video list loads
- [ ] Video details page works
- [ ] Admin dashboard accessible
- [ ] Video streaming with seek works
