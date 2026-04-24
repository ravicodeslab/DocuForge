# DocuForge

DocuForge is a local-first, modular full-stack application for offline document conversions, PDF manipulations, and AI-powered summarization.

## Features

1. **Conversions**
   - PDF ⇄ DOCX
   - PDF ⇄ PPTX
   - PDF ⇄ XLSX
   - PDF ⇄ Photos (JPG/PNG)

2. **PDF Toolkit**
   - Merge multiple PDFs
   - Split pages
   - Rotate clockwise/counter-clockwise 
   - Compress with adaptive downscaling

3. **AI**
   - 100% offline text summarization
   - Extracts from PDF files or accepts text
   - Built with NLTK + Sumy (LSA)

## Architecture

- **Backend**: Python / FastAPI (located in `backend/`)
- **Frontend**: React + Vite (located in `frontend/`)
- **Design System**: Monochromatic custom CSS

## Running the Application

### 1. Setup

**For Windows:**
Double-click `setup.bat` or run it in your terminal. 
It creates a Python virtual environment, installs backend pip dependencies, and runs `npm install` for the Vite frontend.

**For Linux / macOS:**
Run `chmod +x setup.sh && ./setup.sh`.

### 2. Start Services

To launch the app, keep two terminal sessions open.

**Terminal 1: FastAPI Backend**
```bash
cd backend
# Windows: venv\Scripts\activate
# Unix: source venv/bin/activate
uvicorn main:app --reload
```
The backend API and Swagger UI will run at `http://localhost:8000/docs`

**Terminal 2: React Frontend**
```bash
cd frontend
npm run dev
```
The UI dashboard will run at `http://localhost:5173`

*(You can test the AI or convert anything directly through the UI — it works entirely offline).*
