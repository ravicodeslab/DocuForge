"""
DocuForge Backend — Entry Point
FastAPI application with CORS, routers, and startup/shutdown lifecycle.
"""
import logging
import asyncio
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from routes import conversion, pdf_tools, ai, pdf_modern, docx_tools, image_tools
from utils.file_handler import FileHandler
from utils.exceptions import register_exception_handlers
from config import settings

# ── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger("docuforge")


# ── Lifespan (startup / shutdown) ─────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure directories exist and start cleanup task
    FileHandler.ensure_dirs()
    logger.info("DocuForge started. Directories: uploads/ outputs/")

    cleanup_task = asyncio.create_task(_periodic_cleanup())

    yield  # app runs here

    # Shutdown: cancel cleanup
    cleanup_task.cancel()
    logger.info("DocuForge shutting down.")


async def _periodic_cleanup():
    """Delete temp files older than CLEANUP_INTERVAL_SECONDS."""
    while True:
        await asyncio.sleep(settings.CLEANUP_INTERVAL_SECONDS)
        FileHandler.cleanup_old_files()
        logger.info("Cleaned old temp files.")


# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="DocuForge API",
    description="File conversion, PDF utilities, and AI summarization.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register custom exception handlers
register_exception_handlers(app)

# Mount routers
app.include_router(conversion.router, prefix="/api/convert", tags=["Conversion"])
# app.include_router(pdf_tools.router, prefix="/api/pdf", tags=["Legacy PDF Tools"])
app.include_router(pdf_modern.router, prefix="/api/pdf", tags=["PDF Tools"])
app.include_router(docx_tools.router, prefix="/api/docx", tags=["Word Tools"])
app.include_router(image_tools.router, prefix="/api/image", tags=["Image Tools"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI"])


@app.get("/api/health", tags=["Health"])
async def health_check():
    return {"status": "ok", "app": "DocuForge", "version": "1.0.0"}


# ── Serve static outputs (so frontend can download files) ─────────────────────
outputs_dir = Path(settings.OUTPUT_DIR)
outputs_dir.mkdir(parents=True, exist_ok=True)
app.mount("/outputs", StaticFiles(directory=str(outputs_dir)), name="outputs")
