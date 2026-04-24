@echo off
echo =======================================================
echo Setting up DocuForge (Windows)
echo =======================================================

echo.
echo [1/3] Setting up Backend Virtual Environment...
cd backend
python -m venv venv
call venv\Scripts\activate.bat
echo Installing Python dependencies...
pip install -r requirements.txt

echo.
echo [2/3] Setting up Frontend Dependencies...
cd ..\frontend
call npm install

echo.
echo [3/3] Setup Complete!
echo.
echo To run the application, open two terminals:
echo Terminal 1 (Backend):  cd backend ^& venv\Scripts\activate ^& uvicorn main:app --reload
echo Terminal 2 (Frontend): cd frontend ^& npm run dev
echo.
pause
