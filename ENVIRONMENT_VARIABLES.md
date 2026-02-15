# 🔧 Environment Variables - Complete Guide

This file documents all environment variables needed for LUMIN deployment.

---

## 📋 BACKEND (.env)

### Required Variables

```env
# ═══════════════════════════════════════════════════════════
# 🗄️ DATABASE
# ═══════════════════════════════════════════════════════════
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lumin?retryWrites=true&w=majority

# ═══════════════════════════════════════════════════════════
# 🔐 AUTHENTICATION
# ═══════════════════════════════════════════════════════════
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_REFRESH_SECRET=your-super-secret-refresh-key-minimum-32-characters-long

# ═══════════════════════════════════════════════════════════
# 🌐 CORS & FRONTEND
# ═══════════════════════════════════════════════════════════
# IMPORTANT: Set this to your Vercel URL for password reset emails to work!
CORS_ORIGIN=https://your-app.vercel.app
FRONTEND_URL=https://your-app.vercel.app  # Optional - CORS_ORIGIN will be used as fallback

# Alternative for multiple origins (comma-separated)
# ALLOWED_ORIGINS=https://your-app.vercel.app,https://custom-domain.com

# ═══════════════════════════════════════════════════════════
# 📧 EMAIL SERVICE (Gmail example)
# ═══════════════════════════════════════════════════════════
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password  # Use App Password, not regular password!

# ═══════════════════════════════════════════════════════════
# 🤖 AI FEATURES (Optional)
# ═══════════════════════════════════════════════════════════
GEMINI_API_KEY=your-gemini-api-key-here  # Get from https://makersuite.google.com/app/apikey

# ═══════════════════════════════════════════════════════════
# 🚀 DEPLOYMENT
# ═══════════════════════════════════════════════════════════
NODE_ENV=production  # or 'development'
PORT=5000  # Render uses this automatically
```

---

## 📱 FRONTEND (.env or Vercel Environment Variables)

```env
# ═══════════════════════════════════════════════════════════
# 🔌 API URL
# ═══════════════════════════════════════════════════════════
VITE_API_BASE_URL=https://your-backend.onrender.com/api
```

---

## 🎯 Render Configuration

### Step-by-Step Setup:

1. Go to https://dashboard.render.com
2. Click on your `lumin-backend` service
3. Go to **"Environment"** tab
4. Add these variables:

| Key                  | Value                         | Description              |
| -------------------- | ----------------------------- | ------------------------ |
| `NODE_ENV`           | `production`                  | Required                 |
| `PORT`               | `5000`                        | Auto-set by Render       |
| `MONGODB_URI`        | `mongodb+srv://...`           | Your MongoDB connection  |
| `JWT_SECRET`         | `random-32-char-string`       | Generate secure key      |
| `JWT_REFRESH_SECRET` | `random-32-char-string`       | Generate secure key      |
| `CORS_ORIGIN`        | `https://your-app.vercel.app` | **⚠️ YOUR VERCEL URL**   |
| `EMAIL_USER`         | `your@gmail.com`              | Gmail account            |
| `EMAIL_PASS`         | `app-password`                | Gmail app password       |
| `GEMINI_API_KEY`     | `api-key`                     | Optional for AI features |

5. Click **"Save Changes"** (will auto-redeploy)

---

## 🔑 How to Get Gmail App Password

1. Go to https://myaccount.google.com/security
2. Enable **2-Step Verification** (required)
3. Go to https://myaccount.google.com/apppasswords
4. Select **"Mail"** and **"Other (Custom name)"**
5. Enter "LUMIN Backend"
6. Copy the 16-character password
7. Use this in `EMAIL_PASS`

---

## 🔒 How to Generate Secure Secrets

```bash
# On Linux/Mac:
openssl rand -base64 32

# On Windows (PowerShell):
[Convert]::ToBase64String((1..32|%{Get-Random -Maximum 256}))

# Or use online generator:
# https://randomkeygen.com/ (use "CodeIgniter Encryption Keys")
```

---

## ✅ Vercel Configuration

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add:

| Key                 | Value                                    |
| ------------------- | ---------------------------------------- |
| `VITE_API_BASE_URL` | `https://lumin-backend.onrender.com/api` |

5. **Redeploy** from Deployments tab

---

## 🐛 Troubleshooting

### Password Reset Emails Going to Localhost

**Problem:** Reset links show `http://localhost:5173/reset-password/...`

**Solution:**

```bash
# On Render, make sure CORS_ORIGIN is set:
CORS_ORIGIN=https://your-app.vercel.app
```

### CORS Errors

**Problem:** Frontend can't connect to backend

**Solutions:**

1. Check `CORS_ORIGIN` matches your Vercel URL **exactly**
2. No trailing slash: `https://app.vercel.app` ✅ not `https://app.vercel.app/` ❌
3. For custom domain, add it to `ALLOWED_ORIGINS`

### Email Not Sending

**Problem:** Password reset emails fail

**Solutions:**

1. Use **App Password**, not regular Gmail password
2. Enable 2-Step Verification in Google Account
3. Check `EMAIL_USER` and `EMAIL_PASS` are correct
4. Check Render logs for email errors

---

## 📝 Example .env.example

Create this file in `/backend` for reference:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lumin

# Auth
JWT_SECRET=replace-with-32-char-secret
JWT_REFRESH_SECRET=replace-with-different-32-char-secret

# CORS (⚠️ IMPORTANT FOR PASSWORD RESET!)
CORS_ORIGIN=https://your-vercel-app.vercel.app

# Email
EMAIL_USER=youremail@gmail.com
EMAIL_PASS=your-16-char-app-password

# AI (Optional)
GEMINI_API_KEY=your-api-key

# Environment
NODE_ENV=production
PORT=5000
```

---

## 🔄 After Updating Environment Variables

1. **Render**: Auto-redeploys when you save changes
2. **Vercel**: Redeploy from Deployments tab
3. Wait 2-3 minutes for changes to take effect
4. Test the feature (e.g., password reset)

---

**✅ You're all set!**
