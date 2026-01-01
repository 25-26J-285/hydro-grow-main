# FastAPI Backend - Setup Instructions

## Quick Start

### Windows PowerShell

1. **Activate virtual environment:**
   ```powershell
   & ".\.venv\Scripts\Activate.ps1"
   ```

2. **Install dependencies:**
   ```powershell
   python -m pip install -r requirements.txt
   ```
   *Note: Dependencies are already installed. This is optional.*

3. **Run the server:**
   ```powershell
   & ".\.venv\Scripts\python.exe" -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

### macOS/Linux

1. **Activate virtual environment:**
   ```bash
   source .venv/bin/activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the server:**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

4. **Access the API:**
   - API Docs: http://localhost:8000/docs
   - Health: GET http://localhost:8000/healthz
   - Swagger UI: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

## Default Test Credentials

Email: `farmer@example.com`  
Password: `password123`

## API Endpoints

### Authentication
- **POST /api/register** - Register a new user
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "fullname": "John Farmer"
  }
  ```

- **POST /api/login** - Login and get JWT token
  ```json
  {
    "email": "farmer@example.com",
    "password": "password123"
  }
  ```

### Protected Routes
- **GET /api/me** - Get current user profile (requires token)
- **GET /api/items** - List hydroponic items (requires token)

## Database

Currently uses in-memory storage. For production:
- Replace with PostgreSQL or MySQL
- Use SQLAlchemy ORM
- Implement proper database models

## Security Notes

⚠️ **Important:** Change `SECRET_KEY` in `app/main.py` before deploying to production!

```python
SECRET_KEY = "your-production-secret-key-here"
```
