# Quick Start Guide

## ⚡ 5-Minute Setup

### Prerequisites
Download and install **Node.js 16+** from https://nodejs.org/

### Backend Setup
```bash
cd backend
npm install
npm run dev
```
✅ Backend runs on `http://localhost:5000`

### Frontend Setup (New Terminal)
```bash
cd frontend
npm install
npm start
```
✅ Frontend opens at `http://localhost:3000`

## 🔑 API Keys Required

Add these to `backend/.env` after copying from `.env.example`:

1. **GitHub Token**
   - Go to: https://github.com/settings/tokens
   - Create new token with `public_repo` scope

2. **Spotify**
   - Go to: https://developer.spotify.com/dashboard
   - Create an app to get Client ID & Secret

3. **Google (Gmail & Calendar)**
   - Go to: https://console.developers.google.com
   - Create OAuth 2.0 credentials

## 📝 Configuration

### Frontend `.env`
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_GITHUB_USERNAME=your_github_username
```

### Backend `.env`
```
MONGODB_URI=mongodb://localhost:27017/dashboard
GITHUB_TOKEN=your_github_token
SPOTIFY_CLIENT_ID=your_spotify_id
SPOTIFY_CLIENT_SECRET=your_spotify_secret
GOOGLE_CLIENT_ID=your_google_id
GOOGLE_CLIENT_SECRET=your_google_secret
JWT_SECRET=your_secret_key
```

## 🎯 Features

✅ **Task Management** - Create, update, track tasks  
✅ **GitHub Integration** - View stats and repos  
✅ **Spotify** - Display top tracks  
✅ **Email & Calendar** - Show upcoming events  
✅ **Real-time Updates** - Auto-refresh data  

## 📚 Documentation

- [Full README](../README.md)
- [Backend Docs](../backend/README.md)
- [Frontend Docs](../frontend/README.md)

## 🚀 VS Code Task Shortcuts

Press `Ctrl+Shift+P` and search for:
- `Tasks: Run Task` → Select server to start
- `Install Backend Dependencies`
- `Install Frontend Dependencies`

## 🛠️ Troubleshooting

**Port Already in Use?**
```bash
# Backend (change port in backend/.env)
# Frontend (change port in frontend/.env)
```

**Database Connection Issues?**
- Ensure MongoDB is running locally
- Or update `MONGODB_URI` in `.env`

**Module Not Found?**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## 📞 Support

See [README.md](../README.md) for full documentation
