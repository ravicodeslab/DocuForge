#!/bin/bash
echo "======================================================="
echo "Setting up DocuForge (Linux / macOS)"
echo "======================================================="

echo ""
echo "[1/3] Setting up Backend Virtual Environment..."
cd backend || exit
python3 -m venv venv
source venv/bin/activate
echo "Installing Python dependencies..."
pip install -r requirements.txt

echo ""
echo "[2/3] Setting up Frontend Dependencies..."
cd ../frontend || exit
npm install

echo ""
echo "[3/3] Setup Complete!"
echo ""
echo "To run the application, open two terminals:"
echo "Terminal 1 (Backend):  cd backend && source venv/bin/activate && uvicorn main:app --reload"
echo "Terminal 2 (Frontend): cd frontend && npm run dev"
echo ""
