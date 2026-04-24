"""
Custom exception classes and FastAPI exception handler registration.
"""
import logging
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

logger = logging.getLogger("docuforge.exceptions")


# ── Custom Exceptions ─────────────────────────────────────────────────────────

class DocuForgeError(Exception):
    """Base exception for all DocuForge errors."""
    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


class FileTooLargeError(DocuForgeError):
    def __init__(self, max_mb: int):
        super().__init__(f"File exceeds the {max_mb}MB size limit.", status_code=413)


class UnsupportedFileTypeError(DocuForgeError):
    def __init__(self, allowed: list[str]):
        super().__init__(
            f"Unsupported file type. Allowed: {', '.join(allowed)}", status_code=415
        )


class ConversionError(DocuForgeError):
    def __init__(self, detail: str):
        super().__init__(f"Conversion failed: {detail}", status_code=422)


class PDFProcessingError(DocuForgeError):
    def __init__(self, detail: str):
        super().__init__(f"PDF processing error: {detail}", status_code=422)


class AIProcessingError(DocuForgeError):
    def __init__(self, detail: str):
        super().__init__(f"AI processing error: {detail}", status_code=500)


# ── Handler Registration ──────────────────────────────────────────────────────

def register_exception_handlers(app: FastAPI):
    @app.exception_handler(DocuForgeError)
    async def docuforge_handler(request: Request, exc: DocuForgeError):
        logger.error("DocuForgeError [%s]: %s", exc.status_code, exc.message)
        return JSONResponse(
            status_code=exc.status_code,
            content={"error": exc.message},
        )

    @app.exception_handler(Exception)
    async def generic_handler(request: Request, exc: Exception):
        logger.exception("Unhandled exception: %s", exc)
        return JSONResponse(
            status_code=500,
            content={"error": "An unexpected server error occurred."},
        )
