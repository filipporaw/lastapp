import { readPdf } from "lib/parse-resume-from-pdf/read-pdf";
import { groupTextItemsIntoLines } from "lib/parse-resume-from-pdf/group-text-items-into-lines";
import { groupLinesIntoSections } from "lib/parse-resume-from-pdf/group-lines-into-sections";
import { extractResumeFromSections, detectPrivacyStatementsFromPDF } from "lib/parse-resume-from-pdf/extract-resume-from-sections";
import * as pdfjs from "pdfjs-dist";

/**
 * Check if PDF contains cv---maker metadata and extract JSON data
 */
const extractMetadataFromPDF = async (fileUrl: string) => {
  try {
    const pdfFile = await pdfjs.getDocument(fileUrl).promise;
    const metadata = await pdfFile.getMetadata();
    
    console.log('📄 PDF metadata found:', metadata);
    
    // Check if this is a cv---maker generated PDF
    if ((metadata.info as any)?.producer === 'cv---maker' && (metadata.info as any)?.subject) {
      console.log('🎯 Found cv---maker metadata, extracting JSON data from subject');
      try {
        const jsonData = (metadata.info as any).subject;
        return JSON.parse(jsonData);
      } catch (error) {
        console.log('📄 Error parsing JSON from subject:', error);
        return null;
      }
    }
    
    return null;
  } catch (error) {
    console.log('📄 No metadata found or error reading metadata:', error);
    return null;
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
  
  // Step 0. Check if PDF contains cv---maker metadata first
  const metadataData = await extractMetadataFromPDF(fileUrl);
  
  if (metadataData) {
    console.log('🎯 Using metadata data instead of parsing PDF');
    return {
      resume: metadataData.resume,
      privacyStatements: metadataData.privacyStatements || { italyPrivacy: false, euPrivacy: false },
    };
  }
  
  console.log('📄 No metadata found, proceeding with PDF parsing');
  
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
