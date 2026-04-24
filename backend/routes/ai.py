"""
AI summarization routes.
"""
from typing import Optional
from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from fastapi.responses import JSONResponse

from services.ai_service import AIService
from utils.file_handler import FileHandler

router = APIRouter()
ALLOWED_PDF = ["pdf"]


@router.post("/summarize")
async def summarize(
    file: Optional[UploadFile] = File(None),
    text: Optional[str] = Form(None),
    sentences: int = Form(8)
):
    """
    Summarize either an uploaded PDF file or raw text using local LSA model.
    """
    if not file and not text:
        raise HTTPException(
            status_code=400, 
            detail="Must provide either a 'file' (PDF) or 'text' form field."
        )

    try:
        if file:
            pdf_path = await FileHandler.save_upload(file, ALLOWED_PDF)
            try:
                result = AIService.summarize_pdf(pdf_path, sentence_count=sentences)
                return JSONResponse(result)
            finally:
                FileHandler.safe_delete(pdf_path)
        else:
            result = AIService.summarize_text(text, sentence_count=sentences)
            return JSONResponse(result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
