import { readPdf } from "lib/parse-resume-from-pdf/read-pdf";
import { groupTextItemsIntoLines } from "lib/parse-resume-from-pdf/group-text-items-into-lines";
import { groupLinesIntoSections } from "lib/parse-resume-from-pdf/group-lines-into-sections";
import { extractResumeFromSections, detectPrivacyStatementsFromPDF } from "lib/parse-resume-from-pdf/extract-resume-from-sections";
import * as pdfjs from "pdfjs-dist";
import { PDFDocument } from "pdf-lib";

/**
 * Check if PDF contains cv---maker metadata and extract JSON data
 */
/**
 * Check if PDF contains cv---maker metadata and extract JSON data using pdf-lib
 */
const extractMetadataFromPDF = async (fileUrl: string) => {
  try {
    console.log('📄 Attempting to read PDF metadata with pdf-lib...');
    
    // Fetch the PDF file
    const response = await fetch(fileUrl);
    const pdfBytes = await response.arrayBuffer();
    
    // Load the PDF document
    const pdfDoc = await PDFDocument.load(pdfBytes);
    
    // Get metadata
    const title = pdfDoc.getTitle();
    const author = pdfDoc.getAuthor();
    const subject = pdfDoc.getSubject();
    const producer = pdfDoc.getProducer();
    const creator = pdfDoc.getCreator();
    
    console.log('📄 PDF metadata found with pdf-lib:');
    console.log('📄 Title:', title);
    console.log('📄 Author:', author);
    console.log('📄 Subject length:', subject?.length || 0);
    console.log('📄 Subject preview:', subject?.substring(0, 200) || 'No subject');
    console.log('📄 Producer:', producer);
    console.log('📄 Creator:', creator);
    
    // PRIORITÀ ASSOLUTA: Se c'è un subject con contenuto, proviamo a parsarlo come JSON
    if (subject && subject.length > 0) {
      console.log('🎯 Found subject field, attempting to parse as JSON');
      try {
        const jsonData = subject;
        console.log('🎯 JSON data length:', jsonData.length);
        console.log('🎯 JSON data preview:', jsonData.substring(0, 200) + '...');
        const parsedData = JSON.parse(jsonData);
        console.log('🎯 Successfully parsed JSON from subject field');
        return parsedData;
      } catch (error) {
        console.log('📄 Subject field is not valid JSON:', error);
        
        // Fallback: controlla se è un PDF cv---maker anche senza JSON valido
        if (producer === 'cv---maker') {
          console.log('🎯 This is a cv---maker PDF but subject is not valid JSON');
        }
      }
    }
    
    // Controllo aggiuntivo per PDF cv---maker con producer corretto
    if (producer === 'cv---maker') {
      console.log('🎯 Found cv---maker producer but no valid JSON in subject');
    }
    
    return null;
  } catch (error) {
    console.log('📄 Error reading PDF metadata with pdf-lib:', error);
    
    // Fallback to pdfjs-dist if pdf-lib fails
    try {
      console.log('📄 Falling back to pdfjs-dist...');
      const pdfFile = await pdfjs.getDocument(fileUrl).promise;
      const metadata = await pdfFile.getMetadata();
      
      console.log('📄 PDF metadata found with pdfjs-dist:', metadata);
      console.log('📄 PDF metadata info:', (metadata.info as any));
      console.log('📄 PDF producer:', (metadata.info as any)?.producer);
      console.log('📄 PDF subject length:', (metadata.info as any)?.subject?.length || 0);
      console.log('📄 PDF subject preview:', (metadata.info as any)?.subject?.substring(0, 200) || 'No subject');
      
      // Try to parse subject as JSON
      const subject = (metadata.info as any)?.subject;
      if (subject && subject.length > 0) {
        console.log('🎯 Found subject field with pdfjs-dist, attempting to parse as JSON');
        try {
          const jsonData = subject;
          console.log('🎯 JSON data length:', jsonData.length);
          console.log('🎯 JSON data preview:', jsonData.substring(0, 200) + '...');
          const parsedData = JSON.parse(jsonData);
          console.log('🎯 Successfully parsed JSON from subject field with pdfjs-dist');
          return parsedData;
        } catch (error) {
          console.log('📄 Subject field is not valid JSON with pdfjs-dist:', error);
        }
      }
      
      return null;
    } catch (fallbackError) {
      console.log('📄 Both pdf-lib and pdfjs-dist failed:', fallbackError);
      return null;
    }
  }
};

/**
 * Resume parser util that parses a resume from a resume pdf file
 *
 * Note: The parser algorithm only works for single column resume in English language
 * If the PDF contains cv---maker metadata, it will use that data instead of parsing
 */
export const parseResumeFromPdf = async (fileUrl: string) => {
  console.log('📄 Starting PDF parsing for:', fileUrl);
  
  // PRIORITÀ ASSOLUTA: Controlla prima i metadati del PDF
  console.log('🎯 STEP 1: Checking PDF metadata for JSON data...');
  const metadataData = await extractMetadataFromPDF(fileUrl);
  
  if (metadataData) {
    console.log('🎯 ✅ SUCCESS: Using metadata data instead of parsing PDF');
    console.log('🎯 Metadata contains:', Object.keys(metadataData));
    return {
      resume: metadataData.resume,
      privacyStatements: metadataData.privacyStatements || { italyPrivacy: false, euPrivacy: false },
    };
  }
  
  console.log('📄 ❌ No metadata found, proceeding with traditional PDF parsing');
  console.log('📄 This means the PDF was not generated by cv---maker or metadata is corrupted');
  
  // Step 1. Read a pdf resume file into text items to prepare for processing
  const textItems = await readPdf(fileUrl);

  // Step 2. Group text items into lines
  const lines = groupTextItemsIntoLines(textItems);

  // Step 3. Group lines into sections
  const sections = groupLinesIntoSections(lines);

  // Step 4. Extract resume from sections
  const resume = extractResumeFromSections(sections);
  
  // Step 5. Detect privacy statements
  const privacyStatements = detectPrivacyStatementsFromPDF(sections);

  return {
    resume,
    privacyStatements,
  };
};
