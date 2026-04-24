"""
Secure file handling utilities: validation, temp storage, cleanup.
"""
import os
import time
import uuid
import shutil
import logging
from pathlib import Path
from fastapi import UploadFile

from config import settings
from utils.exceptions import FileTooLargeError, UnsupportedFileTypeError

logger = logging.getLogger("docuforge.file_handler")

MAX_BYTES = settings.MAX_FILE_SIZE_MB * 1024 * 1024


class FileHandler:
    """Manages upload/output directories and file lifecycle."""

    @classmethod
    def ensure_dirs(cls):
        Path(settings.UPLOAD_DIR).mkdir(parents=True, exist_ok=True)
        Path(settings.OUTPUT_DIR).mkdir(parents=True, exist_ok=True)

    @classmethod
    def unique_path(cls, base_dir: str, suffix: str) -> Path:
        """Return a unique file path inside base_dir with given suffix."""
        return Path(base_dir) / f"{uuid.uuid4().hex}{suffix}"

    @classmethod
    async def save_upload(
        cls,
        file: UploadFile,
        allowed_types: list[str],
    ) -> Path:
        """
        Validate and persist an uploaded file to UPLOAD_DIR.
        Returns the saved file path.
        """
        # Validate MIME type
        suffix = Path(file.filename or "").suffix.lower()
        if suffix.lstrip(".") not in allowed_types:
            raise UnsupportedFileTypeError(allowed_types)

        dest = cls.unique_path(settings.UPLOAD_DIR, suffix)

        # Stream to disk, check size while reading
        size = 0
        with dest.open("wb") as f:
            while chunk := await file.read(1024 * 256):  # 256 KB chunks
                size += len(chunk)
                if size > MAX_BYTES:
                    dest.unlink(missing_ok=True)
                    raise FileTooLargeError(settings.MAX_FILE_SIZE_MB)
                f.write(chunk)

        logger.info("Saved upload: %s (%d bytes)", dest.name, size)
        return dest

    @classmethod
    async def save_multiple_uploads(
        cls,
        files: list[UploadFile],
        allowed_types: list[str],
    ) -> list[Path]:
        paths = []
        for f in files:
            paths.append(await cls.save_upload(f, allowed_types))
        return paths

    @classmethod
    def output_path(cls, suffix: str) -> Path:
        """Return a unique path inside OUTPUT_DIR."""
        return cls.unique_path(settings.OUTPUT_DIR, suffix)

    @classmethod
    def cleanup_old_files(cls, max_age_seconds: int = 3600):
        """Delete output and upload files older than max_age_seconds."""
        now = time.time()
        for folder in [settings.UPLOAD_DIR, settings.OUTPUT_DIR]:
            for fpath in Path(folder).iterdir():
                if fpath.is_file():
                    age = now - fpath.stat().st_mtime
                    if age > max_age_seconds:
                        fpath.unlink(missing_ok=True)
                        logger.debug("Deleted old file: %s", fpath.name)

    @classmethod
    def safe_delete(cls, path: Path):
        try:
            path.unlink(missing_ok=True)
        except Exception as e:
            logger.warning("Could not delete %s: %s", path, e)
