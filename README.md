# Video Streaming Platform - Full Implementation

A Netflix-style video streaming platform using Angular frontend, Node.js/Express backend, SQLite database, and Telegram's MTProto for video storage.

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Telegram API credentials from [my.telegram.org](https://my.telegram.org)

### 1. Setup Backend

```bash
cd backend
cp .env.example .env
npm install
```

**Configure `.env`:**
```
PORT=3000
DB_PATH=./database.sqlite
JWT_SECRET=your-super-secret-key
TELEGRAM_API_ID=your_id_from_telegram_org
TELEGRAM_API_HASH=your_hash_from_telegram_org
TELEGRAM_CHANNEL=-1001234567890  # Your private Telegram channel ID
TELEGRAM_SESSION=  # Will be filled after init
FRONTEND_URL=http://localhost:4200
```

**Initialize Telegram session (first time only):**
```bash
npm run init-telegram
# Follow prompts to log in to your Telegram account
```

**Create admin user:**
```bash
npm run init-admin
# Default: admin@localhost / admin123 (change after login!)
```

**Start backend:**
```bash
npm start          # Production
npm run dev        # Development with watch
```

The backend will run on `http://localhost:3000`

### 2. Setup Frontend

```bash
cd frontend
npm install
npm start
```

The frontend will run on `http://localhost:4200`

## Project Structure

### Backend
```
backend/
├── server.js              # Express app entry point
├── database/
│   └── index.js          # SQLite initialization & schema
├── telegram/
│   └── client.js         # Telegram MTProto client
├── routes/
│   ├── auth.routes.js    # /auth/register, /auth/login
│   ├── video.routes.js   # /videos, /stream/:id
│   └── admin.routes.js   # /admin/* routes
├── scripts/
│   ├── init-telegram.js  # Generate session string
│   └── init-admin.js     # Create first admin user
└── .env.example          # Environment template
```

### Frontend
```
frontend/
├── src/
│   ├── app/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page-level components
│   │   ├── services/     # API & business logic
│   │   ├── guards/       # Route guards
│   │   └── interceptors/ # HTTP interceptors
│   ├── styles.css        # Global + Tailwind
│   └── main.ts          # Bootstrap entry
├── angular.json
├── tailwind.config.js
└── package.json
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login (returns JWT token)

### Videos (Public)
- `GET /videos` - Get all videos
- `GET /videos/:id` - Get video details
- `GET /videos/stream/:id` - Stream video (supports Range requests)
- `GET /videos/categories/list` - Get all categories
- `GET /videos/category/:category` - Get videos by category

### Admin (Auth Required + Admin Role)
- `GET /admin/videos` - Get all videos
- `PUT /admin/video/:id` - Update video metadata
- `DELETE /admin/video/:id` - Delete video
- `GET /admin/users` - Get all users
- `DELETE /admin/user/:id` - Delete user

## Database Schema

### Users Table
```sql
id (PK), email (UNIQUE), password_hash, role, created_at
```

### Videos Table
```sql
id (PK), title, description, telegram_message_id (UNIQUE),
thumbnail, category, duration, uploaded_at
```

## Features

✅ User authentication with JWT
✅ Admin dashboard for content management
✅ Video streaming with Range request support (seek/buffer)
✅ Telegram MTProto integration for video storage
✅ Responsive Netflix-style UI
✅ Category filtering
✅ SQLite persistent storage
✅ Automatic video discovery from Telegram channel

## Telegram Integration

The backend automatically listens to your Telegram channel for new videos:

1. **First Time Setup**: Run `npm run init-telegram` to authenticate
2. **Auto-Discovery**: When videos are posted to your configured channel, the backend automatically creates draft entries
3. **Metadata Management**: Use the admin dashboard to add titles, descriptions, and categories
4. **Streaming**: Videos are streamed directly from Telegram using MTProto

## Testing

### Verify Backend
```bash
curl http://localhost:3000/health
```

### Create Test Video
1. Post a video to your Telegram channel
2. Backend should auto-detect and add to database
3. Use admin panel to add metadata

### Test Playback
1. Log in with admin credentials
2. Add a video via admin dashboard
3. Go to home page and click a video
4. Verify streaming works with seek support

## Troubleshooting

**Telegram not connecting?**
- Check TELEGRAM_API_ID and TELEGRAM_API_HASH are correct
- Run `npm run init-telegram` again
- Verify channel ID is correct

**Videos not showing?**
- Check database has videos: `backend/database.sqlite`
- Verify Telegram session is valid
- Check backend logs for errors

**CORS errors?**
- Ensure FRONTEND_URL in backend .env is correct
- Frontend and backend ports should match config

## Security Notes

⚠️ **Development Only**: Change JWT_SECRET in production
⚠️ Keep Telegram session string private (added to .gitignore)
⚠️ Use strong admin password (default one is for demo only)
⚠️ Implement proper rate limiting in production
⚠️ Use HTTPS in production

## License

ISC
