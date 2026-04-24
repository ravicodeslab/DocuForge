"""
PDF Tools API Routes — merge, split, compress, convert
"""
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pathlib import Path
import logging

from services.pdf_service import PDFService
from services.conversion_service import ConversionService
from utils.file_handler import FileHandler
from config import settings

logger = logging.getLogger(__name__)
router = APIRouter()

pdf_service = PDFService()
conversion_service = ConversionService()
file_handler = FileHandler()


@router.post("/merge")
async def merge_pdfs(files: list[UploadFile] = File(...)):
    """Merge multiple PDFs into one."""
    try:
        if len(files) < 2:
            raise HTTPException(status_code=400, detail="At least 2 PDFs required")

        temp_files = await file_handler.save_multiple_uploads(files, ["pdf"])
        output_file = pdf_service.merge(temp_files)

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
        logger.error(f"Error merging PDFs: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error merging PDFs: {str(e)}")


@router.post("/compress")
async def compress_pdf(
    file: UploadFile = File(...),
    level: str = Form("medium"),
    target_size: str = Form(None)
):
    """Compress PDF with quality control."""
    try:
        temp_path = await file_handler.save_upload(file, ["pdf"])

        # Map level to target_kb for the service
        target_kb = None
        if target_size:
            try:
                target_kb = int(float(target_size))  # Expected directly in KB
            except ValueError:
                pass

        output_file, stats = pdf_service.compress(temp_path, target_kb=target_kb)

        original_size = temp_path.stat().st_size
        compressed_size = Path(output_file).stat().st_size

        FileHandler.safe_delete(temp_path)

        return {
            "status": "success",
            "filename": Path(output_file).name,
            "original_size": original_size,
            "compressed_size": compressed_size,
            "stats": stats,
            "download_url": f"/outputs/{Path(output_file).name}"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error compressing PDF: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error compressing PDF: {str(e)}")


@router.post("/to-docx")
async def pdf_to_docx(file: UploadFile = File(...)):
    """Convert PDF to DOCX."""
    try:
        temp_path = await file_handler.save_upload(file, ["pdf"])
        output_file = conversion_service.pdf_to_docx(temp_path)
        FileHandler.safe_delete(temp_path)

        return {
            "status": "success",
            "filename": Path(output_file).name,
            "download_url": f"/outputs/{Path(output_file).name}"
        }

    except Exception as e:
        logger.error(f"Error converting PDF to DOCX: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error converting PDF to DOCX: {str(e)}")


@router.post("/to-image")
async def pdf_to_image(file: UploadFile = File(...)):
    """Convert PDF to images (returns info about generated files)."""
    try:
        temp_path = await file_handler.save_upload(file, ["pdf"])
        image_paths = conversion_service.pdf_to_images(temp_path)
        FileHandler.safe_delete(temp_path)

        # Return first image or zip info
        if len(image_paths) == 1:
            return {
                "status": "success",
                "filename": Path(image_paths[0]).name,
                "download_url": f"/outputs/{Path(image_paths[0]).name}"
            }

        # Return list of all generated images
        return {
            "status": "success",
            "filename": Path(image_paths[0]).name,
            "download_url": f"/outputs/{Path(image_paths[0]).name}",
            "files": [
                {
                    "filename": Path(p).name,
                    "download_url": f"/outputs/{Path(p).name}"
                } for p in image_paths
            ]
        }

    except Exception as e:
        logger.error(f"Error converting PDF to images: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error converting PDF to images: {str(e)}")


@router.post("/split")
async def split_pdf(
    file: UploadFile = File(...),
    start_page: int = Form(1),
    end_page: int = Form(None)
):
    """Split PDF by page range."""
    try:
        temp_path = await file_handler.save_upload(file, ["pdf"])

        # Build a single range
        import fitz
        doc = fitz.open(str(temp_path))
        total_pages = doc.page_count
        doc.close()

        end = end_page if end_page else total_pages
        ranges = [(start_page, end)]

        output_files = pdf_service.split(temp_path, ranges)
        FileHandler.safe_delete(temp_path)

        if len(output_files) == 1:
            return {
                "status": "success",
                "filename": Path(output_files[0]).name,
                "download_url": f"/outputs/{Path(output_files[0]).name}"
            }

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
        logger.error(f"Error splitting PDF: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error splitting PDF: {str(e)}")


@router.get("/health")
async def pdf_health():
    return {"status": "ok", "service": "PDF Tools"}
