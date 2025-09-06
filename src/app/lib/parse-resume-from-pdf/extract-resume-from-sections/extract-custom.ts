import type { ResumeCustom } from "lib/redux/types";
import type { ResumeSectionToLines } from "lib/parse-resume-from-pdf/types";
import { getSectionLinesByKeywords } from "lib/parse-resume-from-pdf/extract-resume-from-sections/lib/get-section-lines";
import {
  getBulletPointsFromLines,
  getDescriptionsLineIdx,
} from "lib/parse-resume-from-pdf/extract-resume-from-sections/lib/bullet-points";

// Keywords that might indicate custom sections
const CUSTOM_KEYWORDS_LOWERCASE = [
  'custom',
  'additional',
  'other',
  'miscellaneous',
  'extra',
  'personal',
  'interests',
  'hobbies',
  'achievements',
  'certifications',
  'languages',
  'volunteer',
  'awards',
  'publications',
  'references',
  'portfolio',
  'projects',
  'activities'
];

export const extractCustom = (sections: ResumeSectionToLines) => {
  // Try to find custom sections using various keywords
  const customLines = getSectionLinesByKeywords(sections, CUSTOM_KEYWORDS_LOWERCASE);
  
  // If no custom sections found, try to look for sections that don't match standard resume sections
  let allCustomLines = customLines;
  
  if (customLines.length === 0) {
    // Look for sections that might contain custom content
    const standardSections = ['profile', 'work', 'experience', 'employment', 'education', 'skills', 'projects'];
    const allSectionNames = Object.keys(sections);
    
    const potentialCustomSections = allSectionNames.filter(sectionName => 
      !standardSections.some(standard => 
        sectionName.toLowerCase().includes(standard.toLowerCase())
      )
    );
    
    // Get lines from potential custom sections
    for (const sectionName of potentialCustomSections) {
      const sectionLines = sections[sectionName];
      if (sectionLines && sectionLines.length > 0) {
        allCustomLines = [...allCustomLines, ...sectionLines];
      }
    }
  }
  
  const descriptionsLineIdx = getDescriptionsLineIdx(allCustomLines) ?? 0;
  const descriptionsLines = allCustomLines.slice(descriptionsLineIdx);
  const descriptions = getBulletPointsFromLines(descriptionsLines);

  const custom: ResumeCustom = {
    descriptions,
  };

  return { custom };
};
