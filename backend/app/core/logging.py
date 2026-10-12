"""Logging configuration and secret redaction filter for DevAgent AI."""

import logging
import re
import sys
from pathlib import Path
from typing import List, Pattern

# Common secret patterns for redaction
SECRET_PATTERNS: List[Pattern[str]] = [
    re.compile(r"(?i)(bearer\s+)[a-zA-Z0-9_\-\.]{15,}"),
    re.compile(r"(?i)(api[_-]?key[\s:=]+)['\"]?([a-zA-Z0-9_\-\.]{15,})['\"]?"),
    re.compile(r"(?i)(secret[\s:=]+)['\"]?([a-zA-Z0-9_\-\.]{15,})['\"]?"),
    re.compile(r"(?i)(password[\s:=]+)['\"]?([^'\"\s]{6,})['\"]?"),
    re.compile(r"sk-[a-zA-Z0-9]{20,}"),  # OpenAI style key
]


class SecretRedactionFilter(logging.Filter):
    """Filter that masks detected secrets in log records."""

    def filter(self, record: logging.LogRecord) -> bool:
        if isinstance(record.msg, str):
            record.msg = self.redact(record.msg)
        if record.args:
            if isinstance(record.args, dict):
                record.args = {k: (self.redact(v) if isinstance(v, str) else v) for k, v in record.args.items()}
            elif isinstance(record.args, tuple):
                record.args = tuple((self.redact(a) if isinstance(a, str) else a) for a in record.args)
        return True

    @staticmethod
    def redact(text: str) -> str:
        for pattern in SECRET_PATTERNS:
            if pattern.groups >= 1:
                text = pattern.sub(r"\1[REDACTED]", text)
            else:
                text = pattern.sub("[REDACTED]", text)
        return text


def setup_logging(log_dir: Path, log_level: str = "INFO") -> logging.Logger:
    """Configure console and file loggers with secret redaction."""
    log_dir.mkdir(parents=True, exist_ok=True)
    log_file = log_dir / "devagent.log"

    level = getattr(logging, log_level.upper(), logging.INFO)

    root_logger = logging.getLogger()
    root_logger.setLevel(level)

    # Clean existing handlers
    root_logger.handlers.clear()

    formatter = logging.Formatter(
        fmt="%(asctime)s | %(levelname)-7s | [%(name)s] %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    # Console Handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(level)
    console_handler.setFormatter(formatter)
    console_handler.addFilter(SecretRedactionFilter())
    root_logger.addHandler(console_handler)

    # File Handler
    file_handler = logging.FileHandler(log_file, encoding="utf-8")
    file_handler.setLevel(level)
    file_handler.setFormatter(formatter)
    file_handler.addFilter(SecretRedactionFilter())
    root_logger.addHandler(file_handler)

    logger = logging.getLogger("devagent")
    logger.info("DevAgent AI logging initialized (Level: %s, File: %s)", log_level, log_file)
    return logger
