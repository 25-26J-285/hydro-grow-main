# Quick Reference Card

## 🚀 Start Both Servers

### Terminal 1: Backend
```powershell
cd backend
& ".\.venv\Scripts\Activate.ps1"
& ".\.venv\Scripts\python.exe" -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Terminal 2: Frontend  
```powershell
cd frontend
npm start
# Press 'w' for web preview
```

---

## 🌐 URLs to Open

| Service | URL |
|---------|-----|
| API Documentation | http://localhost:8000/docs |
| API Health Check | http://localhost:8000/healthz |
| ReDoc | http://localhost:8000/redoc |

---

## 🔐 Test Credentials

```
Email: farmer@example.com
Password: password123
```

---

## 📋 API Quick Commands

**Health Check:**
```powershell
curl http://localhost:8000/healthz
```

**Login:**
```powershell
curl -X POST http://localhost:8000/api/login `
  -H "Content-Type: application/json" `
  -d '{"email":"farmer@example.com","password":"password123"}'
```

**Register New User:**
```powershell
curl -X POST http://localhost:8000/api/register `
  -H "Content-Type: application/json" `
  -d '{"email":"new@example.com","password":"pass123","fullname":"Name"}'
```

---

## ✅ Checklist

- [ ] Backend running on port 8000
- [ ] Frontend running (Expo app)
- [ ] Can access http://localhost:8000/docs
- [ ] Login works with test credentials
- [ ] Hydroponic items display after login

---

## 🆘 Quick Fixes

**Port 8000 in use (kill process):**
```powershell
netstat -ano | findstr :8000
taskkill /PID <number> /F
```

**Reinstall backend dependencies:**
```powershell
cd backend
& ".\.venv\Scripts\python.exe" -m pip install -r requirements.txt
```

**Reinstall frontend dependencies:**
```powershell
cd frontend
npm install
```

**Clear backend cache:**
```powershell
Remove-Item -Recurse app/__pycache__
```

---

*See SETUP_GUIDE.md and backend/README.md for complete instructions*
