import { Component, OnInit, ChangeDetectorRef, SecurityContext } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxExtendedPdfViewerModule, pdfDefaultOptions } from 'ngx-extended-pdf-viewer';
import { PDFDocumentProxy, getDocument } from 'pdfjs-dist';
import * as pdfjsLib from 'pdfjs-dist';
import { MarkdownModule, provideMarkdown } from 'ngx-markdown';
import Tesseract from 'tesseract.js';

@Component({
  selector: 'app-iso-clauses',
  templateUrl: './iso-clauses-component.component.html',
  styleUrls: ['./iso-clauses-component.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    NgxExtendedPdfViewerModule,
    MarkdownModule,
  ],
  providers: [
    provideMarkdown({ sanitize: SecurityContext.HTML }),
  ],
})
export class IsoClausesComponentComponent implements OnInit {
  public pdfSrc: string = 'assets/ISO9001.pdf';
  public extractedText: string = 'Loading ISO Clauses...';

  constructor(private cdr: ChangeDetectorRef) {
    // Set up the pdfjs-dist worker to use the local file
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/assets/ngx-extended-pdf-viewer/pdf.worker-4.7.708.min.mjs';

    // Configure ngx-extended-pdf-viewer to use local assets
    pdfDefaultOptions.assetsFolder = 'assets/ngx-extended-pdf-viewer';
    pdfDefaultOptions.workerSrc = () => '/assets/ngx-extended-pdf-viewer/pdf.worker-4.7.708.min.mjs';
    console.log('IsoClausesComponent constructor called, pdfSrc:', this.pdfSrc);
  }

  ngOnInit(): void {
    console.log('IsoClausesComponent ngOnInit called');
    this.cdr.detectChanges();
  }

  async onPdfLoaded(event: any): Promise<void> {
    console.log('pdfLoaded event triggered:', event);
    console.log('Event type:', typeof event);
    console.log('Event instanceof Event:', event instanceof Event);
    console.log('Event instanceof CustomEvent:', event instanceof CustomEvent);
    console.log('Event properties:', Object.keys(event || {}));
    console.log('Event.numPages:', event.numPages);
    console.log('Event.getPage exists:', typeof event.getPage === 'function');

    try {
      let pdf: PDFDocumentProxy | null = null;

      // Check if the event itself is the PDFDocumentProxy
      if (typeof event.numPages === 'number' && typeof event.getPage === 'function') {
        console.log('Event is the PDFDocumentProxy');
        pdf = event as PDFDocumentProxy;
      } else if (event instanceof CustomEvent) {
        console.log('Event is a CustomEvent, checking detail...');
        const customEvent = event as CustomEvent;
        console.log('CustomEvent detail:', customEvent.detail);
        if (customEvent.detail && typeof customEvent.detail.numPages === 'number' && typeof customEvent.detail.getPage === 'function') {
          pdf = customEvent.detail as PDFDocumentProxy;
        }
      } else if (event.pdfDocument) {
        console.log('Event has pdfDocument property:', event.pdfDocument);
        pdf = event.pdfDocument as PDFDocumentProxy;
      } else {
        console.log('Unable to extract PDFDocumentProxy from event, falling back to pdfjs-dist...');
        // Fallback: Load the PDF directly with pdfjs-dist
        pdf = await getDocument(this.pdfSrc).promise;
        console.log('PDF loaded via pdfjs-dist, number of pages:', pdf.numPages);
      }

      if (pdf === null) {
        throw new Error('PDFDocumentProxy was not assigned');
      }

      console.log('PDF loaded successfully, number of pages:', pdf.numPages);
      await this.extractTextWithOcr(pdf);
    } catch (error) {
      console.error('Error in onPdfLoaded:', error);
      this.extractedText = '# Error\nFailed to process PDF: ' + String(error);
      this.cdr.detectChanges();
    }
  }

  onError(error: unknown): void {
    console.error('Error loading PDF in viewer:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    this.extractedText = '# Error\nFailed to load PDF in viewer: ' + errorMessage;
    this.cdr.detectChanges();
  }

  async extractTextWithOcr(pdf: PDFDocumentProxy): Promise<void> {
    console.log('Starting text extraction with OCR...');
    let fullText = '# ISO Clauses\n\n';
    try {
      console.log('Total pages in PDF:', pdf.numPages);
      for (let pageNum = 1; pageNum <= Math.min(pdf.numPages, 5); pageNum++) {
        console.log(`Processing page ${pageNum}...`);
        const page = await pdf.getPage(pageNum);
        console.log(`Page ${pageNum} loaded`);
        const textContent = await page.getTextContent();
        let pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
        console.log(`Page ${pageNum} direct text extraction:`, pageText);

        if (!pageText) {
          console.log(`No text found on page ${pageNum}, performing OCR...`);
          const viewport = page.getViewport({ scale: 1.0 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          await page.render({
            canvasContext: context!,
            viewport: viewport,
          }).promise;
          console.log(`Page ${pageNum} rendered to canvas`);
          const { data: { text } } = await Tesseract.recognize(canvas, 'fra+eng+deu');
          pageText = text.replace(/\s+/g, ' ').trim();
          console.log(`Page ${pageNum} OCR text:`, pageText);
          if (!pageText) {
            pageText = `Page ${pageNum}: No text extracted via OCR.`;
          }
        }

        // Improved formatting: Detect headings and structure
        const lines = pageText.split(/(?<=\.)\s+/);
        let inHeading = false;
        for (const line of lines) {
          // Check for headings (e.g., "Normes en ligne", "Introduction", or lines starting with numbers)
          if (/^(Normes en ligne|Introduction|[0-9]+\s)/i.test(line)) {
            fullText += `## ${line}\n`;
            inHeading = true;
          } else if (line.match(/^[A-Z][A-Z\s]+$/)) { // Detect all-caps sections (e.g., "CE DOCUMENT")
            fullText += `### ${line}\n`;
            inHeading = true;
          } else {
            if (inHeading) {
              fullText += '\n'; // Add spacing after heading
              inHeading = false;
            }
            fullText += `${line}\n\n`;
          }
        }
        fullText += '---\n\n';
      }
      this.extractedText = fullText;
      console.log('Extracted text:', this.extractedText);
    } catch (error) {
      console.error('Error extracting text:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.extractedText = '# Error\nUnable to extract text: ' + errorMessage;
    } finally {
      this.cdr.detectChanges();
    }
  }
}
