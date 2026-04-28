# Fix Plan - Video Streaming Platform

## Critical Fixes Applied

### 1. Fix `frontend/angular.json` - Missing required `$schema` and `version`
**Status:** ✅ FIXED
**File:** `frontend/angular.json`
**Issue:** Angular CLI requires `"version": 1` and `"$schema"` at top level.
**Fix:** Added `"$schema": "./node_modules/@angular/cli/lib/config/schema.json"` and `"version": 1`.

### 2. Fix `frontend/src/app/guards/auth.guard.ts` - Duplicate/broken exports
**Status:** ✅ FIXED
**File:** `frontend/src/app/guards/auth.guard.ts`
**Issue:** Two `authGuard` exports clashed. First referenced undefined `injector` variable.
**Fix:** Completely rewrote to a single clean `authGuard` using `inject()`.

### 3. Register AuthInterceptor in `frontend/src/main.ts`
**Status:** ✅ FIXED
**File:** `frontend/src/main.ts`
**Issue:** `AuthInterceptor` class existed but was never registered.
**Fix:** Converted to functional `authInterceptorFn` and registered via `provideHttpClient(withInterceptors([authInterceptorFn]))`.

### 4. Add Google Fonts link to `frontend/src/index.html`
**Status:** ✅ FIXED
**File:** `frontend/src/index.html`
**Issue:** Uses 'Outfit' font in Tailwind config but font was never loaded.
**Fix:** Added Google Fonts `<link>` for Outfit font family.

### 5. Fix `video-card.component.ts` - missing CommonModule import
**Status:** ✅ FIXED
**File:** `frontend/src/app/components/video-card/video-card.component.ts`
**Issue:** Used `*ngIf` but didn't import `CommonModule`, causing NG8103 warning.
**Fix:** Added `CommonModule` to `imports` array.

### 6. Verify both frontend and backend run
**Status:** ✅ VERIFIED
- Backend: `http://localhost:3000` - Running, health check responds `{"status":"ok"}`
- Frontend: `http://localhost:4200` - Running, `Compiled successfully` with 5 chunks

---

## Running Commands

```powershell
# Backend (Terminal 1)
cd "d:/tel player/backend"
node server.js

# Frontend (Terminal 2) 
cd "d:/tel player/frontend"
npm start
```

---

## Deep Knowledge: Raw Telegram Message Data Analysis

The user provided this forwarded photo message from a Telegram channel:

```json
{
    "update_id": 851578214,
    "message": {
        "message_id": 2,
        "from": { "id": 8372967748, "is_bot": false, "first_name": "Unknown", "username": "unknown136pg" },
        "chat": { "id": -1003897175553, "title": "Super profile", "type": "channel" },
        "date": 1777383233,
        "forward_origin": {
            "type": "channel",
            "chat": { "id": -1003897175553, "title": "Super profile", "type": "channel" },
            "message_id": 2,
            "date": 1777383212
        },
        "forward_from_chat": { "id": -1003897175553, "title": "Super profile", "type": "channel" },
        "forward_from_message_id": 2,
        "forward_date": 1777383212,
        "photo": [
            { "file_id": "AgACAgUAAxkBAAFISXtp8LdBYbE3OV8qI2La5Tz6B7yFJQACYBFrGzQciVdmaH7yc74C2gEAAwIAA3MAAzsE", "file_unique_id": "AQADYBFrGzQciVd4", "file_size": 1180, "width": 46, "height": 90 },
            { "file_id": "AgACAgUAAxkBAAFISXtp8LdBYbE3OV8qI2La5Tz6B7yFJQACYBFrGzQciVdmaH7yc74C2gEAAwIAA20AAzsE", "file_unique_id": "AQADYBFrGzQciVdy", "file_size": 15875, "width": 165, "height": 320 },
            { "file_id": "AgACAgUAAxkBAAFISXtp8LdBYbE3OV8qI2La5Tz6B7yFJQACYBFrGzQciVdmaH7yc74C2gEAAwIAA3gAAzsE", "file_unique_id": "AQADYBFrGzQciVd9", "file_size": 60760, "width": 413, "height": 800 },
            { "file_id": "AgACAgUAAxkBAAFISXtp8LdBYbE3OV8qI2La5Tz6B7yFJQACYBFrGzQciVdmaH7yc74C2gEAAwIAA3kAAzsE", "file_unique_id": "AQADYBFrGzQciVd-", "file_size": 92348, "width": 661, "height": 1280 }
        ]
    }
}
```

### Key Data Points:
1. **Message ID for storage:** `2` (stored in DB as `telegram_message_id`)
2. **Channel ID:** `-1003897175553` (the `TELEGRAM_CHANNEL` env var)
3. **Content type:** `photo` (array of 4 sizes - thumbnails for different resolutions)
4. **Forward info:** `forward_from_message_id: 2`, `forward_date: 1777383212`
5. **No video file** - this is a PHOTO message, not a VIDEO. The `photo` array contains JPEG thumbnails at 4 sizes (46x90, 165x320, 413x800, 661x1280).

> ⚠️ Current backend only handles VIDEO messages (checks for video file). Photo messages like this would NOT be auto-discovered as videos - they'd need separate handling for thumbnails or be ignored.

---

## Full Architecture & Implementation Summary

### Backend (Node.js/Express + SQLite)

| File | Purpose |
|------|---------|
| `server.js` | Express entry, CORS, route mounting, health check, graceful shutdown |
| `database/index.js` | `better-sqlite3` init, `users` + `videos` tables, WAL mode, indexes |
| `routes/auth.routes.js` | `POST /auth/register`, `POST /auth/login` - bcrypt + JWT |
| `routes/video.routes.js` | `GET /videos`, `/videos/:id`, `/videos/stream/:id` (with Range), `/categories/list`, `/category/:cat` |
| `routes/admin.routes.js` | CRUD videos/users with `adminMiddleware` JWT+role check |
| `telegram/client.js` | ⚠️ **MOCK** - Uses Telegraf, returns 1MB dummy buffer. Needs real gramjs for production |
| `scripts/init-telegram.js` | ⚠️ **MOCK** - Just echoes setup steps, doesn't create session |
| `scripts/init-admin.js` | ✅ Creates `admin@localhost` / `admin123` with bcrypt hash |

### Frontend (Angular 17+ Standalone)

| File | Purpose |
|------|---------|
| `main.ts` | Bootstraps `AppComponent` with `provideRouter`, `provideAnimations`, `provideHttpClient(withInterceptors([authInterceptorFn]))` |
| `app.component.ts` | Root with `<app-navbar>` + `<router-outlet>` |
| `app.routes.ts` | `/login`, `/` (home), `/watch/:id`, `/admin` with guards |
| `services/auth.service.ts` | Login/register, JWT storage, BehaviorSubject for user state |
| `services/video.service.ts` | Video API calls, stream URL generator |
| `services/admin.service.ts` | Admin CRUD endpoints |
| `guards/auth.guard.ts` | `CanActivateFn` checking `isAuthenticated()` |
| `guards/admin.guard.ts` | `CanActivateFn` checking `isAdmin()` |
| `interceptors/auth.interceptor.ts` | `HttpInterceptorFn` adding `Authorization: Bearer <token>` |
| `pages/home/home.component.ts` | Hero banner, category filter, video grid |
| `pages/player/player.component.ts` | Video player + details with duration/date formatting |
| `pages/login/login.component.ts` | Container for `login-form` |
| `pages/admin-dashboard/admin-dashboard.component.ts` | Video/user management tables |
| `components/navbar/navbar.component.ts` | Top nav with conditional admin link, logout |
| `components/video-card/video-card.component.ts` | Thumbnail card with hover play icon |
| `components/video-player/video-player.component.ts` | HTML5 `<video>` with controls |
| `components/category-list/category-list.component.ts` | Horizontal category buttons |
| `components/login-form/login-form.component.ts` | Glassmorphism login/register form |

### Data Flow

```
Browser (localhost:4200)
  ↓ HTTP
Angular Frontend
  ↓ HTTP + JWT Bearer token
Express Backend (localhost:3000)
  ↓ SQL
SQLite Database
  ↓ MTProto (mock)
Telegram Servers
```

### Auth Flow
1. User submits email/password → `POST /auth/login`
2. Backend validates with bcrypt → returns JWT (expires 7d)
3. Frontend stores token in `localStorage`
4. `AuthInterceptor` injects `Authorization: Bearer <token>` on every request
5. `authGuard` checks token exists for protected routes
6. `adminGuard` checks `role === 'admin'` for admin routes

### Streaming Flow
1. User clicks video → navigates to `/watch/:id`
2. `PlayerComponent` loads video details + generates stream URL
3. `<video>` tag requests `GET /videos/stream/:id`
4. Backend gets `telegram_message_id` from DB
5. Backend downloads chunk from Telegram with Range support
6. Returns `206 Partial Content` with video bytes

---

## Remaining Issues for Production

1. **`telegram/client.js`** - Replace Telegraf mock with real `gramjs` MTProto client
2. **`scripts/init-telegram.js`** - Implement actual interactive Telegram login session generation
3. **Video vs Photo handling** - The raw data is a PHOTO, backend only discovers VIDEO
4. **`video-player.component.ts`** - Stream URL doesn't append token to query string for auth
