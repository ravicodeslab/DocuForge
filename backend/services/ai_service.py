"""
AI service — PDF text extraction + summarization orchestration.
"""
import logging
from pathlib import Path

import fitz  # PyMuPDF

from models.summarizer import summarizer
from utils.exceptions import AIProcessingError

logger = logging.getLogger("docuforge.ai_service")

# Character limit to prevent OOM on huge docs
MAX_CHARS = 80_000


class AIService:

    @staticmethod
    def extract_text_from_pdf(pdf_path: Path) -> str:
        """Extract all text from a PDF file."""
        try:
            doc = fitz.open(str(pdf_path))
            parts: list[str] = []
            for page in doc:
                text = page.get_text("text").strip()
                if text:
                    parts.append(text)
            doc.close()
            full_text = "\n\n".join(parts)
            return full_text[:MAX_CHARS]
        except Exception as e:
            raise AIProcessingError(f"Text extraction failed: {e}")

    @staticmethod
    def summarize_text(text: str, sentence_count: int = 8) -> dict:
        """Summarize raw text."""
        try:
            text = text.strip()[:MAX_CHARS]
            if len(text) < 50:
                raise AIProcessingError("Text is too short to summarize (minimum 50 characters).")
            return summarizer.summarize(text, sentence_count=sentence_count)
        except AIProcessingError:
            raise
        except Exception as e:
            raise AIProcessingError(str(e))

    @staticmethod
    def summarize_pdf(pdf_path: Path, sentence_count: int = 8) -> dict:
        """Extract text from a PDF, then summarize it."""
        text = AIService.extract_text_from_pdf(pdf_path)
        if not text.strip():
            raise AIProcessingError(
                "No extractable text found in this PDF. "
                "It may be image-based (scanned). OCR is not currently supported."
            )
        result = AIService.summarize_text(text, sentence_count=sentence_count)
        result["source"] = "pdf"
        return result
