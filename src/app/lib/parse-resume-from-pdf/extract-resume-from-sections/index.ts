import type { Resume } from "lib/redux/types";
import type { ResumeSectionToLines, TextItem } from "lib/parse-resume-from-pdf/types";
import { extractProfile } from "lib/parse-resume-from-pdf/extract-resume-from-sections/extract-profile";
import { extractEducation } from "lib/parse-resume-from-pdf/extract-resume-from-sections/extract-education";
import { extractWorkExperience } from "lib/parse-resume-from-pdf/extract-resume-from-sections/extract-work-experience";
import { extractProject } from "lib/parse-resume-from-pdf/extract-resume-from-sections/extract-project";
import { extractSkills } from "lib/parse-resume-from-pdf/extract-resume-from-sections/extract-skills";
import { extractCustom } from "lib/parse-resume-from-pdf/extract-resume-from-sections/extract-custom";

// Funzione per riconoscere gli statement di privacy
const isPrivacyStatement = (text: string): boolean => {
  const normalizedText = text.toLowerCase().trim();
  
  // Keywords più specifici per statement Italia
  const italyKeywords = [
    "acconsento",
    "trattamento",
    "dati personali", 
    "curriculum vitae",
    "d.lgs.196/2003",
    "gdpr",
    "679/16",
    "art.13",
    "consenso",
    "autorizzo",
    "permesso",
    "privacy",
    "protezione dati",
    "legge privacy",
    "codice privacy",
    "decreto legislativo",
    "196/2003"
  ];
  
  // Keywords più specifici per statement UE
  const euKeywords = [
    "law 679/2016",
    "regulation",
    "european parliament",
    "consent",
    "process",
    "data",
    "cv",
    "recruiting",
    "gdpr",
    "general data protection",
    "data protection regulation",
    "eu regulation",
    "european union",
    "27th april 2016",
    "679/2016",
    "data processing",
    "personal data",
    "data subject",
    "lawful basis",
    "legitimate interest",
    "consent withdrawal",
    "data portability",
    "right to be forgotten",
    "data controller",
    "data processor"
  ];
  
  // Controlla se contiene keywords Italia
  const hasItalyKeywords = italyKeywords.some(keyword => 
    normalizedText.includes(keyword.toLowerCase())
  );
  
  // Controlla se contiene keywords UE
  const hasEuKeywords = euKeywords.some(keyword => 
    normalizedText.includes(keyword.toLowerCase())
  );
  
  // Controlla pattern specifici per statement Italia
  const italyPatterns = [
    /acconsento.*trattamento.*dati/i,
    /d\.lgs\.\s*196\/2003/i,
    /gdpr.*679\/16/i,
    /art\.\s*13.*gdpr/i,
    /consenso.*trattamento/i,
    /autorizzo.*dati/i,
    /privacy.*statement/i,
    /protezione.*dati/i
  ];
  
  // Controlla pattern specifici per statement UE
  const euPatterns = [
    /law\s*679\/2016/i,
    /european\s*parliament/i,
    /data\s*protection\s*regulation/i,
    /gdpr.*consent/i,
    /general\s*data\s*protection/i,
    /eu\s*regulation/i,
    /27th\s*april\s*2016/i,
    /data\s*processing/i,
    /personal\s*data/i
  ];
  
  const hasItalyPatterns = italyPatterns.some(pattern => pattern.test(normalizedText));
  const hasEuPatterns = euPatterns.some(pattern => pattern.test(normalizedText));
  
  // Controlla lunghezza del testo (gli statement di privacy sono solitamente lunghi)
  const isLongText = text.length > 50;
  
  // Controlla se contiene numeri di legge/articoli
  const hasLegalNumbers = /\b\d{3}\/\d{4}\b|\b\d{3}\/\d{2}\b|\bart\.\s*\d+\b/i.test(text);
  
  return (hasItalyKeywords || hasEuKeywords || hasItalyPatterns || hasEuPatterns) && 
         (isLongText || hasLegalNumbers);
};

// Funzione per filtrare gli statement di privacy dalle sezioni
const filterPrivacyStatements = (sections: ResumeSectionToLines): ResumeSectionToLines => {
  const filteredSections: ResumeSectionToLines = {};
  
  for (const [sectionName, lines] of Object.entries(sections)) {
    if (lines) {
      const filteredLines = lines.map(line => 
        line.filter(textItem => !isPrivacyStatement(textItem.text))
      ).filter(line => line.length > 0); // Rimuove righe vuote
      
      if (filteredLines.length > 0) {
        filteredSections[sectionName] = filteredLines;
      }
    }
  }
  
  return filteredSections;
};

// Funzione per rilevare gli statement di privacy attivi
const detectPrivacyStatements = (sections: ResumeSectionToLines): { italyPrivacy: boolean; euPrivacy: boolean } => {
  let italyPrivacy = false;
  let euPrivacy = false;
  
  // Controlla tutte le sezioni per gli statement di privacy
  for (const lines of Object.values(sections)) {
    if (lines) {
      for (const line of lines) {
        for (const textItem of line) {
          const text = textItem.text.toLowerCase().trim();
          
          // Controlla statement Italia con pattern più specifici
          const italyPatterns = [
            /acconsento.*trattamento.*dati/i,
            /d\.lgs\.\s*196\/2003/i,
            /gdpr.*679\/16/i,
            /art\.\s*13.*gdpr/i,
            /consenso.*trattamento/i,
            /autorizzo.*dati/i,
            /privacy.*statement/i,
            /protezione.*dati/i,
            /curriculum.*vitae.*gdpr/i,
            /dati.*personali.*gdpr/i
          ];
          
          // Controlla statement UE con pattern più specifici
          const euPatterns = [
            /law\s*679\/2016/i,
            /european\s*parliament/i,
            /data\s*protection\s*regulation/i,
            /gdpr.*consent/i,
            /general\s*data\s*protection/i,
            /eu\s*regulation/i,
            /27th\s*april\s*2016/i,
            /data\s*processing/i,
            /personal\s*data/i,
            /cv.*application.*recruiting/i
          ];
          
          // Controlla se il testo contiene pattern Italia
          if (italyPatterns.some(pattern => pattern.test(text))) {
            italyPrivacy = true;
          }
          
          // Controlla se il testo contiene pattern UE
          if (euPatterns.some(pattern => pattern.test(text))) {
            euPrivacy = true;
          }
          
          // Controlla anche keywords specifici per maggiore sicurezza
          if (text.includes("acconsento") && text.includes("d.lgs.196/2003")) {
            italyPrivacy = true;
          }
          
          if (text.includes("law 679/2016") && text.includes("european parliament")) {
            euPrivacy = true;
          }
        }
      }
    }
  }
  
  return { italyPrivacy, euPrivacy };
};

/**
 * Step 4. Extract resume from sections.
 *
 * This is the core of the resume parser to resume information from the sections.
 *
 * The gist of the extraction engine is a feature scoring system. Each resume attribute
 * to be extracted has a custom feature sets, where each feature set consists of a
 * feature matching function and a feature matching score if matched (feature matching
 * score can be a positive or negative number). To compute the final feature score of
 * a text item for a particular resume attribute, it would run the text item through
 * all its feature sets and sum up the matching feature scores. This process is carried
 * out for all text items within the section, and the text item with the highest computed
 * feature score is identified as the extracted resume attribute.
 */
export const extractResumeFromSections = (
  sections: ResumeSectionToLines
): Resume => {
  // Filtra gli statement di privacy dalle sezioni
  const filteredSections = filterPrivacyStatements(sections);
  
  const { profile } = extractProfile(filteredSections);
  const { educations } = extractEducation(filteredSections);
  const { workExperiences } = extractWorkExperience(filteredSections);
  const { projects } = extractProject(filteredSections);
  const { skills } = extractSkills(filteredSections);
  const { custom } = extractCustom(filteredSections);

  return {
    profile,
    educations,
    workExperiences,
    projects,
    skills,
    custom,
  };
};

// Funzione per rilevare gli statement di privacy dal PDF originale
export const detectPrivacyStatementsFromPDF = (
  sections: ResumeSectionToLines
): { italyPrivacy: boolean; euPrivacy: boolean } => {
  return detectPrivacyStatements(sections);
};
