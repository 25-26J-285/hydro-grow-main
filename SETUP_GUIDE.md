# Hydro Grow - Smart Hydroponic System
## Complete Frontend + Backend Setup & Testing Guide

A full-stack React Native + FastAPI application for monitoring and controlling hydroponic farms.

---

## 🚀 Quick Start (Both Servers Running)

### Terminal 1: Start Backend FastAPI Server
```powershell
cd backend
.\.venv\Scripts\uvicorn.exe app.main:app --host 127.0.0.1 --port 8000
```

✅ Backend running at: `http://localhost:8000`

### Terminal 2: Start Frontend HTTP Server  
```powershell
cd frontend
$env:Path += ";C:\Program Files\nodejs"
npx.cmd http-server -p 8080 --cors
```

✅ Frontend running at: `http://localhost:8080/preview.html`  
✅ API Docs at: `http://localhost:8000/docs`

---

## 📋 Complete Setup Instructions

### Step 1: Backend Setup (FastAPI + Python)

```powershell
# Navigate to backend folder
cd backend

# Create virtual environment (one-time)
python -m venv .venv

# Activate it (each session)
.\.venv\Scripts\python.exe -m pip install --upgrade pip

# Install all dependencies
.\.venv\Scripts\python.exe -m pip install fastapi uvicorn pydantic python-jose python-multipart PyJWT cryptography passlib

# Start the server
.\.venv\Scripts\uvicorn.exe app.main:app --host 127.0.0.1 --port 8000
```

**Expected output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete
```

### Step 2: Frontend Setup (React Native + Web Preview)

```powershell
# Navigate to frontend folder
cd frontend

# Add Node.js to PATH
$env:Path += ";C:\Program Files\nodejs"

# Install JavaScript dependencies (one-time)
npm.cmd install

# Start web preview server
npx.cmd http-server -p 8080 --cors
```

**Expected output:**
```
http-server: Starting up http-server, serving from ./
http-server: http://127.0.0.1:8080
```

---

## 🧪 Testing the Application

### Test 1: Web Preview (Recommended)

1. **Open in browser:** `http://localhost:8080/preview.html`
2. **You should see:**
   - Onboarding screen with plant logo
   - "Skip" button in top right
   - "Get Started" button at bottom
3. **Click "Skip" or "Get Started"**
4. **Navigate to Login screen**
5. **Login credentials are pre-filled:**
   - Email: `farmer@example.com`
   - Password: `password123`
6. **Click "Sign In"**
7. **Expected result:** Success alert with "Welcome Demo Farmer!"

### Test 2: API Health Check

```powershell
curl.exe -s http://localhost:8000/healthz
```

**Expected response:**
```json
{"status":"ok","service":"Hydro Grow API"}
```

### Test 3: Login via API

```powershell
curl.exe -X POST http://localhost:8000/api/login `
  -H "Content-Type: application/json" `
  -d '{"email":"farmer@example.com","password":"password123"}'
```

**Expected response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "email": "farmer@example.com",
    "fullname": "Demo Farmer"
  }
}
```

### Test 4: Interactive API Documentation

Visit: **http://localhost:8000/docs**

You can test all endpoints directly from the browser with an interactive Swagger UI!

---

## 📁 What's Created

### Frontend Structure
```
frontend/
├── App.js                      # Entry point (switches screens)
├── package.json                # Dependencies (Expo, React Native)
├── preview.html                # 🌐 Web preview (test in browser)
├── src/
│   ├── screens/
│   │   ├── OnboardingScreen.js # Welcome screen with logo
│   │   └── LoginScreen.js      # 🔐 Login form (CONNECTED TO API)
│   └── assets/
│       └── plant-logo.png      # Your plant logo
└── node_modules/               # (auto-installed)
```

### Backend Structure
```
backend/
├── app/
│   ├── main.py                 # 🔑 FastAPI app with all endpoints
│   ├── __init__.py
│   └── api/
│       └── __init__.py
├── requirements.txt            # Python dependencies
├── .venv/                      # Python virtual env (auto-created)
└── .gitignore                  # Git ignores
```

---

## 🔌 API Endpoints Available

| Endpoint | Method | Purpose | Needs Token? |
|----------|--------|---------|------|
| `/healthz` | GET | Check if server is running | ❌ |
| `/api/register` | POST | Create new user account | ❌ |
| `/api/login` | POST | Login & get JWT token | ❌ |
| `/api/me` | GET | Get current user info | ✅ |
| `/api/items` | GET | List hydroponic items | ✅ |
| `/api/token` | POST | Alternative login endpoint | ❌ |

### API Request/Response Examples

**Register New User:**
```bash
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newfarmer@example.com",
    "password": "newpass123",
    "fullname": "New Farmer"
  }'
```

**Get Current User (requires token):**
```bash
curl -X GET http://localhost:8000/api/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Get Items (requires token):**
```bash
curl -X GET http://localhost:8000/api/items \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 🔐 Default Test Account

- **Email:** `farmer@example.com`
- **Password:** `password123`
- **Name:** Demo Farmer

**Register a new account using the API or add to `backend/app/main.py`**

---

## ✨ Key Features Implemented

### Frontend ✅
- ✅ Onboarding screen with plant logo (70×70px in circle)
- ✅ Login screen with form validation
- ✅ Real API integration with backend
- ✅ Error handling & loading states
- ✅ Success notifications
- ✅ Pre-filled test credentials
- ✅ Mobile-responsive design
- ✅ Web preview for testing

### Backend ✅
- ✅ User authentication (login/register)
- ✅ JWT token generation & validation
- ✅ Password hashing (SHA256)
- ✅ Protected API endpoints
- ✅ CORS enabled for frontend
- ✅ Interactive API documentation (`/docs`)
- ✅ Health check endpoint
- ✅ Error handling & validation

---

## 🛠️ Technology Stack

**Frontend:**
- React Native 18.2.0
- Expo 50.0.0
- Node.js & npm

**Backend:**
- FastAPI 0.104.1
- Uvicorn (ASGI server)
- Python 3.13
- JWT authentication
- Pydantic validation

---

## ⚠️ Production Notes

### Security Checklist
- ⚠️ **Change SECRET_KEY** in `backend/app/main.py` (line 7)
- ⚠️ **Use bcrypt** instead of SHA256 for passwords
- ⚠️ **Restrict CORS** to your frontend domain only
- ⚠️ **Use environment variables** for sensitive data

### Database
- Currently uses **in-memory storage** (resets on restart)
- **Upgrade to PostgreSQL** for production

### Example `.env` file:
```env
SECRET_KEY=your-production-secret-key-change-this
DATABASE_URL=postgresql://user:password@localhost/dbname
CORS_ORIGINS=https://yourdomain.com
```

---

## 🆘 Troubleshooting

### Port 8000 is already in use
```powershell
# Find what's using port 8000
netstat -ano | findstr :8000

# Kill the process (replace PID with actual number)
taskkill /PID 12345 /F

# Or use a different port
.\.venv\Scripts\uvicorn.exe app.main:app --host 127.0.0.1 --port 8001
```

### ModuleNotFoundError in backend
```powershell
# Make sure you're in backend directory
cd backend

# Reinstall dependencies
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

### Login button not working
1. Check backend is running: `curl http://localhost:8000/healthz`
2. Check browser console (F12) for errors
3. Verify credentials: `farmer@example.com` / `password123`
4. Check CORS is enabled (should see no CORS errors)

### npm not found
```powershell
# Add Node.js to PATH
$env:Path += ";C:\Program Files\nodejs"

# Verify
npm -v

# Then run http-server
npx.cmd http-server -p 8080 --cors
```

---

## 🎯 Next Steps (Optional Enhancements)

- [ ] Add password reset functionality
- [ ] Implement user profile editing
- [ ] Add plant monitoring dashboard
- [ ] Integrate real sensor data
- [ ] Deploy to production (Heroku/AWS/DigitalOcean)
- [ ] Add mobile app build (Expo to iOS/Android)
- [ ] Database integration (PostgreSQL)
- [ ] Advanced authentication (OAuth2)

---

## 📚 Resources

- **FastAPI:** https://fastapi.tiangolo.com
- **React Native:** https://reactnative.dev
- **Expo:** https://docs.expo.dev
- **JWT:** https://jwt.io
- **Uvicorn:** https://www.uvicorn.org

---

## ✅ System is Complete!

Both frontend and backend are fully functional, tested, and ready to use!

**Backend:** `http://localhost:8000` ✅  
**Frontend:** `http://localhost:8080/preview.html` ✅  
**API Docs:** `http://localhost:8000/docs` ✅

**Happy farming! 🌱**
