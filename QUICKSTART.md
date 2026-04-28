# Quick Start Guide

## ⚡ Get Running in 5 Minutes

### 1️⃣ Prerequisites
- Node.js 18+ installed
- Telegram account
- API credentials from [my.telegram.org](https://my.telegram.org)

### 2️⃣ Clone/Extract and Setup
```bash
# Windows
setup.bat

# macOS/Linux
chmod +x setup.sh
./setup.sh
```

### 3️⃣ Configure Backend
Edit `backend/.env`:
```
TELEGRAM_API_ID=123456789
TELEGRAM_API_HASH=abcdefg1234567890
TELEGRAM_CHANNEL=-1001234567890  # Your private channel ID
```

### 4️⃣ Authenticate with Telegram
```bash
cd backend
npm run init-telegram
# Follow on-screen prompts
```

### 5️⃣ Create Admin User
```bash
npm run init-admin
# Default: admin@localhost / admin123
```

### 6️⃣ Start Backend
```bash
npm start
# Should print: ✓ Server running on http://localhost:3000
```

### 7️⃣ Start Frontend (new terminal)
```bash
cd frontend
npm start
# Should print: ✓ Server running on http://localhost:4200
```

### 8️⃣ Open Browser
Visit: **http://localhost:4200**

### 9️⃣ Login
- Email: `admin@localhost`
- Password: `admin123`

### 🔟 Test Video Streaming
1. Go to Admin Dashboard (top right, admin link)
2. Create or edit a video entry
3. Post a video to your Telegram channel
4. Video should appear in system
5. Click video on home page to stream

## 🎯 What to Do Next

### Test Everything Works
- [ ] Backend starts without errors
- [ ] Frontend loads at localhost:4200
- [ ] Can login with admin credentials
- [ ] Can access admin dashboard
- [ ] Can post video to Telegram channel
- [ ] Video appears in video list
- [ ] Can click and stream video

### Understand the Flow
```
User Browser
    ↓ (HTTP)
Frontend (Angular @ :4200)
    ↓ (HTTP/JWT)
Backend (Express @ :3000)
    ↓ (MTProto)
Telegram Servers
    ↓ (Video File)
Backend ← Telegram
    ↓ (HTTP Stream)
Frontend ← Backend
    ↓ (HTML5 Video)
User Browser
```

### Add Real Videos
1. Create a private Telegram channel
2. Post video files to channel
3. Backend auto-discovers and adds to database
4. Use admin dashboard to add metadata
5. Videos show on home page

### Deploy to Production
See [README.md](README.md) for production considerations

## ⚠️ Troubleshooting

### "Cannot find module 'express'"
```bash
cd backend
npm install
```

### "Telegram client failed to initialize"
- Check TELEGRAM_API_ID is correct
- Check TELEGRAM_API_HASH is correct
- Try: `npm run init-telegram` again

### "Cannot GET /videos"
- Backend not running? Start with `npm start`
- Check backend is on port 3000
- Check browser console for CORS errors

### "Port 3000/4200 already in use"
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :3000
kill -9 <PID>
```

### Videos not showing after posting to Telegram
- Check backend logs for errors
- Verify TELEGRAM_CHANNEL ID is correct
- Post video to correct channel
- Wait a few seconds for backend to detect
- Refresh browser

### Admin dashboard changes not saving
- Check browser console for errors
- Verify you're logged in as admin
- Check backend logs for HTTP 403 (permission denied)

## 📚 Documentation

- **Quick Setup**: This file (you are here)
- **Full Setup**: [README.md](README.md)
- **Development**: [DEVELOPMENT.md](DEVELOPMENT.md)
- **Architecture**: [implementation_plan.md](implementation_plan.md)

## 🆘 Get Help

1. Check logs: `backend/` or browser console
2. Read error messages carefully
3. Review [DEVELOPMENT.md](DEVELOPMENT.md) for detailed API info
4. Reset everything: Delete `database.sqlite` and `.env`, start over

## ✅ Success Indicators

- Backend terminal shows: `✓ Server running on http://localhost:3000`
- Frontend terminal shows: `✓ Compiled successfully`
- Browser shows Netflix-style dark theme
- Can log in successfully
- Videos display after adding to Telegram

You're ready to stream! 🎬
