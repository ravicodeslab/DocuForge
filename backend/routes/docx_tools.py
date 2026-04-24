"""
Word (DOCX) Tools API Routes — merge, split, compress, convert
"""
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pathlib import Path
import logging

from services.conversion_service import ConversionService
from utils.file_handler import FileHandler

logger = logging.getLogger(__name__)
router = APIRouter()

conversion_service = ConversionService()
file_handler = FileHandler()


@router.post("/merge")
async def merge_docx(files: list[UploadFile] = File(...)):
    """Merge multiple DOCX files into one."""
    try:
        if len(files) < 2:
            raise HTTPException(status_code=400, detail="At least 2 DOCX files required")

        temp_files = await file_handler.save_multiple_uploads(files, ["docx", "doc"])
        output_file = conversion_service.merge_docx_files(temp_files)

        for temp_file in temp_files:
            FileHandler.safe_delete(temp_file)

        return {
            "status": "success",
            "filename": Path(output_file).name,
            "download_url": f"/outputs/{Path(output_file).name}"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error merging DOCX files: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error merging DOCX files: {str(e)}")


@router.post("/compress")
async def compress_docx(
    file: UploadFile = File(...),
    level: str = Form("medium")
):
    """Compress DOCX file."""
    try:
        temp_path = await file_handler.save_upload(file, ["docx", "doc"])

        output_file = conversion_service.compress_docx(
            temp_path,
            compression_level=level
        )

        original_size = temp_path.stat().st_size
        compressed_size = Path(output_file).stat().st_size

        FileHandler.safe_delete(temp_path)

        return {
            "status": "success",
            "filename": Path(output_file).name,
            "original_size": original_size,
            "compressed_size": compressed_size,
            "download_url": f"/outputs/{Path(output_file).name}"
        }

    except Exception as e:
        logger.error(f"Error compressing DOCX: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error compressing DOCX: {str(e)}")


@router.post("/to-pdf")
async def docx_to_pdf(file: UploadFile = File(...)):
    """Convert DOCX to PDF."""
    try:
        temp_path = await file_handler.save_upload(file, ["docx", "doc"])
        output_file = conversion_service.docx_to_pdf(temp_path)
        FileHandler.safe_delete(temp_path)

        return {
            "status": "success",
            "filename": Path(output_file).name,
            "download_url": f"/outputs/{Path(output_file).name}"
        }

    except Exception as e:
        logger.error(f"Error converting DOCX to PDF: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error converting DOCX to PDF: {str(e)}")


@router.post("/to-txt")
async def docx_to_txt(file: UploadFile = File(...)):
    """Convert DOCX to TXT."""
    try:
        temp_path = await file_handler.save_upload(file, ["docx", "doc"])
        output_file = conversion_service.docx_to_txt(temp_path)
        FileHandler.safe_delete(temp_path)

        return {
            "status": "success",
            "filename": Path(output_file).name,
            "download_url": f"/outputs/{Path(output_file).name}"
        }

    except Exception as e:
        logger.error(f"Error converting DOCX to TXT: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error converting DOCX to TXT: {str(e)}")


@router.post("/split")
async def split_docx(
    file: UploadFile = File(...),
    sections: int = Form(2)
):
    """Split DOCX into sections."""
    try:
        temp_path = await file_handler.save_upload(file, ["docx", "doc"])
        output_files = conversion_service.split_docx(temp_path, sections)
        FileHandler.safe_delete(temp_path)

        return {
            "status": "success",
            "files": [
                {
                    "filename": Path(f).name,
                    "download_url": f"/outputs/{Path(f).name}"
                } for f in output_files
            ]
        }

    except Exception as e:
        logger.error(f"Error splitting DOCX: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error splitting DOCX: {str(e)}")


@router.get("/health")
async def docx_health():
    return {"status": "ok", "service": "Word Tools"}
