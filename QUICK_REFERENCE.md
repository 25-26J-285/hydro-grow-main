# Quick Reference Card

## 🚀 Start Both Servers

### Terminal 1: Backend
```powershell
cd backend
.\.venv\Scripts\uvicorn.exe app.main:app --host 127.0.0.1 --port 8000
```

### Terminal 2: Frontend  
```powershell
cd frontend
$env:Path += ";C:\Program Files\nodejs"
npx.cmd http-server -p 8080 --cors
```

---

## 🌐 URLs to Open

| Service | URL |
|---------|-----|
| Web Preview | http://localhost:8080/preview.html |
| API Docs | http://localhost:8000/docs |
| Health Check | http://localhost:8000/healthz |

---

## 🔐 Test Credentials

```
Email: farmer@example.com
Password: password123
```

---

## 📋 API Quick Commands

**Health:**
```powershell
curl http://localhost:8000/healthz
```

**Login:**
```powershell
curl -X POST http://localhost:8000/api/login `
  -H "Content-Type: application/json" `
  -d '{"email":"farmer@example.com","password":"password123"}'
```

**Register:**
```powershell
curl -X POST http://localhost:8000/api/register `
  -H "Content-Type: application/json" `
  -d '{"email":"new@example.com","password":"pass123","fullname":"Name"}'
```

---

## ✅ Checklist

- [ ] Backend running on port 8000
- [ ] Frontend running on port 8080
- [ ] Can access http://localhost:8080/preview.html
- [ ] Can access http://localhost:8000/docs
- [ ] Login works with test credentials
- [ ] Success message appears after login

---

## 🆘 Quick Fixes

**Port in use:**
```powershell
netstat -ano | findstr :8000
taskkill /PID <number> /F
```

**Reinstall backend deps:**
```powershell
cd backend
.\.venv\Scripts\python.exe -m pip install fastapi uvicorn pydantic python-jose passlib PyJWT cryptography
```

**Reinstall frontend deps:**
```powershell
cd frontend
npm.cmd install
```

---

*See SETUP_GUIDE.md for complete instructions*
