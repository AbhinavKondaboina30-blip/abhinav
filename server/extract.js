const pdfParseModule = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Clean extracted text: normalize line breaks, collapse multi-spaces, strip excessive blank lines.
 */
function cleanExtractedText(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Extract text from uploaded file buffer.
 * Supports PDF and DOCX.
 */
async function extractResumeText(file) {
  if (!file || !file.buffer) {
    throw new Error('No resume file provided.');
  }

  const originalName = (file.originalname || '').toLowerCase();
  const mimeType = file.mimetype || '';

  let rawText = '';

  try {
    if (originalName.endsWith('.pdf') || mimeType === 'application/pdf') {
      if (pdfParseModule.PDFParse) {
        // pdf-parse v2+ class based
        const parser = new pdfParseModule.PDFParse({ data: file.buffer });
        await parser.load();
        const res = await parser.getText();
        rawText = res && typeof res.text === 'string' ? res.text : (typeof res === 'string' ? res : '');
      } else if (typeof pdfParseModule === 'function') {
        // pdf-parse v1 function based
        const parsed = await pdfParseModule(file.buffer);
        rawText = parsed.text || '';
      } else {
        throw new Error('PDF parsing engine unavailable.');
      }
    } else if (
      originalName.endsWith('.docx') ||
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      rawText = result.value || '';
    } else {
      throw new Error('Please upload a PDF or DOCX resume.');
    }
  } catch (err) {
    if (err.message && err.message.includes('PDF or DOCX')) {
      throw err;
    }
    console.error('Text extraction error:', err.message);
    throw new Error("We couldn't read this resume. Please upload a text-based PDF or DOCX.");
  }

  const cleaned = cleanExtractedText(rawText);

  if (!cleaned || cleaned.length < 20) {
    throw new Error("We couldn't read this resume. Please upload a text-based PDF or DOCX.");
  }

  return cleaned;
}

module.exports = {
  extractResumeText,
  cleanExtractedText
};
