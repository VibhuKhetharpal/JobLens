import os
import fitz  # PyMuPDF
from PIL import Image
import pytesseract


def extract_text(file_path: str) -> str:
    """Extract text from a PDF or image resume.

    Supports PDF via PyMuPDF and JPEG/PNG via pytesseract + Pillow.
    Returns stripped plain text.
    Raises FileNotFoundError for missing files and ValueError for unsupported types.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"{file_path} not found.")

    _, ext = os.path.splitext(file_path)
    ext = ext.lower()
    text = ""

    try:
        if ext == ".pdf":
            print("[Parser] Using PDF mode")
            with fitz.open(file_path) as doc:
                for page in doc:
                    text += page.get_text("text")
        elif ext in [".png", ".jpg", ".jpeg"]:
            print("[Parser] Using Image mode")
            with Image.open(file_path) as img:
                text = pytesseract.image_to_string(img)
        else:
            raise ValueError("Unsupported file type.")
    except Exception as e:
        print(f"[Parser error] {e}")
        return ""

    return text.strip()


def extract_text_from_bytes(file_bytes: bytes, filename: str) -> str:
    """Extract text from in-memory file bytes (used when Flask receives upload)."""
    import tempfile

    _, ext = os.path.splitext(filename)
    ext = ext.lower()

    with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as tmp:
        tmp.write(file_bytes)
        tmp_path = tmp.name

    try:
        text = extract_text(tmp_path)
    finally:
        os.remove(tmp_path)

    return text
