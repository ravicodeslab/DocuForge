"""
Image Tools API Routes — convert, compress, resize
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

ALLOWED_IMAGE_TYPES = ["jpg", "jpeg", "png", "gif", "webp", "bmp"]


@router.post("/convert")
async def convert_image(
    file: UploadFile = File(...),
    format: str = Form("png")
):
    """Convert image to different format."""
    try:
        fmt = format.lower()
        if fmt not in ["jpg", "jpeg", "png", "webp", "gif"]:
            raise HTTPException(status_code=400, detail="Unsupported target format")

        temp_path = await file_handler.save_upload(file, ALLOWED_IMAGE_TYPES)
        output_file = conversion_service.convert_image(temp_path, fmt)
        FileHandler.safe_delete(temp_path)

        return {
            "status": "success",
            "filename": Path(output_file).name,
            "download_url": f"/outputs/{Path(output_file).name}"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error converting image: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error converting image: {str(e)}")


@router.post("/compress")
async def compress_image(
    file: UploadFile = File(...),
    quality: int = Form(80),
    target_size: str = Form(None)
):
    """Compress image with quality control."""
    try:
        if not (10 <= quality <= 100):
            raise HTTPException(status_code=400, detail="Quality must be between 10 and 100")

        temp_path = await file_handler.save_upload(file, ALLOWED_IMAGE_TYPES)

        output_file = conversion_service.compress_image(
            temp_path,
            quality=quality,
            target_size=target_size
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

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error compressing image: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error compressing image: {str(e)}")


@router.post("/resize")
async def resize_image(
    file: UploadFile = File(...),
    width: int = Form(...),
    height: int = Form(...)
):
    """Resize image to specific dimensions."""
    try:
        if width <= 0 or height <= 0:
            raise HTTPException(status_code=400, detail="Width and height must be positive")

        temp_path = await file_handler.save_upload(file, ALLOWED_IMAGE_TYPES)
        output_file = conversion_service.resize_image(temp_path, width, height)
        FileHandler.safe_delete(temp_path)

        return {
            "status": "success",
            "filename": Path(output_file).name,
            "dimensions": f"{width}x{height}",
            "download_url": f"/outputs/{Path(output_file).name}"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error resizing image: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error resizing image: {str(e)}")


@router.post("/to-pdf")
async def image_to_pdf(file: UploadFile = File(...)):
    """Convert image to PDF."""
    try:
        temp_path = await file_handler.save_upload(file, ALLOWED_IMAGE_TYPES)
        output_file = conversion_service.image_to_pdf(temp_path)
        FileHandler.safe_delete(temp_path)

        return {
            "status": "success",
            "filename": Path(output_file).name,
            "download_url": f"/outputs/{Path(output_file).name}"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error converting image to PDF: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error converting image to PDF: {str(e)}")


@router.get("/health")
async def image_health():
    return {"status": "ok", "service": "Image Tools"}
