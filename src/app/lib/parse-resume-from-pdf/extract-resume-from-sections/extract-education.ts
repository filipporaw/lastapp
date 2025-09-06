import type {
  TextItem,
  FeatureSet,
  ResumeSectionToLines,
} from "lib/parse-resume-from-pdf/types";
import type { ResumeEducation } from "lib/redux/types";
import { getSectionLinesByKeywords } from "lib/parse-resume-from-pdf/extract-resume-from-sections/lib/get-section-lines";
import { divideSectionIntoSubsections } from "lib/parse-resume-from-pdf/extract-resume-from-sections/lib/subsections";
import {
  DATE_FEATURE_SETS,
  hasComma,
  hasLetter,
  hasNumber,
} from "lib/parse-resume-from-pdf/extract-resume-from-sections/lib/common-features";
import { getTextWithHighestFeatureScore } from "lib/parse-resume-from-pdf/extract-resume-from-sections/lib/feature-scoring-system";
import {
  getBulletPointsFromLines,
  getDescriptionsLineIdx,
} from "lib/parse-resume-from-pdf/extract-resume-from-sections/lib/bullet-points";

/**
 *              Unique Attribute
 * School       Has school
 * Degree       Has degree
 * GPA          Has number
 */

// prettier-ignore
const SCHOOLS = ['College', 'University', 'Institute', 'School', 'Academy', 'BASIS', 'Magnet', 'High School', 'Elementary', 'Middle School', 'Technical', 'Community College', 'State University', 'Private School', 'Public School', 'International School', 'Boarding School', 'Prep School', 'Grammar School', 'Primary School', 'Secondary School', 'Vocational School', 'Trade School', 'Art School', 'Music School', 'Dance School', 'Theater School', 'Film School', 'Design School', 'Business School', 'Law School', 'Medical School', 'Dental School', 'Nursing School', 'Engineering School', 'Architecture School', 'Agriculture School', 'Forestry School', 'Maritime School', 'Military School', 'Naval Academy', 'Air Force Academy', 'West Point', 'Annapolis', 'Coast Guard Academy', 'Merchant Marine Academy', 'Military Academy', 'Service Academy', 'War College', 'Staff College', 'Command College', 'Defense College', 'National Defense University', 'Naval War College', 'Army War College', 'Air War College', 'Marine Corps University', 'Joint Forces Staff College', 'National War College', 'Industrial College', 'Armed Forces Staff College', 'Joint Military Intelligence College', 'Defense Language Institute', 'Defense Acquisition University', 'Defense Systems Management College', 'Defense Institute of Security Assistance Management', 'Defense Equal Opportunity Management Institute', 'Defense Information School', 'Defense Media Activity', 'Defense Information Systems Agency', 'Defense Intelligence Agency', 'Defense Logistics Agency', 'Defense Contract Management Agency', 'Defense Finance and Accounting Service', 'Defense Health Agency', 'Defense Human Resources Activity', 'Defense Information Systems Agency', 'Defense Intelligence Agency', 'Defense Logistics Agency', 'Defense Contract Management Agency', 'Defense Finance and Accounting Service', 'Defense Health Agency', 'Defense Human Resources Activity'];

const hasSchool = (item: TextItem) =>
  SCHOOLS.some((school) => item.text.toLowerCase().includes(school.toLowerCase())) ||
  // Pattern per riconoscere nomi di scuole comuni
  /^[A-Z][a-zA-Z\s&]+(?:College|University|Institute|School|Academy)$/i.test(item.text) ||
  // Pattern per scuole con "of" (es. "University of California")
  /^[A-Z][a-zA-Z\s&]+of\s+[A-Z][a-zA-Z\s&]+$/i.test(item.text);
// prettier-ignore
const DEGREES = ["Associate", "Bachelor", "Master", "PhD", "Ph.", "Doctorate", "Doctor", "Diploma", "Certificate", "Certification", "License", "Licensure", "B.A.", "B.S.", "B.B.A.", "B.E.", "B.F.A.", "B.M.", "B.Arch", "B.Ed", "B.Sc", "M.A.", "M.S.", "M.B.A.", "M.E.", "M.F.A.", "M.M.", "M.Arch", "M.Ed", "M.Sc", "M.D.", "J.D.", "D.D.S.", "D.V.M.", "D.Pharm", "D.O.", "D.P.T.", "D.N.P.", "D.S.W.", "D.Min", "D.Div", "D.M.A.", "D.M.", "D.Mus", "D.Litt", "D.Sc", "D.Eng", "D.Arch", "D.A.", "D.B.A.", "D.P.A.", "D.P.H.", "D.P.S.", "D.R.E.", "D.S.", "D.Sci", "D.S.W.", "D.Tech", "D.U.", "D.V.M.", "D.W.", "D.X.", "D.Y.", "D.Z.", "A.A.", "A.S.", "A.A.S.", "A.F.A.", "A.O.S.", "A.G.S.", "A.T.", "A.E.", "A.B.", "A.M.", "A.D.", "A.D.N.", "A.D.A.", "A.D.T.", "A.D.E.", "A.D.F.", "A.D.G.", "A.D.H.", "A.D.I.", "A.D.J.", "A.D.K.", "A.D.L.", "A.D.M.", "A.D.N.", "A.D.O.", "A.D.P.", "A.D.Q.", "A.D.R.", "A.D.S.", "A.D.T.", "A.D.U.", "A.D.V.", "A.D.W.", "A.D.X.", "A.D.Y.", "A.D.Z."];

const hasDegree = (item: TextItem) =>
  DEGREES.some((degree) => item.text.toLowerCase().includes(degree.toLowerCase())) ||
  // Pattern per gradi con abbreviazioni (es. B.S., M.A., PhD)
  /^[ABMDP][A-Z\.]+\s*[A-Za-z\s]*$/i.test(item.text) ||
  // Pattern per gradi completi (es. Bachelor of Science, Master of Arts)
  /^(Bachelor|Master|Doctor|Associate)\s+of\s+[A-Za-z\s]+$/i.test(item.text) ||
  // Pattern per gradi con specializzazione (es. MBA, JD, MD)
  /^[A-Z]{2,4}$/.test(item.text);
const matchGPA = (item: TextItem) => {
  // Pattern più specifici per GPA
  const gpaPatterns = [
    /^[0-4]\.\d{1,2}$/, // GPA standard (0.00-4.00)
    /^[0-4]\.\d{1,2}\s*\/\s*4\.0$/, // GPA con denominatore (3.5/4.0)
    /^[0-4]\.\d{1,2}\s*out\s*of\s*4\.0$/i, // GPA con "out of"
    /^GPA:\s*[0-4]\.\d{1,2}$/i, // GPA con etichetta
    /^Grade\s*Point\s*Average:\s*[0-4]\.\d{1,2}$/i, // GPA completo
  ];
  
  return gpaPatterns.some(pattern => pattern.test(item.text.trim()));
};

const matchGrade = (item: TextItem) => {
  // Solo numeri che sembrano davvero GPA, non qualsiasi numero
  const text = item.text.trim();
  
  // Pattern molto specifici per voti/GPA
  const gradePatterns = [
    /^[0-4]\.\d{1,2}$/, // GPA standard
    /^[0-4]\.\d{1,2}\s*\/\s*4\.0$/, // GPA con denominatore
    /^[0-4]\.\d{1,2}\s*out\s*of\s*4\.0$/i, // GPA con "out of"
    /^GPA:\s*[0-4]\.\d{1,2}$/i, // GPA con etichetta
    /^Grade:\s*[0-4]\.\d{1,2}$/i, // Grade con etichetta
    /^[0-4]\.\d{1,2}\s*GPA$/i, // GPA alla fine
  ];
  
  if (gradePatterns.some(pattern => pattern.test(text))) {
    const match = text.match(/[0-4]\.\d{1,2}/);
    if (match) {
      return match;
    }
  }
  
  return null;
};

const SCHOOL_FEATURE_SETS: FeatureSet[] = [
  [hasSchool, 4],
  [hasDegree, -4],
  [hasNumber, -3],
  [hasComma, -2], // Le date spesso hanno virgole
];

const DEGREE_FEATURE_SETS: FeatureSet[] = [
  [hasDegree, 4],
  [hasSchool, -4],
  [hasNumber, -2], // GPA può avere numeri
  [hasComma, -1],
];

const GPA_FEATURE_SETS: FeatureSet[] = [
  [matchGPA, 4, true],
  [matchGrade, 3, true],
  [hasComma, -3],
  [hasLetter, -4],
  [hasSchool, -4], // Le scuole non dovrebbero essere GPA
  [hasDegree, -4], // I gradi non dovrebbero essere GPA
];

export const extractEducation = (sections: ResumeSectionToLines) => {
  const educations: ResumeEducation[] = [];
  const educationsScores = [];
  const lines = getSectionLinesByKeywords(sections, ["education"]);
  const subsections = divideSectionIntoSubsections(lines);
  
  for (const subsectionLines of subsections) {
    const textItems = subsectionLines.flat();
    
    // Estrai prima la data per escluderla dagli altri campi
    const [date, dateScores] = getTextWithHighestFeatureScore(
      textItems,
      DATE_FEATURE_SETS
    );
    
    // Filtra gli elementi che non sono date per evitare confusione
    const nonDateItems = textItems.filter(item => 
      !DATE_FEATURE_SETS.some(([feature]) => feature(item))
    );
    
    const [school, schoolScores] = getTextWithHighestFeatureScore(
      nonDateItems,
      SCHOOL_FEATURE_SETS
    );
    
    const [degree, degreeScores] = getTextWithHighestFeatureScore(
      nonDateItems,
      DEGREE_FEATURE_SETS
    );
    
    const [gpa, gpaScores] = getTextWithHighestFeatureScore(
      nonDateItems,
      GPA_FEATURE_SETS
    );

    let descriptions: string[] = [];
    const descriptionsLineIdx = getDescriptionsLineIdx(subsectionLines);
    if (descriptionsLineIdx !== undefined) {
      const descriptionsLines = subsectionLines.slice(descriptionsLineIdx);
      descriptions = getBulletPointsFromLines(descriptionsLines);
    }

    educations.push({ school, degree, gpa, date, descriptions });
    educationsScores.push({
      schoolScores,
      degreeScores,
      gpaScores,
      dateScores,
    });
  }

  if (educations.length !== 0) {
    const coursesLines = getSectionLinesByKeywords(sections, ["course"]);
    if (coursesLines.length !== 0) {
      educations[0].descriptions.push(
        "Courses: " +
          coursesLines
            .flat()
            .map((item) => item.text)
            .join(" ")
      );
    }
  }

  return {
    educations,
    educationsScores,
  };
};
