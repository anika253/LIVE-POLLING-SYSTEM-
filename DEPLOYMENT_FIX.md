# 🚨 Critical Fix for Deployment

## Problem Found

The `useSocket.ts` file was using the wrong environment variable:
- ❌ **Wrong**: `process.env.FRONTEND_URL` 
- ✅ **Correct**: `process.env.REACT_APP_SOCKET_URL`

This was preventing Socket.io from connecting!

## ✅ Fixed

I've updated the code. Now you need to:

### 1. Push the Fix to GitHub

```bash
git add .
git commit -m "Fix socket URL environment variable"
git push
```

### 2. Update Vercel Environment Variables

1. Go to: https://vercel.com/dashboard
2. Click your project: `live-polling-system`
3. Go to **Settings** → **Environment Variables**
4. **Make sure you have these EXACT variables:**

```
REACT_APP_SOCKET_URL=https://live-polling-system-9tny.onrender.com
REACT_APP_API_URL=https://live-polling-system-9tny.onrender.com
```

**Important:**
- Variable name must be `REACT_APP_SOCKET_URL` (not `FRONTEND_URL`)
- Value should be your backend URL
- Set for Production, Preview, and Development

### 3. Verify Render Environment Variables

1. Go to: https://dashboard.render.com
2. Click your service: `live-polling-system`
3. Go to **Environment** tab
4. **Make sure you have:**

```
MONGODB_URI=your_mongodb_connection_string
FRONTEND_URL=https://live-polling-system-gilt-five.vercel.app
NODE_ENV=production
```

**Important:**
- `FRONTEND_URL` should NOT have trailing slash
- This is for CORS configuration

### 4. Wait for Redeployment

- **Vercel**: Will auto-redeploy after you push (1-2 min)
- **Render**: Should already be running, but verify it's up

### 5. Test

1. **Backend Health Check:**
   ```
   https://live-polling-system-9tny.onrender.com/health
   ```
   Should return: `{"status":"ok","message":"Server is running"}`

2. **Frontend:**
   ```
   https://live-polling-system-gilt-five.vercel.app/
   ```
   - Open browser console (F12)
   - Should see: "Socket connected"
   - No CORS errors

3. **Full Test:**
   - Open frontend in two tabs
   - One as teacher, create poll
   - One as student, vote
   - Verify real-time updates work

## 🔍 Debugging

### Check Browser Console

Open: https://live-polling-system-gilt-five.vercel.app/
Press F12 → Console tab

**Good signs:**
- ✅ "Socket connected"
- ✅ No red errors

**Bad signs:**
- ❌ "Socket connection error"
- ❌ CORS errors
- ❌ "Failed to fetch"

### Check Network Tab

1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Filter by "WS" (WebSocket)
4. Should see connection to: `live-polling-system-9tny.onrender.com`

### Common Issues

**Issue**: "Socket connection error"
- **Fix**: Check `REACT_APP_SOCKET_URL` is set correctly in Vercel
- **Fix**: Verify backend is running (check /health endpoint)

**Issue**: CORS error
- **Fix**: Check `FRONTEND_URL` in Render matches your Vercel URL exactly
- **Fix**: No trailing slash in `FRONTEND_URL`

**Issue**: "Cannot connect to server"
- **Fix**: Backend might be sleeping (Render free tier)
- **Fix**: Visit backend URL first to wake it up
- **Fix**: Check Render logs for errors

## ✅ Checklist

- [ ] Code fix pushed to GitHub
- [ ] Vercel environment variables updated (`REACT_APP_SOCKET_URL`)
- [ ] Render environment variables updated (`FRONTEND_URL`)
- [ ] Vercel redeployed (automatic after push)
- [ ] Backend health check works
- [ ] Frontend loads without errors
- [ ] Socket connects (check console)
- [ ] Full flow tested

## 🎯 Your Correct Configuration

**Vercel (Frontend) Environment Variables:**
```
REACT_APP_SOCKET_URL=https://live-polling-system-9tny.onrender.com
REACT_APP_API_URL=https://live-polling-system-9tny.onrender.com
```

**Render (Backend) Environment Variables:**
```
MONGODB_URI=mongodb+srv://...
FRONTEND_URL=https://live-polling-system-gilt-five.vercel.app
NODE_ENV=production
```

After fixing and redeploying, your app should work! 🚀

