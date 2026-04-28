# Full-Stack Video Streaming Platform

This document outlines the implementation plan for building a full-stack video streaming platform. The platform will feature a modern, Netflix-style Angular frontend, a Node.js/Express backend, an SQLite database, and rely on Telegram's private channels for video storage using the **MTProto client (`gramjs`)**.

## User Review Required

> [!WARNING]
> **Telegram Session String**: To authenticate `gramjs`, we need a valid session string. The first time the backend runs, it may need an interactive prompt to enter your phone number and the code sent to your Telegram app. Once authenticated, we'll save the session string to your `.env` as `TELEGRAM_SESSION` so the backend can log in automatically. Please confirm that you are prepared to perform this initial login process in the terminal.

> [!IMPORTANT]
> **API ID and Hash**: You will need to obtain your `TELEGRAM_API_ID` and `TELEGRAM_API_HASH` from [https://my.telegram.org](https://my.telegram.org) to use MTProto via `gramjs`.

## Proposed Architecture

### Backend (Node.js + Express)
The backend will serve as a REST API, run the Telegram MTProto client, and stream videos directly to the client.

- **Dependencies**: `express`, `cors`, `better-sqlite3`, `bcrypt`, `jsonwebtoken`, `dotenv`, `gramjs`, `input` (for interactive login).
- **Database**: SQLite stored locally at `backend/database.sqlite` (or `DB_PATH`).
- **Telegram Client Strategy**: The Node app will initialize a `gramjs` Telegram client. It will listen for `NewMessage` events on the configured `TELEGRAM_CHANNEL`. When a video is posted, it extracts the `telegram_message_id` and file metadata, storing a draft representation in the database.
- **Streaming Strategy**: A dedicated `/stream/:videoId` endpoint will handle HTTP Range requests from the frontend, securely downloading the appropriate chunk from Telegram via `gramjs` using `client.downloadFile` with `offset` and `limit`, and piping it to the Express response. This allows seeking and buffering in the HTML5 player and completely bypasses the 20MB limit.

### Frontend (Angular 17+)
A luxurious, dark-mode Netflix-style frontend.

- **Dependencies**: `@angular/core`, `tailwindcss`, `@angular/router`.
- **Styling**: Tailwind CSS configured for a modern dark theme with red/brand accents, responsive grid layouts for video cards, and hover micro-animations.
- **Video Player**: HTML5 `<video>` tag integrated in the `video-player` component, with the `src` attribute pointed to the backend API `/stream/:videoId`.

## Database Schema (SQLite)

**Users Table**
- `id` (PK, INTEGER)
- `email` (TEXT, UNIQUE)
- `password_hash` (TEXT)
- `role` (TEXT) - 'user' or 'admin'
- `created_at` (DATETIME)

**Videos Table**
- `id` (PK, INTEGER)
- `title` (TEXT)
- `description` (TEXT)
- `telegram_message_id` (INTEGER) - Updated to store the message ID for MTProto retrieval
- `thumbnail` (TEXT)
- `category` (TEXT)
- `duration` (INTEGER)
- `uploaded_at` (DATETIME)

## Proposed Changes

### Backend Structure

#### [NEW] `backend/.env`
Environment variables: 
`PORT`, `DB_PATH`, `JWT_SECRET`, `TELEGRAM_API_ID`, `TELEGRAM_API_HASH`, `TELEGRAM_SESSION`, `TELEGRAM_CHANNEL`.

#### [NEW] `backend/server.js`
Main Express application, router setup, error handling, CORS, JSON parsing. Initializing the Telegram client.

#### [NEW] `backend/database/index.js`
SQLite connection using `better-sqlite3` and automatic table initialization.

#### [NEW] `backend/telegram/client.js`
Initialize the `gramjs` Telegram client. Listen for channel messages to auto-save draft videos via their `telegram_message_id`. Contains helper functions for streaming files directly to the Express response.

#### [NEW] `backend/routes/*`
- `auth.routes.js`: `/auth/register`, `/auth/login`
- `video.routes.js`: `/videos`, `/videos/:id`, `/stream/:id` (Stream the video with Range support), `/categories`
- `admin.routes.js`: `/admin/video` (POST to edit metadata, DELETE)

#### [NEW] `backend/controllers/*`
Logic for each specific route, interacting with the SQLite database and Telegram stream APIs.

### Frontend Structure

#### [NEW] `frontend/src/styles.css` (Tailwind styles)
Base Tailwind imports and custom Netflix-inspired design tokens.

#### [NEW] `frontend/src/app/components/*`
- `navbar.component`: Top navigation, transparent to solid on scroll.
- `video-card.component`: Individual video thumbnail, title, and metadata.
- `video-player.component`: Accessible HTML5 video wrapper for the `player` page hitting the backend stream route.
- `category-list.component`: Horizontal scrolling list of video rows.
- `login-form.component`: Centered glassmorphism login form.

#### [NEW] `frontend/src/app/pages/*`
- `home.component`: Displays trending videos and categories.
- `player.component`: Dynamic route showing the video player and details.
- `login.component`: Login container.
- `admin-dashboard.component`: Table/form to manage database metadata for the videos (filling in metadata for the drafted `telegram_message_id`s).

## Open Questions

1. **Telegram Login Workflow**: Do you already have a `TELEGRAM_SESSION` string generated, or should we include a quick initialization script `npm run init-telegram` to log you into `gramjs` and generate the session string to put into your `.env`?
2. **First Admin User**: Should we include a script to automatically create an initial admin user the first time the server runs, so you can access the admin dashboard right away?

## Verification Plan

### Automated Tests
- Run `npm run build` on both frontend and backend to verify they compile.
- Confirm SQLite database creates and maintains the state locally.

### Manual Verification
1. Run the `init-telegram` script effectively allowing you to bypass 2FA/login and generate a valid `.env` session string.
2. Simulate an upload to the specified private Telegram Channel, verify the backend MTProto client catches the `telegram_message_id` and adds it to the database as a draft video.
3. Use the admin dashboard to update the video title/description.
4. Log in as a User, view the homepage, select a video.
5. In the browser network tab, verify that HTML5 Video correctly requests `/stream/:videoId` with `Range` headers, and the backend responds with `206 Partial Content`, ensuring rapid seeking and loading. Smooth playback indicates success.
