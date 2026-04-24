"""
PDF manipulation tools API.
"""
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse, JSONResponse

from services.pdf_service import PDFService
from utils.file_handler import FileHandler

router = APIRouter()

ALLOWED_PDF = ["pdf"]


@router.post("/merge")
async def merge_pdfs(files: list[UploadFile] = File(...)):
    """Merge multiple PDFs top-to-bottom."""
    if len(files) < 2:
        raise HTTPException(status_code=400, detail="At least 2 files required to merge.")
    
    paths = await FileHandler.save_multiple_uploads(files, ALLOWED_PDF)
    try:
        out = PDFService.merge(paths)
        return FileResponse(path=str(out), filename="merged.pdf", media_type="application/pdf")
    finally:
        for p in paths:
            FileHandler.safe_delete(p)


@router.post("/split")
async def split_pdf(
    file: UploadFile = File(...),
    ranges: str = Form(...)  # expected format: "1-3,5-7"
):
    """Split a PDF into chunks based on page ranges."""
    # Parse ranges string e.g. "1-3,5-7" into [(1,3), (5,7)]
    parsed_ranges = []
    try:
        for part in ranges.split(","):
            s, e = part.strip().split("-")
            parsed_ranges.append((int(s), int(e)))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ranges format. Use 'start-end,start-end'")

    pdf_path = await FileHandler.save_upload(file, ALLOWED_PDF)
    try:
        outs = PDFService.split(pdf_path, parsed_ranges)
        
        if len(outs) == 1:
            return FileResponse(path=str(outs[0]), filename="split.pdf", media_type="application/pdf")
        
        # Multiple chunks -> ZIP them
        import zipfile
        zip_path = FileHandler.output_path(".zip")
        with zipfile.ZipFile(str(zip_path), "w", zipfile.ZIP_DEFLATED) as zf:
            for i, chunk_p in enumerate(outs, start=1):
                zf.write(str(chunk_p), arcname=f"part_{i}.pdf")
                
        for chunk_p in outs:
            FileHandler.safe_delete(chunk_p)
            
        return FileResponse(path=str(zip_path), filename="split_pdfs.zip", media_type="application/zip")
    finally:
        FileHandler.safe_delete(pdf_path)


@router.post("/rotate")
async def rotate_pdf(
    file: UploadFile = File(...),
    degrees: int = Form(...),
    pages: Optional[str] = Form(None) # Optional string e.g. "1,3,5" or None for all
):
    """Rotate entire PDF or selected pages by specific degrees (90, 180, 270)."""
    parsed_pages = None
    if pages:
        try:
            parsed_pages = [int(p.strip()) for p in pages.split(",")]
        except Exception:
            raise HTTPException(status_code=400, detail="Pages must be comma-separated integers.")
            
    pdf_path = await FileHandler.save_upload(file, ALLOWED_PDF)
    try:
        out = PDFService.rotate(pdf_path, degrees, parsed_pages)
        return FileResponse(path=str(out), filename="rotated.pdf", media_type="application/pdf")
    finally:
        FileHandler.safe_delete(pdf_path)


@router.post("/compress")
async def compress_pdf(
    file: UploadFile = File(...),
    target_kb: Optional[int] = Form(None)
):
    """Compress a PDF (downsample images). Can aim for target KB approximation."""
    pdf_path = await FileHandler.save_upload(file, ALLOWED_PDF)
    try:
        out, stats = PDFService.compress(pdf_path, target_kb)
        
        # Return both the file and stats in a custom multipart/mixed or use JSON header?
        # A simpler approach: header with base64 encoded stats or download link + JSON.
        # Let's serve via standard JSON with download link mapped to static serving:
        import urllib.parse
        download_url = f"/outputs/{out.name}"
        return JSONResponse({
            "stats": stats,
            "download_url": download_url
        })
    finally:
        FileHandler.safe_delete(pdf_path)
