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
const SCHOOLS = [
  // English
  'College', 'University', 'Institute', 'School', 'Academy', 'BASIS', 'Magnet', 
  'High School', 'Elementary', 'Middle School', 'Technical', 'Community College', 
  'State University', 'Private School', 'Public School', 'International School', 
  'Boarding School', 'Prep School', 'Grammar School', 'Primary School', 
  'Secondary School', 'Vocational School', 'Trade School', 'Art School', 
  'Music School', 'Dance School', 'Theater School', 'Film School', 'Design School', 
  'Business School', 'Law School', 'Medical School', 'Dental School', 'Nursing School', 
  'Engineering School', 'Architecture School', 'Agriculture School', 'Forestry School', 
  'Maritime School', 'Military School', 'Naval Academy', 'Air Force Academy', 
  'West Point', 'Annapolis', 'Coast Guard Academy', 'Merchant Marine Academy', 
  'Military Academy', 'Service Academy', 'War College', 'Staff College', 
  'Command College', 'Defense College', 'National Defense University', 
  'Naval War College', 'Army War College', 'Air War College', 'Marine Corps University', 
  'Joint Forces Staff College', 'National War College', 'Industrial College', 
  'Armed Forces Staff College', 'Joint Military Intelligence College', 
  'Defense Language Institute', 'Defense Acquisition University', 
  'Defense Systems Management College', 'Defense Institute of Security Assistance Management', 
  'Defense Equal Opportunity Management Institute', 'Defense Information School', 
  'Defense Media Activity', 'Defense Information Systems Agency', 'Defense Intelligence Agency', 
  'Defense Logistics Agency', 'Defense Contract Management Agency', 
  'Defense Finance and Accounting Service', 'Defense Health Agency', 
  'Defense Human Resources Activity',
  
  // Italian
  'Università', 'Universita', 'Uni', 'Politecnico', 'Istituto', 'Accademia', 
  'Scuola', 'Liceo', 'Tecnico', 'Professionale', 'Superiore', 'Magistrale', 
  'Specializzazione', 'Master', 'Dottorato', 'PhD', 'Laurea', 'Diploma', 
  'Certificazione', 'Corso', 'Formazione', 'Educazione', 'Studi', 'Facoltà', 
  'Dipartimento', 'Campus', 'Ateneo', 'Conservatorio', 'Accademia di Belle Arti',
  
  // Other languages
  'Universidad', 'Université', 'Universität', 'Universiteit', 'Uniwersytet',
  'Universidade', 'Universitet', 'Universitetet', 'Yliopisto', 'Egyetem'
];

const hasSchool = (item: TextItem) => {
  const text = item.text.trim();
  
  // Escludi esplicitamente i gradi per evitare confusione
  const isDegree = DEGREES.some((degree) => text.toLowerCase().includes(degree.toLowerCase()));
  if (isDegree) {
    console.log('🚫 School excluded (contains degree keyword):', text, 'matched degree:', DEGREES.find(degree => text.toLowerCase().includes(degree.toLowerCase())));
    return false; // Non è una scuola se contiene keywords di gradi
  }
  
  // Controlla se contiene keywords di scuole
  const hasSchoolKeyword = SCHOOLS.some((school) => text.toLowerCase().includes(school.toLowerCase()));
  
  // Pattern più flessibili per riconoscere nomi di scuole
  const schoolPatterns = [
    // Pattern base per scuole (es. "Harvard University", "MIT")
    /^[A-Z][a-zA-Z\s&.,-]+(?:College|University|Institute|School|Academy|Uni|Politecnico|Istituto|Accademia)$/i,
    // Pattern per scuole con "of" (es. "University of California", "University of Pavia")
    /^[A-Z][a-zA-Z\s&.,-]+of\s+[A-Z][a-zA-Z\s&.,-]+$/i,
    // Pattern per scuole italiane con "degli Studi" (es. "Università degli Studi di Milano")
    /^[A-Z][a-zA-Z\s&.,-]+degli\s+Studi\s+di\s+[A-Z][a-zA-Z\s&.,-]+$/i,
    // Pattern per scuole italiane con "di" (es. "Politecnico di Milano")
    /^[A-Z][a-zA-Z\s&.,-]+di\s+[A-Z][a-zA-Z\s&.,-]+$/i,
    // Pattern per scuole italiane con "del" (es. "Istituto del Design")
    /^[A-Z][a-zA-Z\s&.,-]+del\s+[A-Z][a-zA-Z\s&.,-]+$/i,
    // Pattern per scuole italiane con "della" (es. "Accademia della Moda")
    /^[A-Z][a-zA-Z\s&.,-]+della\s+[A-Z][a-zA-Z\s&.,-]+$/i,
    // Pattern per scuole italiane con "delle" (es. "Scuola delle Arti")
    /^[A-Z][a-zA-Z\s&.,-]+delle\s+[A-Z][a-zA-Z\s&.,-]+$/i,
    // Pattern per scuole con abbreviazioni (es. "UCLA", "MIT", "NYU")
    /^[A-Z]{2,6}$/,
    // Pattern per scuole con numeri (es. "University of California, Berkeley")
    /^[A-Z][a-zA-Z\s&.,-]*(?:College|University|Institute|School|Academy)[\s,]*[A-Z][a-zA-Z\s&.,-]*$/i,
    // Pattern per scuole con parentesi (es. "University of Pavia (Pavia, IT)")
    /University.*\([^)]+\)/i,
    // Pattern specifico per "University of Pavia (Pavia, IT)"
    /^University of Pavia \(Pavia, IT\)$/i,
    // Pattern più generico per "University of [City]" senza parentesi
    /^University of [A-Z][a-zA-Z\s&.,-]+$/i,
    // Pattern per "Università degli Studi di [City]" senza parentesi
    /^Università degli Studi di [A-Z][a-zA-Z\s&.,-]+$/i,
    // Pattern per "Università di [City]"
    /^Università di [A-Z][a-zA-Z\s&.,-]+$/i,
    // Pattern per scuole che contengono "Pavia" specificamente
    /.*Pavia.*/i
  ];
  
  const matchesPattern = schoolPatterns.some(pattern => pattern.test(text));
  
  // Debug logging
  if (hasSchoolKeyword || matchesPattern) {
    console.log('🎓 School detected:', text, { hasSchoolKeyword, matchesPattern });
  } else {
  // Debug specifico per "University of Pavia" e "Università degli Studi di Pavia"
  if (text.toLowerCase().includes('pavia') || (text.toLowerCase().includes('university') && text.toLowerCase().includes('pavia'))) {
    console.log('🔍 Debug University of Pavia:', {
      text,
      hasSchoolKeyword,
      matchesPattern,
      schoolPatterns: schoolPatterns.map((pattern, index) => ({
        index,
        pattern: pattern.toString(),
        matches: pattern.test(text)
      }))
    });
  }
  
  // Debug generale per tutti i testi che contengono "university" o "università"
  if (text.toLowerCase().includes('university') || text.toLowerCase().includes('università')) {
    console.log('🔍 Debug any university:', {
      text,
      hasSchoolKeyword,
      matchesPattern,
      isDegree: DEGREES.some((degree) => text.toLowerCase().includes(degree.toLowerCase()))
    });
  }
  }
  
  return hasSchoolKeyword || matchesPattern;
};
// prettier-ignore
const DEGREES = [
  // English
  "Associate", "Bachelor", "Master", "PhD", "Ph.", "Doctorate", "Doctor", 
  "Diploma", "Certificate", "Certification", "License", "Licensure", 
  "B.A.", "B.S.", "B.B.A.", "B.E.", "B.F.A.", "B.M.", "B.Arch", "B.Ed", "B.Sc", 
  "M.A.", "M.S.", "M.B.A.", "M.E.", "M.F.A.", "M.M.", "M.Arch", "M.Ed", "M.Sc", 
  "M.D.", "J.D.", "D.D.S.", "D.V.M.", "D.Pharm", "D.O.", "D.P.T.", "D.N.P.", 
  "D.S.W.", "D.Min", "D.Div", "D.M.A.", "D.M.", "D.Mus", "D.Litt", "D.Sc", 
  "D.Eng", "D.Arch", "D.A.", "D.B.A.", "D.P.A.", "D.P.H.", "D.P.S.", "D.R.E.", 
  "D.S.", "D.Sci", "D.S.W.", "D.Tech", "D.U.", "D.V.M.", "D.W.", "D.X.", "D.Y.", "D.Z.", 
  "A.A.", "A.S.", "A.A.S.", "A.F.A.", "A.O.S.", "A.G.S.", "A.T.", "A.E.", "A.B.", "A.M.", 
  "A.D.", "A.D.N.", "A.D.A.", "A.D.T.", "A.D.E.", "A.D.F.", "A.D.G.", "A.D.H.", 
  "A.D.I.", "A.D.J.", "A.D.K.", "A.D.L.", "A.D.M.", "A.D.N.", "A.D.O.", "A.D.P.", 
  "A.D.Q.", "A.D.R.", "A.D.S.", "A.D.T.", "A.D.U.", "A.D.V.", "A.D.W.", "A.D.X.", "A.D.Y.", "A.D.Z.",
  
  // Italian
  "Laurea", "Laurea Triennale", "Laurea Magistrale", "Laurea Specialistica", 
  "Dottorato", "Dottorato di Ricerca", "Master", "Master Universitario", 
  "Specializzazione", "Specializzazione Medica", "Specializzazione Veterinaria", 
  "Diploma", "Diploma di Laurea", "Diploma Accademico", "Certificazione", 
  "Attestato", "Abilitazione", "Esame di Stato", "Esame di Abilitazione", 
  "Corso", "Corso di Laurea", "Corso di Specializzazione", "Corso di Perfezionamento", 
  "Formazione", "Formazione Continua", "Aggiornamento Professionale", 
  "Tirocinio", "Stage", "Tesi", "Tesi di Laurea", "Tesi di Dottorato", 
  "Progetto", "Progetto di Laurea", "Progetto Finale", "Esame", "Esami", 
  "Crediti", "Crediti Formativi", "CFU", "Voto", "Voto di Laurea", 
  "Media", "Media Ponderata", "Lode", "Cum Laude", "Magna Cum Laude", 
  "Summa Cum Laude", "110 e Lode", "110/110", "30 e Lode", "30/30"
];

const hasDegree = (item: TextItem) => {
  const text = item.text.trim();
  
  // Escludi esplicitamente le scuole per evitare confusione
  const isSchool = SCHOOLS.some((school) => text.toLowerCase().includes(school.toLowerCase()));
  if (isSchool && !text.toLowerCase().includes('degree') && !text.toLowerCase().includes('master') && !text.toLowerCase().includes('bachelor')) {
    return false; // Non è un grado se contiene keywords di scuole ma non di gradi
  }
  
  // Controlla se contiene keywords di gradi
  const hasDegreeKeyword = DEGREES.some((degree) => text.toLowerCase().includes(degree.toLowerCase()));
  
  // Pattern più flessibili per riconoscere gradi
  const degreePatterns = [
    // Pattern per gradi con abbreviazioni (es. B.S., M.A., PhD)
    /^[ABMDP][A-Z\.]+\s*[A-Za-z\s]*$/i,
    // Pattern per gradi completi (es. Bachelor of Science, Master of Arts)
    /^(Bachelor|Master|Doctor|Associate)\s+of\s+[A-Za-z\s]+$/i,
    // Pattern per gradi con specializzazione (es. MBA, JD, MD)
    /^[A-Z]{2,4}$/,
    // Pattern per gradi italiani (es. Laurea in Informatica, Diploma di Perito)
    /^(Laurea|Diploma|Master|Dottorato|Specializzazione)\s+(in|di|di\s+Perito)\s+[A-Za-z\s]+$/i,
    // Pattern per gradi con voti (es. Bachelor of Science, 3.8 GPA)
    /^(Bachelor|Master|Doctor|Associate|Laurea|Diploma).*$/i,
    // Pattern per gradi con anni (es. B.S. Computer Science 2020)
    /^[ABMDP][A-Z\.]+\s+[A-Za-z\s]+\s+\d{4}$/i,
    // Pattern specifico per "Master's Degree in [subject]"
    /^Master'?s?\s+Degree\s+in\s+[A-Za-z\s]+$/i,
    // Pattern specifico per "Bachelor's Degree in [subject]"
    /^Bachelor'?s?\s+Degree\s+in\s+[A-Za-z\s]+$/i
  ];
  
  const matchesPattern = degreePatterns.some(pattern => pattern.test(text));
  
  // Debug logging
  if (hasDegreeKeyword || matchesPattern) {
    console.log('🎓 Degree detected:', text, { hasDegreeKeyword, matchesPattern });
  }
  
  return hasDegreeKeyword || matchesPattern;
};
const matchGPA = (item: TextItem) => {
  // Pattern più specifici per GPA
  const gpaPatterns = [
    /^[0-4]\.\d{1,2}$/, // GPA standard (0.00-4.00)
    /^[0-4]\.\d{1,2}\s*\/\s*4\.0$/, // GPA con denominatore (3.5/4.0)
    /^[0-4]\.\d{1,2}\s*out\s*of\s*4\.0$/i, // GPA con "out of"
    /^GPA:\s*[0-4]\.\d{1,2}$/i, // GPA con etichetta
    /^Grade\s*Point\s*Average:\s*[0-4]\.\d{1,2}$/i, // GPA completo
    // Pattern per GPA italiani (110/110, 30/30, etc.)
    /^110\/110$/i, // Laurea italiana
    /^30\/30$/i, // Esame italiano
    /^110\s*e\s*Lode$/i, // Laurea con lode
    /^30\s*e\s*Lode$/i, // Esame con lode
    /^[0-9]{1,3}\/[0-9]{1,3}$/, // Pattern generico per voti italiani
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
    // Pattern per voti italiani
    /^110\/110$/i, // Laurea italiana
    /^30\/30$/i, // Esame italiano
    /^110\s*e\s*Lode$/i, // Laurea con lode
    /^30\s*e\s*Lode$/i, // Esame con lode
    /^[0-9]{1,3}\/[0-9]{1,3}$/, // Pattern generico per voti italiani
  ];
  
  if (gradePatterns.some(pattern => pattern.test(text))) {
    const match = text.match(/[0-4]\.\d{1,2}|110\/110|30\/30|110\s*e\s*Lode|30\s*e\s*Lode|[0-9]{1,3}\/[0-9]{1,3}/i);
    if (match) {
      return match;
    }
  }
  
  return null;
};

const SCHOOL_FEATURE_SETS: FeatureSet[] = [
  [hasSchool, 4],
  [hasDegree, -2], // Ridotto da -4 a -2 per essere meno restrittivo
  [hasNumber, -1], // Ridotto da -3 a -1
  [hasComma, -1], // Ridotto da -2 a -1
];

const DEGREE_FEATURE_SETS: FeatureSet[] = [
  [hasDegree, 4],
  [hasSchool, -2], // Ridotto da -4 a -2 per essere meno restrittivo
  [hasNumber, -1], // Ridotto da -2 a -1
  [hasComma, -1],
];

const GPA_FEATURE_SETS: FeatureSet[] = [
  [matchGrade, 4, true], // Usa matchGrade che restituisce RegExpMatchArray | null
  [hasComma, -3],
  [hasLetter, -4],
  [hasSchool, -4], // Le scuole non dovrebbero essere GPA
  [hasDegree, -4], // I gradi non dovrebbero essere GPA
  [hasNumber, -2], // Penalizza numeri generici (solo se non sono GPA validi)
];

export const extractEducation = (sections: ResumeSectionToLines) => {
  const educations: ResumeEducation[] = [];
  const educationsScores = [];
  const lines = getSectionLinesByKeywords(sections, ["education"]);
  const subsections = divideSectionIntoSubsections(lines);
  
  console.log('🎓 Education parsing started:', {
    linesFound: lines.length,
    subsections: subsections.length,
    sections: Object.keys(sections)
  });
  
  
  for (const subsectionLines of subsections) {
    const textItems = subsectionLines.flat();
    
    console.log('🎓 Processing education subsection:', {
      textItems: textItems.map(item => item.text),
      subsectionLines: subsectionLines.map(line => line.map(item => item.text))
    });
    
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
    
    console.log('🎓 School extraction result:', { school, schoolScores });
    
    // Escludi il testo già estratto come school per evitare sovrapposizioni
    const nonSchoolItems = nonDateItems.filter(item => item.text.trim() !== school?.trim());
    
    const [degree, degreeScores] = getTextWithHighestFeatureScore(
      nonSchoolItems,
      DEGREE_FEATURE_SETS
    );
    
    console.log('🎓 Degree extraction result:', { degree, degreeScores });
    
    // Escludi il testo già estratto come degree per evitare sovrapposizioni
    const nonDegreeItems = nonSchoolItems.filter(item => item.text.trim() !== degree?.trim());
    
    const [gpa, gpaScores] = getTextWithHighestFeatureScore(
      nonDegreeItems,
      GPA_FEATURE_SETS
    );

    // Controlla se il GPA estratto è realmente valido
    let validGPA = "";
    if (gpa && gpa.trim()) {
      const gpaText = gpa.trim();
      // Solo accetta GPA se corrisponde esattamente ai pattern validi
      const isValidGPA = matchGPA({ text: gpaText } as TextItem) || matchGrade({ text: gpaText } as TextItem);
      if (isValidGPA) {
        validGPA = gpaText;
      }
    }

    let descriptions: string[] = [];
    const descriptionsLineIdx = getDescriptionsLineIdx(subsectionLines);
    if (descriptionsLineIdx !== undefined) {
      const descriptionsLines = subsectionLines.slice(descriptionsLineIdx);
      descriptions = getBulletPointsFromLines(descriptionsLines);
    }

    const education = { school, degree, gpa: validGPA, date, descriptions };
    
    console.log('🎓 Final education entry:', education);
    
    educations.push(education);
    educationsScores.push({
      schoolScores,
      degreeScores,
      gpaScores,
      dateScores,
    });
  }

  console.log('🎓 Education parsing completed:', {
    totalEducations: educations.length,
    educations: educations
  });

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
