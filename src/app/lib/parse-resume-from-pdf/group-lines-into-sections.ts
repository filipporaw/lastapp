import type { ResumeKey } from "lib/redux/types";
import type {
  Line,
  Lines,
  ResumeSectionToLines,
} from "lib/parse-resume-from-pdf/types";
import {
  hasLetterAndIsAllUpperCase,
  hasOnlyLettersSpacesAmpersands,
  isBold,
} from "lib/parse-resume-from-pdf/extract-resume-from-sections/lib/common-features";

export const PROFILE_SECTION: ResumeKey = "profile";

/**
 * Step 3. Group lines into sections
 *
 * Every section (except the profile section) starts with a section title that
 * takes up the entire line. This is a common pattern not just in resumes but
 * also in books and blogs. The resume parser uses this pattern to group lines
 * into the closest section title above these lines.
 */
export const groupLinesIntoSections = (lines: Lines) => {
  let sections: ResumeSectionToLines = {};
  let sectionName: string = PROFILE_SECTION;
  let sectionLines = [];
  
  console.log('📋 Grouping lines into sections - Total lines:', lines.length);
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const text = line[0]?.text.trim();
    const isTitle = isSectionTitle(line, i);
    
    console.log(`📋 Line ${i}: "${text}" - Is section title: ${isTitle}`);
    
    if (isTitle) {
      console.log(`📋 Creating section "${sectionName}" with ${sectionLines.length} lines`);
      sections[sectionName] = [...sectionLines];
      sectionName = text;
      sectionLines = [];
    } else {
      sectionLines.push(line);
    }
  }
  if (sectionLines.length > 0) {
    console.log(`📋 Creating final section "${sectionName}" with ${sectionLines.length} lines`);
    sections[sectionName] = [...sectionLines];
  }
  
  console.log('📋 Final sections:', Object.keys(sections));
  return sections;
};

const SECTION_TITLE_PRIMARY_KEYWORDS = [
  "experience",
  "education",
  "project",
  "skill",
];
const SECTION_TITLE_SECONDARY_KEYWORDS = [
  "job",
  "course",
  "extracurricular",
  "objective",
  "summary", // LinkedIn generated resume has a summary section
  "award",
  "honor",
  "project",
  "certification",
  "certificate",
  "certified",
  "languages",
  "volunteer",
  "publications",
  "references",
  "portfolio",
  "activities",
  "interests",
  "hobbies",
  "achievements",
  "additional",
  "other",
  "miscellaneous",
  "extra",
  "personal",
];
const SECTION_TITLE_KEYWORDS = [
  ...SECTION_TITLE_PRIMARY_KEYWORDS,
  ...SECTION_TITLE_SECONDARY_KEYWORDS,
];

const isSectionTitle = (line: Line, lineNumber: number) => {
  const isFirstTwoLines = lineNumber < 2;
  const hasMoreThanOneItemInLine = line.length > 1;
  const hasNoItemInLine = line.length === 0;
  if (isFirstTwoLines || hasMoreThanOneItemInLine || hasNoItemInLine) {
    return false;
  }

  const textItem = line[0];

  // The main heuristic to determine a section title is to check if the text is double emphasized
  // to be both bold and all uppercase, which is generally true for a well formatted resume
  if (isBold(textItem) && hasLetterAndIsAllUpperCase(textItem)) {
    return true;
  }

  // The following is a fallback heuristic to detect section title if it includes a keyword match
  // (This heuristics is not well tested and may not work well)
  const text = textItem.text.trim();
  const textHasAtMost3Words =
    text.split(" ").filter((s) => s !== "&").length <= 3; // Increased from 2 to 3 for custom sections
  const startsWithCapitalLetter = /[A-Z]/.test(text.slice(0, 1));

  if (
    textHasAtMost3Words &&
    hasOnlyLettersSpacesAmpersands(textItem) &&
    startsWithCapitalLetter &&
    SECTION_TITLE_KEYWORDS.some((keyword) =>
      text.toLowerCase().includes(keyword)
    )
  ) {
    return true;
  }

  return false;
};
