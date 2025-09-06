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
  const italyStatement = "Acconsento al trattamento dei dati personali presenti nel mio curriculum vitae in base all'art.13 del D.Lgs.196/2003 e all'art.13 GDPR 679/16.";
  const euStatement = "According to law 679/2016 of the Regulation of the European Parliament of 27th April 2016, I hereby express my consent to process and use my data provided in this CV and application for recruiting purposes.";
  
  // Controlla se il testo contiene gli statement di privacy (anche parzialmente)
  const normalizedText = text.toLowerCase().trim();
  const normalizedItalyStatement = italyStatement.toLowerCase();
  const normalizedEuStatement = euStatement.toLowerCase();
  
  // Controlla se contiene parti significative degli statement
  const italyKeywords = ["acconsento", "trattamento", "dati personali", "curriculum vitae", "d.lgs.196/2003", "gdpr"];
  const euKeywords = ["law 679/2016", "regulation", "european parliament", "consent", "process", "data", "cv", "recruiting"];
  
  const hasItalyKeywords = italyKeywords.some(keyword => normalizedText.includes(keyword));
  const hasEuKeywords = euKeywords.some(keyword => normalizedText.includes(keyword));
  
  return hasItalyKeywords || hasEuKeywords || 
         normalizedText.includes(normalizedItalyStatement.substring(0, 50)) ||
         normalizedText.includes(normalizedEuStatement.substring(0, 50));
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
          
          // Controlla statement Italia
          if (text.includes("acconsento") && text.includes("d.lgs.196/2003")) {
            italyPrivacy = true;
          }
          
          // Controlla statement UE
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
