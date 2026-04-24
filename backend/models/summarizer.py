"""
AI Summarizer model wrapper.
Uses sumy (LSA algorithm) with NLTK for 100% local summarization — no API key required.
"""
import logging
import threading
from pathlib import Path

logger = logging.getLogger("docuforge.summarizer")

# ── NLTK data bootstrapping ───────────────────────────────────────────────────
_nltk_ready = threading.Event()

def _bootstrap_nltk():
    """Download required NLTK corpora on first run (runs in background thread)."""
    try:
        import nltk
        for corpus in ["punkt", "punkt_tab", "stopwords"]:
            try:
                nltk.data.find(f"tokenizers/{corpus}" if corpus.startswith("punkt") else f"corpora/{corpus}")
            except LookupError:
                logger.info("Downloading NLTK corpus: %s", corpus)
                nltk.download(corpus, quiet=True)
        _nltk_ready.set()
        logger.info("NLTK corpora ready.")
    except Exception as e:
        logger.error("NLTK bootstrap failed: %s", e)
        _nltk_ready.set()  # unblock anyway


# Run NLTK bootstrap in background so startup isn't delayed
threading.Thread(target=_bootstrap_nltk, daemon=True).start()


# ── Summarizer ────────────────────────────────────────────────────────────────

class LocalSummarizer:
    """
    Lightweight extractive summarizer using sumy's LSA algorithm.
    Produces structured output: summary paragraphs + key points list.
    """

    def __init__(self, sentence_count: int = 8):
        self.sentence_count = sentence_count
        self._ready = False

    def _load(self):
        if self._ready:
            return
        _nltk_ready.wait(timeout=30)
        from sumy.parsers.plaintext import PlaintextParser
        from sumy.nlp.tokenizers import Tokenizer
        from sumy.summarizers.lsa import LsaSummarizer
        from sumy.nlp.stemmers import Stemmer
        from sumy.utils import get_stop_words

        self._PlaintextParser = PlaintextParser
        self._Tokenizer = Tokenizer
        self._LsaSummarizer = LsaSummarizer
        self._Stemmer = Stemmer
        self._get_stop_words = get_stop_words
        self._ready = True

    def summarize(self, text: str, sentence_count: int | None = None) -> dict:
        """
        Summarize the provided text.

        Returns:
            {
              "summary": "...",
              "key_points": ["...", ...],
              "word_count": int,
              "sentence_count": int,
              "compression_ratio": float
            }
        """
        self._load()

        n = sentence_count or self.sentence_count
        text = text.strip()

        if not text:
            return self._empty_result()

        try:
            import nltk
            from sumy.parsers.plaintext import PlaintextParser
            from sumy.nlp.tokenizers import Tokenizer
            from sumy.summarizers.lsa import LsaSummarizer
            from sumy.nlp.stemmers import Stemmer
            from sumy.utils import get_stop_words

            language = "english"
            stemmer = Stemmer(language)
            parser = PlaintextParser.from_string(text, Tokenizer(language))
            summarizer = LsaSummarizer(stemmer)
            summarizer.stop_words = get_stop_words(language)

            sentences = summarizer(parser.document, n)
            summary_text = " ".join(str(s) for s in sentences)

            # Key points: top 5 sentences (shorter for bullet format)
            key_sentences = summarizer(parser.document, min(5, n))
            key_points = [str(s) for s in key_sentences]

            original_words = len(text.split())
            summary_words = len(summary_text.split())
            ratio = round(1 - (summary_words / max(original_words, 1)), 2)

            return {
                "summary": summary_text,
                "key_points": key_points,
                "word_count": {"original": original_words, "summary": summary_words},
                "compression_ratio": ratio,
            }
        except Exception as e:
            logger.error("Summarization failed: %s", e)
            # Graceful fallback: return first N sentences manually
            import re
            raw_sentences = re.split(r"(?<=[.!?])\s+", text)
            fallback = " ".join(raw_sentences[:n])
            return {
                "summary": fallback,
                "key_points": raw_sentences[:5],
                "word_count": {"original": len(text.split()), "summary": len(fallback.split())},
                "compression_ratio": 0.0,
                "warning": "Full summarization unavailable; showing extracted sentences.",
            }

    def _empty_result(self) -> dict:
        return {
            "summary": "",
            "key_points": [],
            "word_count": {"original": 0, "summary": 0},
            "compression_ratio": 0.0,
        }


# Module-level singleton
summarizer = LocalSummarizer(sentence_count=8)
