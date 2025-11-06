# Deployment Guide - Cinelove Platform

## Backend Deployment (Render)

### Prerequisites
- MongoDB Atlas connection string
- TMDB API key
- GitHub repository

### Deploy Steps
1. Go to [Render.com](https://render.com)
2. New Web Service → Connect GitHub repository
3. Configure:
   - Root Directory: `backend-node`
   - Build Command: `npm install`
   - Start Command: `npm start`

### Environment Variables
```env
NODE_ENV=production
PORT=10000
MONGO_URL=your_mongodb_atlas_connection_string
DB_NAME=cinelove_db
TMDB_API_KEY=your_tmdb_api_key
CORS_ORIGINS=https://your-frontend-domain.vercel.app
```

## Frontend Deployment (Vercel)

### Deploy Steps
1. Go to [Vercel.com](https://vercel.com)
2. New Project → Import repository
3. Configure:
   - Framework: Vite
   - Root Directory: `Frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

### Environment Variables
```env
VITE_BACKEND_URL=https://your-backend-url.onrender.com
```

## Final Steps
1. Update `CORS_ORIGINS` in Render with your Vercel URL
2. Test endpoints: `/api/health`, `/api/movies/popular`
3. Verify frontend connects to backend

## URLs
- Backend: `https://your-service.onrender.com`
- Frontend: `https://your-project.vercel.app`
