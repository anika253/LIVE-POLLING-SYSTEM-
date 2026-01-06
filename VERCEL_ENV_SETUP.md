# 🚨 CRITICAL: Fix Vercel Environment Variables

## The Problem

Your frontend is trying to connect to `localhost:5000` instead of your production backend. This means the environment variable `REACT_APP_SOCKET_URL` is **NOT SET** in Vercel.

## ✅ Fix This Now

### Step 1: Go to Vercel Dashboard

1. Open: https://vercel.com/dashboard
2. Click on your project: **`live-polling-system`**

### Step 2: Add Environment Variables

1. Click **"Settings"** (top menu)
2. Click **"Environment Variables"** (left sidebar)
3. Click **"Add New"** button

### Step 3: Add These TWO Variables

**Variable 1:**
- **Key**: `REACT_APP_SOCKET_URL`
- **Value**: `https://live-polling-system-9tny.onrender.com`
- **Environment**: Select ALL (Production, Preview, Development)
- Click **"Save"**

**Variable 2:**
- **Key**: `REACT_APP_API_URL`
- **Value**: `https://live-polling-system-9tny.onrender.com`
- **Environment**: Select ALL (Production, Preview, Development)
- Click **"Save"**

### Step 4: Redeploy

**IMPORTANT**: After adding environment variables, you MUST redeploy!

1. Go to **"Deployments"** tab
2. Find the latest deployment
3. Click the **"..."** (three dots) menu
4. Click **"Redeploy"**
5. Wait 1-2 minutes for deployment to complete

### Step 5: Verify

1. After redeployment completes, visit: https://live-polling-system-gilt-five.vercel.app/
2. Open browser console (F12)
3. You should see:
   - ✅ `Socket URL: https://live-polling-system-9tny.onrender.com`
   - ✅ `Socket connected`
   - ❌ NO more `localhost:5000` errors

## 🔍 How to Check if Variables Are Set

1. In Vercel dashboard → Settings → Environment Variables
2. You should see:
   ```
   REACT_APP_SOCKET_URL = https://live-polling-system-9tny.onrender.com
   REACT_APP_API_URL = https://live-polling-system-9tny.onrender.com
   ```

## ⚠️ Common Mistakes

1. **Wrong variable name**: Must be `REACT_APP_SOCKET_URL` (not `SOCKET_URL` or `FRONTEND_URL`)
2. **Not selecting all environments**: Make sure to select Production, Preview, AND Development
3. **Forgetting to redeploy**: Environment variables only work after redeployment
4. **Trailing slash**: Don't add `/` at the end of the URL

## 📋 Quick Checklist

- [ ] Went to Vercel dashboard
- [ ] Added `REACT_APP_SOCKET_URL` = `https://live-polling-system-9tny.onrender.com`
- [ ] Added `REACT_APP_API_URL` = `https://live-polling-system-9tny.onrender.com`
- [ ] Selected ALL environments (Production, Preview, Development)
- [ ] Saved both variables
- [ ] Redeployed the application
- [ ] Waited for deployment to complete
- [ ] Tested and saw correct URL in console

## 🎯 Expected Result

After fixing, your browser console should show:
```
Socket URL: https://live-polling-system-9tny.onrender.com
REACT_APP_SOCKET_URL env var: https://live-polling-system-9tny.onrender.com
Connecting to socket at: https://live-polling-system-9tny.onrender.com
Socket connected
```

**NOT:**
```
Socket URL: http://localhost:5000
REACT_APP_SOCKET_URL env var: undefined
```

Do this now and your app will work! 🚀

