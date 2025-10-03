import os
import logging
import io
import threading
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, File, UploadFile, HTTPException, Form
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from PyPDF2 import PdfReader
from PIL import Image
import pytesseract
from transformers import pipeline
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT

# -----------------------------------
# Configuration du logging
# -----------------------------------
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# -----------------------------------
# Constantes
# -----------------------------------
MAX_FILE_SIZE = 25 * 1024 * 1024  # 25 MB
MAX_TEXT_SIZE = 25 * 1024 * 1024  # 25 MB
UPLOAD_DIR = "../Uploads"
LOGO_PATH = os.getenv("LOGO_PATH", "assets/images/cropped-coconsultlogo_flood2__3_.png")

# Créer le répertoire d'upload si nécessaire
os.makedirs(UPLOAD_DIR, exist_ok=True)

# -----------------------------------
# In-Memory Storage
# -----------------------------------
documents = []
document_versions = []
storage_lock = threading.Lock()

# -----------------------------------
# Modèles Pydantic
# -----------------------------------
class SummaryResponse(BaseModel):
    summary: str
    fullText: str

class OcrDocument(BaseModel):
    id: Optional[int] = None
    title: str
    content: str
    dateCreation: str
    createdBy: Optional[str] = None
    summary: Optional[str] = None
    category: str
    type: str
    version: Optional[int] = None

class DocumentVersion(BaseModel):
    id: Optional[int] = None
    documentId: int
    versionNumber: int
    content: str
    summary: Optional[str] = None
    dateModified: str

# -----------------------------------
# Service OCR
# -----------------------------------
async def extract_text(file: UploadFile) -> str:
    try:
        if file.size > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail="File size exceeds 25 MB limit")
        content = await file.read()
        file_stream = io.BytesIO(content)
        if file.content_type == "application/pdf":
            return extract_text_from_pdf(file_stream)
        elif file.content_type in ["image/png", "image/jpeg", "image/jpg"]:
            return extract_text_from_image(file_stream)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file type")
    except Exception as e:
        logger.error(f"Error extracting text: {e}")
        raise HTTPException(status_code=400, detail=f"Error extracting text: {e}")

def extract_text_from_pdf(file_stream: io.BytesIO) -> str:
    try:
        pdf_reader = PdfReader(file_stream)
        text = ""
        for page in pdf_reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
        text = text.strip()
        if len(text.encode('utf-8')) > MAX_TEXT_SIZE:
            raise HTTPException(status_code=400, detail="Extracted text exceeds 25 MB limit")
        return text
    except Exception as e:
        logger.error(f"Error extracting text from PDF: {e}")
        raise HTTPException(status_code=400, detail=f"Error extracting text from PDF: {e}")

def extract_text_from_image(file_stream: io.BytesIO) -> str:
    try:
        image = Image.open(file_stream)
        text = pytesseract.image_to_string(image, lang="eng")
        text = text.strip()
        if len(text.encode('utf-8')) > MAX_TEXT_SIZE:
            raise HTTPException(status_code=400, detail="Extracted text exceeds 25 MB limit")
        return text
    except Exception as e:
        logger.error(f"Error extracting text from image: {e}")
        raise HTTPException(status_code=400, detail=f"Error extracting text from image: {e}")

# -----------------------------------
# Service de résumé
# -----------------------------------
_summarizer = None
def get_summarizer():
    global _summarizer
    if _summarizer is None:
        _summarizer = pipeline("summarization", model="t5-small")
    return _summarizer

def chunk_text(text: str, max_chunk_size: int = 500) -> list[str]:
    words = text.split()
    chunks = []
    current_chunk = []
    current_length = 0
    for word in words:
        current_chunk.append(word)
        current_length += len(word) + 1
        if current_length >= max_chunk_size:
            chunks.append(" ".join(current_chunk))
            current_chunk = []
            current_length = 0
    if current_chunk:
        chunks.append(" ".join(current_chunk))
    return chunks

def generate_summary(text: str, max_length: int = 200) -> str:
    if not text:
        logger.warning("Empty text provided for summarization")
        return ""
    try:
        if len(text.encode('utf-8')) > MAX_TEXT_SIZE:
            raise HTTPException(status_code=400, detail="Text to summarize exceeds 25 MB limit")
        chunks = chunk_text(text, max_chunk_size=500)
        summaries = []
        summarizer = get_summarizer()
        input_word_count = len(text.split())
        adjusted_max_length = min(max_length // len(chunks) + 50, 150, input_word_count // 2 or 30)
        for chunk in chunks:
            summary = summarizer(
                chunk,
                max_length=adjusted_max_length,
                min_length=30,
                do_sample=False
            )[0]["summary_text"]
            summaries.append(summary)
        final_summary = " ".join(summaries)
        if len(final_summary) > max_length:
            final_summary = final_summary[:max_length].rsplit(" ", 1)[0] + "..."
        logger.info(f"Generated summary: {final_summary[:100]}...")
        return final_summary
    except Exception as e:
        logger.error(f"Error generating summary: {e}")
        return text[:100] + "..." if len(text) > 100 else text

# -----------------------------------
# Service PDF
# -----------------------------------
async def generate_pdf_document(summary: str, content: str, title: str, dateCreation: str, createdBy: str, config: str = None) -> io.BytesIO:
    try:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            leftMargin=2*cm,
            rightMargin=2*cm,
            topMargin=2*cm,
            bottomMargin=2*cm
        )
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(name='Title', fontSize=20, leading=24, fontName='Helvetica-Bold', spaceAfter=12, alignment=TA_CENTER)
        header_style = ParagraphStyle(name='Header', fontSize=12, leading=14, fontName='Helvetica', spaceAfter=8, alignment=TA_LEFT)
        heading_style = ParagraphStyle(name='Heading', fontSize=14, leading=16, fontName='Helvetica-Bold', spaceAfter=10)
        normal_style = ParagraphStyle(name='Normal', fontSize=12, leading=14, fontName='Helvetica', spaceAfter=10, alignment=TA_LEFT)
        footer_style = ParagraphStyle(name='Footer', fontSize=10, leading=12, fontName='Helvetica', textColor=colors.grey, alignment=TA_CENTER)
        elements = []

        if os.path.exists(LOGO_PATH):
            try:
                img = ReportLabImage(LOGO_PATH, width=4*cm, height=4*cm)
                img.hAlign = 'CENTER'
                elements.append(img)
                elements.append(Spacer(1, 0.5*cm))
            except Exception as e:
                logger.warning(f"Failed to include logo: {e}")
        else:
            logger.warning(f"Logo not found at {LOGO_PATH}")

        elements.append(Paragraph("Document CV", title_style))
        elements.append(Spacer(1, 0.5*cm))
        metadata = [["Titre:", title], ["Créé par:", createdBy], ["Date:", dateCreation]]
        metadata_table = Table(metadata, colWidths=[3*cm, 14*cm])
        metadata_table.setStyle(TableStyle([
            ('FONT', (0, 0), (-1, -1), 'Helvetica', 12),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TEXTCOLOR', (0, 0), (0, -1), colors.darkblue),
            ('TEXTCOLOR', (1, 0), (1, -1), colors.black),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4)
        ]))
        elements.append(metadata_table)
        elements.append(Spacer(1, 1*cm))
        elements.append(Paragraph("Résumé:", heading_style))
        summary_lines = summary.split('\n')
        for line in summary_lines:
            elements.append(Paragraph(line.strip(), normal_style))
        elements.append(Spacer(1, 0.5*cm))
        if content and content.strip():
            elements.append(Paragraph("Contenu Complet:", heading_style))
            content_lines = content.split('\n')
            for line in content_lines:
                elements.append(Paragraph(line.strip(), normal_style))
            elements.append(Spacer(1, 0.5*cm))
        elements.append(Spacer(1, 1*cm))
        elements.append(Paragraph("Generated by OGDev-Coconsult OCR System", footer_style))
        doc.build(elements)
        buffer.seek(0)
        logger.info(f"PDF generated successfully for: {title}")
        return buffer
    except Exception as e:
        logger.error(f"Error generating PDF: {e}")
        raise HTTPException(status_code=500, detail=f"Error generating PDF: {e}")

# -----------------------------------
# Service de gestion des documents
# -----------------------------------
async def save_document(document: OcrDocument, content: str, summary: str) -> OcrDocument:
    try:
        with storage_lock:
            if document.id is None:
                document.id = len(documents) + 1
            if document.version is None:
                document.version = 1
            if any(doc["id"] == document.id for doc in documents):
                raise HTTPException(status_code=400, detail=f"Document with ID {document.id} already exists")
            documents.append(document.dict())
            version = DocumentVersion(
                id=len(document_versions) + 1,
                documentId=document.id,
                versionNumber=document.version,
                content=content,
                summary=summary,
                dateModified=datetime.now().strftime("%Y-%m-%d")
            )
            document_versions.append(version.dict())
        logger.info(f"Document saved successfully: {document.title}")
        return document
    except Exception as e:
        logger.error(f"Error saving document: {e}")
        raise HTTPException(status_code=500, detail=f"Error saving document: {e}")

async def get_all_documents() -> list:
    try:
        with storage_lock:
            logger.info(f"Retrieving all documents: {len(documents)} found")
            return documents
    except Exception as e:
        logger.error(f"Error retrieving documents: {e}")
        raise HTTPException(status_code=500, detail=f"Error retrieving documents: {e}")

async def get_archived_documents() -> list:
    try:
        with storage_lock:
            archived = [doc for doc in documents if doc["category"] == "Archive"]
            logger.info(f"Retrieving archived documents: {len(archived)} found")
            return archived
    except Exception as e:
        logger.error(f"Error retrieving archived documents: {e}")
        raise HTTPException(status_code=500, detail=f"Error retrieving archived documents: {e}")

async def archive_document(id: int) -> dict:
    try:
        with storage_lock:
            for doc in documents:
                if doc["id"] == id:
                    doc["category"] = "Archive"
                    logger.info(f"Document archived: ID {id}")
                    return doc
            raise HTTPException(status_code=404, detail=f"Document with ID {id} not found")
    except Exception as e:
        logger.error(f"Error archiving document: {e}")
        raise HTTPException(status_code=500, detail=f"Error archiving document: {e}")

async def unarchive_document(id: int) -> dict:
    try:
        with storage_lock:
            for doc in documents:
                if doc["id"] == id:
                    doc["category"] = "Files"
                    logger.info(f"Document unarchived: ID {id}")
                    return doc
            raise HTTPException(status_code=404, detail=f"Document with ID {id} not found")
    except Exception as e:
        logger.error(f"Error unarchiving document: {e}")
        raise HTTPException(status_code=500, detail=f"Error unarchiving document: {e}")

async def delete_document(id: int) -> dict:
    try:
        with storage_lock:
            global documents, document_versions
            documents = [doc for doc in documents if doc["id"] != id]
            document_versions = [ver for ver in document_versions if ver["documentId"] != id]
            logger.info(f"Document deleted: ID {id}")
            return {"message": "Document deleted successfully"}
    except Exception as e:
        logger.error(f"Error deleting document: {e}")
        raise HTTPException(status_code=500, detail=f"Error deleting document: {e}")

async def get_document_versions(id: int) -> list:
    try:
        with storage_lock:
            versions = [ver for ver in document_versions if ver["documentId"] == id]
            logger.info(f"Retrieving versions of document with ID: {id}, {len(versions)} found")
            if not versions:
                raise HTTPException(status_code=404, detail=f"No versions found for document ID {id}")
            return versions
    except Exception as e:
        logger.error(f"Error retrieving document versions: {e}")
        raise HTTPException(status_code=500, detail=f"Error retrieving document versions: {e}")

async def get_document_version(id: int, version_number: int) -> dict:
    try:
        with storage_lock:
            for version in document_versions:
                if version["documentId"] == id and version["versionNumber"] == version_number:
                    logger.info(f"Retrieved version {version_number} of document with ID: {id}")
                    return version
            raise HTTPException(status_code=404, detail=f"Version {version_number} of document ID {id} not found")
    except Exception as e:
        logger.error(f"Error retrieving document version: {e}")
        raise HTTPException(status_code=500, detail=f"Error retrieving document version: {e}")

async def update_document(id: int, updated_document: OcrDocument) -> dict:
    try:
        with storage_lock:
            for i, doc in enumerate(documents):
                if doc["id"] == id:
                    new_version_number = doc.get("version", 0) + 1
                    updated_document_dict = updated_document.dict(exclude_unset=True)
                    updated_document_dict["id"] = id
                    updated_document_dict["version"] = new_version_number
                    documents[i] = updated_document_dict
                    version = DocumentVersion(
                        id=len(document_versions) + 1,
                        documentId=id,
                        versionNumber=new_version_number,
                        content=updated_document.content,
                        summary=updated_document.summary,
                        dateModified=datetime.now().strftime("%Y-%m-%d")
                    )
                    document_versions.append(version.dict())
                    logger.info(f"Document updated: ID {id}, new version {new_version_number}")
                    return updated_document_dict
            raise HTTPException(status_code=404, detail=f"Document with ID {id} not found")
    except Exception as e:
        logger.error(f"Error updating document: {e}")
        raise HTTPException(status_code=500, detail=f"Error updating document: {e}")

# -----------------------------------
# Routes
# -----------------------------------
router = APIRouter(prefix="/api/ocr", tags=["ocr"])

@router.post("/summarize", response_model=SummaryResponse)
async def summarize_file(file: UploadFile = File(...), summary_length: int = 200):
    logger.info(f"Received file: {file.filename}, size: {file.size}, content_type: {file.content_type}")
    if not file:
        raise HTTPException(status_code=400, detail="No file provided")
    if file.size == 0:
        raise HTTPException(status_code=400, detail="File is empty")
    if file.size > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds 25 MB limit")
    try:
        text = await extract_text(file)
        summary = generate_summary(text, max_length=summary_length)
        document = OcrDocument(
            id=None,
            title=file.filename,
            content=text,
            dateCreation=datetime.now().strftime("%Y-%m-%d"),
            createdBy=None,
            summary=summary,
            category="Files",
            type="AUTRE",
            version=1
        )
        saved_document = await save_document(document, text, summary)
        return SummaryResponse(summary=summary, fullText=text)
    except Exception as e:
        logger.error(f"Error processing file: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing file: {e}")

@router.post("/documents", response_model=OcrDocument)
async def save_ocr_document(document: OcrDocument):
    return await save_document(document, document.content, document.summary)

@router.get("/documents", response_model=List[OcrDocument])
async def list_documents():
    return await get_all_documents()

@router.get("/archived-documents", response_model=List[OcrDocument])
async def list_archived_documents():
    return await get_archived_documents()

@router.post("/archive/{id}", response_model=OcrDocument)
async def archive_doc(id: int):
    return await archive_document(id)

@router.post("/unarchive/{id}", response_model=OcrDocument)
async def unarchive_doc(id: int):
    return await unarchive_document(id)

@router.delete("/documents/{id}", response_model=dict)
async def delete_doc(id: int):
    return await delete_document(id)

@router.get("/documents/{id}/versions", response_model=List[DocumentVersion])
async def list_document_versions(id: int):
    return await get_document_versions(id)

@router.get("/documents/{id}/version/{version_number}", response_model=DocumentVersion)
async def get_doc_version(id: int, version_number: int):
    return await get_document_version(id, version_number)

@router.put("/documents/{id}", response_model=OcrDocument)
async def update_doc(id: int, updated_document: OcrDocument):
    return await update_document(id, updated_document)

@router.post("/generate-pdf")
async def generate_pdf(
        summary: str = Form(...),
        content: str = Form(...),
        title: str = Form(...),
        dateCreation: str = Form(...),
        createdBy: str = Form(...),
        config: str = Form(None)
):
    pdf_buffer = await generate_pdf_document(summary, content, title, dateCreation, createdBy, config)
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={title.replace(' ', '_')}.pdf"}
    )

@router.get("/search", response_model=List[OcrDocument])
async def search_documents(keyword: str):
    try:
        if not keyword or keyword.strip() == "":
            raise HTTPException(status_code=400, detail="Keyword cannot be empty")
        with storage_lock:
            results = [
                doc for doc in documents
                if keyword.lower() in doc["title"].lower() or
                   (doc["summary"] and keyword.lower() in doc["summary"].lower()) or
                   (doc["content"] and keyword.lower() in doc["content"].lower())
            ]
        logger.info(f"Search results for '{keyword}': {len(results)} found")
        return results
    except Exception as e:
        logger.error(f"Error searching documents: {e}")
        raise HTTPException(status_code=500, detail=f"Error searching documents: {e}")
