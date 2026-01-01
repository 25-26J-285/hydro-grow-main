# hydro-guardian-main
HydroGuardian: An AI-driven automated hydroponic fodder system for Sri Lanka. Featuring ESP32 firmware, Multi-modal Disease Detection (CNN+LSTM), Seed ID, and RL-based Energy Optimization

---

## 📚 Documentation Overview

This project includes comprehensive documentation covering setup, testing, and quick reference commands. Below are summaries of the available guides:

### 🚀 [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
A quick reference card with essential commands and URLs:
- **Start Both Servers** - PowerShell commands for backend and frontend
- **URLs to Access** - Direct links to API docs, Swagger UI, and health check
- **Test Credentials** - Pre-filled login credentials (farmer@example.com / password123)
- **API Quick Commands** - Ready-to-use curl commands for health check, login, and registration
- **Quick Fixes** - Troubleshooting for port conflicts and dependency reinstallation

### ✅ [RUNNING_STATUS.md](./RUNNING_STATUS.md)
Current system status and quick testing guide:
- **System Status** - Both Frontend and Backend operational status (🟢 RUNNING)
- **Service URLs** - Backend API, Frontend preview, and API documentation endpoints
- **Test Options** - Web preview, API docs, and terminal testing methods
- **System Components** - Overview of frontend screens (Onboarding, Login) and backend endpoints
- **Test Credentials** - Default user for testing the application

### 📖 [SETUP_GUIDE.md](./SETUP_GUIDE.md)
Complete setup and testing guide for the entire system:
- **Quick Start** - Fast backend and frontend server startup
- **Complete Setup Instructions** - Step-by-step backend (Python/FastAPI) and frontend (Node.js/React Native) setup
- **Testing the Application** - Four comprehensive test methods including web preview, API health check, login testing, and interactive API documentation
- **Project Structure** - Complete file organization for frontend and backend
- **API Endpoints** - Full list of available endpoints with parameters and responses
- **Security Notes** - Important security considerations for production deployment

---

## 🎯 Quick Links

| Resource | Purpose | Link |
|----------|---------|------|
| API Documentation | Interactive API testing | http://localhost:8000/docs |
| Swagger UI | Alternative API interface | http://localhost:8000/redoc |
| Health Check | Verify backend status | http://localhost:8000/healthz |
| Quick Reference | Fast command lookup | [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) |
| Running Status | Current system status | [RUNNING_STATUS.md](./RUNNING_STATUS.md) |
| Setup Guide | Detailed setup steps | [SETUP_GUIDE.md](./SETUP_GUIDE.md) |

---

## ✨ System Features

### Frontend
- ✅ Expo React Native app with file-based routing
- ✅ Onboarding screen with custom plant logo
- ✅ Login screen with email/password form
- ✅ Real API integration (connected to FastAPI backend)
- ✅ Pre-filled test credentials for quick testing
- ✅ Loading states and error notifications
- ✅ Tab navigation and dashboard screens

### Backend
- ✅ FastAPI REST API on port 8000
- ✅ User authentication with JWT tokens
- ✅ Password hashing with SHA256 (hashlib)
- ✅ Protected endpoints requiring authentication
- ✅ CORS enabled for cross-origin requests
- ✅ Interactive API documentation with Swagger UI
- ✅ In-memory database (ready for PostgreSQL upgrade)

---

## 🔐 Test Credentials
```
Email: farmer@example.com
Password: password123
```

---

## 📦 Tech Stack

**Frontend:**
- React Native 18.2.0
- Expo 50.0.0
- Node.js v25.2.1
- npm v11.6.2

**Backend:**
- FastAPI 0.128.0
- Uvicorn 0.40.0 (ASGI Server)
- Pydantic 2.12.5 (Data Validation)
- PyJWT 2.10.1 (JWT Authentication)
- Python 3.13

---

