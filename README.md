# 🌱 HydroGrow - Smart Hydroponic System
HydroGuardian: An AI-driven automated hydroponic fodder system for Sri Lanka. 

Featuring **ESP32 IoT integration**, **Real-time sensor monitoring**, **Actuator control**, **Multi-modal Disease Detection (CNN+LSTM)**, **Seed Quality Identification**, and **RL-based Energy Optimization**.

**Current Status:** ✅ Full-stack operational with ESP32 device management, WebSocket communication, and comprehensive mobile interface.

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

## 🔌 API Endpoints

### Authentication
- `POST /api/login` - User login
- `POST /api/register` - User registration
- `GET /api/me` - Get current user profile

### Sensors
- `GET /api/sensors` - Get all sensor readings
- `GET /api/sensors/{device_id}` - Get specific sensor data
- `GET /api/sensors/latest` - Get latest readings from all sensors

### Actuators
- `POST /api/actuators/control` - Control actuator (pump, light, fan)
- `GET /api/actuators/status` - Get all actuator states
- `POST /api/actuators/{id}/toggle` - Toggle actuator on/off

### ESP32 Gateway
- `WS /ws/gateway` - WebSocket for real-time device communication
- `GET /api/devices` - List all connected ESP32 devices
- `POST /api/devices/discover` - Trigger device discovery
- `GET /api/devices/{id}/status` - Get device health status

### Plants & Management
- `GET /api/items` - Get all plants
- `GET /api/plants/{id}` - Get plant details
- `POST /api/plants` - Add new plant

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
- ✅ 15+ screens including setup flow, monitoring, and control
- ✅ Complete onboarding & authentication system
- ✅ Real-time sensor monitoring dashboard
- ✅ ESP32 device control interface
- ✅ Energy consumption tracking
- ✅ Setup wizard (shelves, sensors, seed identification)
- ✅ Actuator control panel
- ✅ Plant management and details
- ✅ CO2 and environmental monitoring
- ✅ Notifications system
- ✅ 8 reusable UI components
- ✅ Tab navigation (Home, Plants, Sensors, Energy, Settings)
- ✅ WebSocket integration for real-time updates
- ✅ API + WebSocket communication

### Backend
- ✅ FastAPI REST API on port 8000
- ✅ User authentication with JWT tokens
- ✅ Password hashing with SHA256 (hashlib)
- ✅ Protected endpoints requiring authentication
- ✅ CORS enabled for cross-origin requests
- ✅ Interactive API documentation with Swagger UI
- ✅ WebSocket gateway for real-time communication
- ✅ ESP32 device management and discovery
- ✅ Actuator control APIs (pumps, lights, fans)
- ✅ Sensor data collection and processing
- ✅ ESP32-CAM image capture and streaming
- ✅ Device state management and monitoring
- ✅ Real-time sensor data broadcasting
- ✅ Postman collection for API testing

---

## 🔐 Test Credentials
```
Email: farmer@example.com
Password: password123
```

### IoT & Hardware Integration
- ✅ ESP32 microcontroller support
- ✅ ESP32-CAM for plant monitoring
- ✅ Real-time sensor data (temperature, humidity, pH, EC, TDS)
- ✅ Actuator control (water pumps, grow lights, ventilation)
- ✅ WebSocket-based device communication
- ✅ Automatic device discovery on network
- ✅ Device status monitoring and health checks
- ✅ Multi-device management support

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
- WebSockets (Real-time communication)
- Pydantic 2.12.5 (Data Validation)
- PyJWT 2.10.1 (JWT Authentication)
- Python 3.13
- Requests (HTTP client for ESP32 communication)

---

