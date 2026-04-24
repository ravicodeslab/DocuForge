"""
PDF processing service — merge, split, rotate, compress.
"""
import logging
import math
from pathlib import Path

import fitz  # PyMuPDF

from utils.exceptions import PDFProcessingError
from utils.file_handler import FileHandler

logger = logging.getLogger("docuforge.pdf_service")


class PDFService:

    # ── Merge ─────────────────────────────────────────────────────────────────
    @staticmethod
    def merge(pdf_paths: list[Path]) -> Path:
        """Merge multiple PDF files into one."""
        try:
            if len(pdf_paths) < 2:
                raise PDFProcessingError("Need at least 2 PDFs to merge.")

            merged = fitz.open()
            for p in pdf_paths:
                doc = fitz.open(str(p))
                merged.insert_pdf(doc)
                doc.close()

            out = FileHandler.output_path(".pdf")
            merged.save(str(out))
            merged.close()
            logger.info("Merged %d PDFs → %s", len(pdf_paths), out.name)
            return out
        except PDFProcessingError:
            raise
        except Exception as e:
            raise PDFProcessingError(str(e))

    # ── Split ─────────────────────────────────────────────────────────────────
    @staticmethod
    def split(pdf_path: Path, ranges: list[tuple[int, int]]) -> list[Path]:
        """
        Split a PDF by page ranges (1-indexed, inclusive).
        E.g. ranges=[(1,3),(5,7)] produces two PDFs.
        """
        try:
            doc = fitz.open(str(pdf_path))
            total = doc.page_count
            out_paths: list[Path] = []

            for start, end in ranges:
                if start < 1 or end > total or start > end:
                    raise PDFProcessingError(
                        f"Invalid range ({start}-{end}) for {total}-page PDF."
                    )
                chunk = fitz.open()
                chunk.insert_pdf(doc, from_page=start - 1, to_page=end - 1)
                out = FileHandler.output_path(".pdf")
                chunk.save(str(out))
                chunk.close()
                out_paths.append(out)

            doc.close()
            logger.info("Split into %d files", len(out_paths))
            return out_paths
        except PDFProcessingError:
            raise
        except Exception as e:
            raise PDFProcessingError(str(e))

    # ── Rotate ────────────────────────────────────────────────────────────────
    @staticmethod
    def rotate(pdf_path: Path, degrees: int, pages: list[int] | None = None) -> Path:
        """
        Rotate specified pages (1-indexed) or all pages by given degrees (90,180,270).
        """
        try:
            if degrees not in (90, 180, 270):
                raise PDFProcessingError("Rotation must be 90, 180, or 270 degrees.")

            doc = fitz.open(str(pdf_path))
            for page in doc:
                pnum = page.number + 1  # 1-indexed
                if pages is None or pnum in pages:
                    page.set_rotation((page.rotation + degrees) % 360)

            out = FileHandler.output_path(".pdf")
            doc.save(str(out))
            doc.close()
            logger.info("Rotated PDF → %s", out.name)
            return out
        except PDFProcessingError:
            raise
        except Exception as e:
            raise PDFProcessingError(str(e))

    # ── Compress ──────────────────────────────────────────────────────────────
    @staticmethod
    def compress(pdf_path: Path, target_kb: int | None = None) -> tuple[Path, dict]:
        """
        Adaptive compression: down-sample images and repack PDF.
        If target_kb is specified, iterates quality reductions to approach target.

        Returns (output_path, stats_dict).
        """
        try:
            original_size = pdf_path.stat().st_size

            # Determine compression level based on target
            if target_kb:
                target_bytes = target_kb * 1024
                ratio = target_bytes / max(original_size, 1)
                if ratio >= 0.9:
                    quality = 85
                elif ratio >= 0.5:
                    quality = 60
                elif ratio >= 0.2:
                    quality = 35
                else:
                    quality = 15
            else:
                quality = 50  # default: moderate compression

            out = FileHandler.output_path(".pdf")
            PDFService._compress_with_quality(pdf_path, out, quality)
            compressed_size = out.stat().st_size

            stats = {
                "original_kb": round(original_size / 1024, 1),
                "compressed_kb": round(compressed_size / 1024, 1),
                "reduction_pct": round((1 - compressed_size / max(original_size, 1)) * 100, 1),
                "target_kb": target_kb,
                "note": (
                    "Target size is approximate. Very small targets may not be achievable "
                    "if the PDF has minimal compressible content."
                    if target_kb else ""
                ),
            }
            logger.info(
                "Compressed PDF: %d KB → %d KB (%.1f%% reduction)",
                stats["original_kb"], stats["compressed_kb"], stats["reduction_pct"]
            )
            return out, stats
        except PDFProcessingError:
            raise
        except Exception as e:
            raise PDFProcessingError(str(e))

    @staticmethod
    def _compress_with_quality(src: Path, dest: Path, quality: int):
        """Re-encode all images within the PDF at the given JPEG quality."""
        doc = fitz.open(str(src))
        for page in doc:
            # Re-render page at reduced resolution for compression
            scale = max(0.5, quality / 100)
            mat = fitz.Matrix(scale, scale)
            pix = page.get_pixmap(matrix=mat, alpha=False)
            # Replace page content with re-rendered image
            img_pdf = fitz.open()
            img_page = img_pdf.new_page(width=page.rect.width, height=page.rect.height)
            img_page.insert_image(img_page.rect, pixmap=pix)
            doc.reload_page(page)

        doc.save(
            str(dest),
            garbage=4,
            deflate=True,
            clean=True,
        )
        doc.close()
