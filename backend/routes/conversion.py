"""
Conversion routes — PDF ⇄ DOCX, PPTX, XLSX, Images; Images → PDF.
"""
import zipfile
from pathlib import Path

from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import FileResponse, JSONResponse

from services.conversion_service import ConversionService
from utils.file_handler import FileHandler

router = APIRouter()

ALLOWED_PDF = ["pdf"]
ALLOWED_IMG = ["jpg", "jpeg", "png"]


# ── PDF → Word ────────────────────────────────────────────────────────────────
@router.post("/pdf-to-word")
async def pdf_to_word(file: UploadFile = File(...)):
    """Convert a PDF to a Word document (DOCX)."""
    pdf_path = await FileHandler.save_upload(file, ALLOWED_PDF)
    try:
        out = ConversionService.pdf_to_docx(pdf_path)
        return FileResponse(
            path=str(out),
            filename="converted.docx",
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        )
    finally:
        FileHandler.safe_delete(pdf_path)


# ── PDF → Images ──────────────────────────────────────────────────────────────
@router.post("/pdf-to-image")
async def pdf_to_image(
    file: UploadFile = File(...),
    format: str = Form("jpg"),
    dpi: int = Form(150),
):
    """Convert PDF pages to images. Returns a ZIP if multiple pages."""
    pdf_path = await FileHandler.save_upload(file, ALLOWED_PDF)
    try:
        images = ConversionService.pdf_to_images(pdf_path, fmt=format, dpi=dpi)

        if len(images) == 1:
            ext = "jpg" if format.lower() in ("jpg", "jpeg") else "png"
            mime = "image/jpeg" if ext == "jpg" else "image/png"
            return FileResponse(path=str(images[0]), filename=f"page_1.{ext}", media_type=mime)

        # Multiple pages → ZIP
        zip_path = FileHandler.output_path(".zip")
        with zipfile.ZipFile(str(zip_path), "w", zipfile.ZIP_DEFLATED) as zf:
            for i, img_p in enumerate(images, start=1):
                ext = img_p.suffix.lstrip(".")
                zf.write(str(img_p), arcname=f"page_{i}.{ext}")

        for img_p in images:
            FileHandler.safe_delete(img_p)

        return FileResponse(path=str(zip_path), filename="pages.zip", media_type="application/zip")
    finally:
        FileHandler.safe_delete(pdf_path)


# ── Images → PDF ──────────────────────────────────────────────────────────────
@router.post("/image-to-pdf")
async def image_to_pdf(files: list[UploadFile] = File(...)):
    """Combine one or more images into a single PDF."""
    image_paths = await FileHandler.save_multiple_uploads(files, ALLOWED_IMG)
    try:
        out = ConversionService.images_to_pdf(image_paths)
        return FileResponse(path=str(out), filename="images.pdf", media_type="application/pdf")
    finally:
        for p in image_paths:
            FileHandler.safe_delete(p)


# ── PDF → PPTX ────────────────────────────────────────────────────────────────
@router.post("/pdf-to-pptx")
async def pdf_to_pptx(file: UploadFile = File(...)):
    """Convert PDF pages to a PowerPoint presentation."""
    pdf_path = await FileHandler.save_upload(file, ALLOWED_PDF)
    try:
        out = ConversionService.pdf_to_pptx(pdf_path)
        return FileResponse(
            path=str(out),
            filename="converted.pptx",
            media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
        )
    finally:
        FileHandler.safe_delete(pdf_path)


# ── PDF → Excel ───────────────────────────────────────────────────────────────
@router.post("/pdf-to-excel")
async def pdf_to_excel(file: UploadFile = File(...)):
    """Extract tabular data from PDF and write to Excel (XLSX)."""
    pdf_path = await FileHandler.save_upload(file, ALLOWED_PDF)
    try:
        out = ConversionService.pdf_to_excel(pdf_path)
        return FileResponse(
            path=str(out),
            filename="converted.xlsx",
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        )
    finally:
        FileHandler.safe_delete(pdf_path)
