import type { ResumeCustom } from "lib/redux/types";
import type { ResumeSectionToLines, TextItem } from "lib/parse-resume-from-pdf/types";
import { getSectionLinesByKeywords } from "lib/parse-resume-from-pdf/extract-resume-from-sections/lib/get-section-lines";
import {
  getBulletPointsFromLines,
  getDescriptionsLineIdx,
  BULLET_POINTS,
} from "lib/parse-resume-from-pdf/extract-resume-from-sections/lib/bullet-points";
import { isBold, hasLetterAndIsAllUpperCase } from "lib/parse-resume-from-pdf/extract-resume-from-sections/lib/common-features";

// Funzione per calcolare la similarità tra due testi
function calculateTextSimilarity(text1: string, text2: string): number {
  if (!text1 || !text2) return 0;
  
  // Normalizza i testi: rimuovi spazi extra, punteggiatura, converte in lowercase
  const normalize = (text: string) => text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  const normalized1 = normalize(text1);
  const normalized2 = normalize(text2);
  
  if (normalized1 === normalized2) return 1;
  
  // Calcola la similarità usando Jaccard similarity
  const words1 = new Set(normalized1.split(' '));
  const words2 = new Set(normalized2.split(' '));
  
  // Calcola intersection senza spread operator
  let intersectionCount = 0;
  words1.forEach(word => {
    if (words2.has(word)) {
      intersectionCount++;
    }
  });
  
  // Calcola union senza spread operator
  const unionCount = words1.size + words2.size - intersectionCount;
  
  return intersectionCount / unionCount;
}

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
  'certificate',
  'certified',
  'languages',
  'volunteer',
  'awards',
  'publications',
  'references',
  'portfolio',
  'activities',
  'summary',
  'profile',
  'about',
  'contact',
  'information',
  'details',
  'background',
  'qualifications',
  'competencies',
  'expertise',
  'specializations',
  'technologies',
  'tools',
  'software',
  'platforms',
  'frameworks',
  'methodologies',
  'processes',
  'procedures',
  'standards',
  'compliance',
  'regulations',
  'policies',
  'guidelines',
  'best practices',
  'industry knowledge',
  'domain expertise',
  'functional skills',
  'soft skills',
  'leadership',
  'management',
  'communication',
  'collaboration',
  'teamwork',
  'problem solving',
  'analytical thinking',
  'creative thinking',
  'innovation',
  'adaptability',
  'flexibility',
  'time management',
  'organization',
  'planning',
  'execution',
  'delivery',
  'results',
  'performance',
  'accomplishments',
  'milestones',
  'successes',
  'contributions',
  'impact',
  'value',
  'benefits',
  'outcomes',
  'deliverables',
  'artifacts',
  'work products',
  'samples',
  'examples',
  'case studies',
  'testimonials',
  'recommendations',
  'endorsements',
  'contacts',
  'networks',
  'connections',
  'relationships',
  'partnerships',
  'collaborations',
  'alliances',
  'associations',
  'memberships',
  'affiliations',
  'organizations',
  'institutions',
  'companies',
  'clients',
  'customers',
  'stakeholders',
  'partners',
  'vendors',
  'suppliers',
  'contractors',
  'consultants',
  'advisors',
  'mentors',
  'coaches',
  'trainers',
  'instructors',
  'teachers',
  'professors',
  'researchers',
  'scientists',
  'engineers',
  'developers',
  'designers',
  'architects',
  'analysts',
  'managers',
  'directors',
  'executives',
  'leaders',
  'specialists',
  'experts',
  'professionals',
  'practitioners',
  'strategists',
  'planners',
  'coordinators',
  'facilitators',
  'mediators',
  'negotiators',
  'communicators',
  'presenters',
  'speakers',
  'writers',
  'editors',
  'reviewers',
  'evaluators',
  'assessors',
  'auditors',
  'inspectors',
  'examiners',
  'investigators',
  'technicians',
  'operators',
  'administrators',
  'supervisors',
  'presidents',
  'ceos',
  'founders',
  'owners',
  'entrepreneurs',
  'innovators',
  'creators',
  'artists',
  'musicians',
  'authors',
  'journalists',
  'photographers',
  'videographers',
  'producers',
  'actors',
  'performers',
  'entertainers',
  'athletes',
  'educators',
  'lecturers',
  'doctors',
  'nurses',
  'therapists',
  'counselors',
  'social workers',
  'lawyers',
  'attorneys',
  'judges',
  'paralegals',
  'legal assistants',
  'accountants',
  'bookkeepers',
  'financial analysts',
  'investment advisors',
  'bankers',
  'insurance agents',
  'real estate agents',
  'sales representatives',
  'marketing specialists',
  'public relations',
  'communications',
  'media relations',
  'brand management',
  'product management',
  'project management',
  'program management',
  'portfolio management',
  'risk management',
  'quality management',
  'change management',
  'knowledge management',
  'information management',
  'data management',
  'content management',
  'document management',
  'records management',
  'asset management',
  'resource management',
  'talent management',
  'performance management',
  'relationship management',
  'customer relationship management',
  'supplier relationship management',
  'vendor management',
  'contract management',
  'procurement',
  'sourcing',
  'logistics',
  'supply chain',
  'operations',
  'manufacturing',
  'production',
  'quality assurance',
  'quality control',
  'testing',
  'validation',
  'verification',
  'compliance',
  'regulatory affairs',
  'legal affairs',
  'corporate affairs',
  'government affairs',
  'public affairs',
  'community affairs',
  'international affairs',
  'business affairs',
  'financial affairs',
  'administrative affairs',
  'human resources',
  'personnel',
  'staffing',
  'recruitment',
  'hiring',
  'onboarding',
  'training',
  'development',
  'learning',
  'education',
  'certification',
  'licensing',
  'accreditation',
  'qualification',
  'competency',
  'skill',
  'ability',
  'talent',
  'expertise',
  'knowledge',
  'experience',
  'background',
  'history',
  'career',
  'profession',
  'occupation',
  'job',
  'position',
  'role',
  'responsibility',
  'duty',
  'task',
  'function',
  'activity',
  'work',
  'employment',
  'service',
  'consulting',
  'freelancing',
  'contracting',
  'partnership',
  'collaboration',
  'alliance',
  'joint venture',
  'merger',
  'acquisition',
  'investment',
  'funding',
  'financing',
  'capital',
  'equity',
  'debt',
  'loan',
  'credit',
  'banking',
  'insurance',
  'real estate',
  'property',
  'asset',
  'liability',
  'revenue',
  'income',
  'profit',
  'loss',
  'expense',
  'cost',
  'budget',
  'forecast',
  'planning',
  'strategy',
  'tactics',
  'execution',
  'implementation',
  'delivery',
  'completion',
  'success',
  'achievement',
  'milestone',
  'goal',
  'objective',
  'target',
  'aim',
  'purpose',
  'mission',
  'vision',
  'values',
  'principles',
  'ethics',
  'standards',
  'policies',
  'procedures',
  'guidelines',
  'best practices',
  'methodologies',
  'frameworks',
  'models',
  'theories',
  'concepts',
  'ideas',
  'innovations',
  'inventions',
  'discoveries',
  'breakthroughs',
  'advances',
  'improvements',
  'enhancements',
  'optimizations',
  'efficiencies',
  'productivity',
  'performance',
  'results',
  'outcomes',
  'impacts',
  'benefits',
  'value',
  'return',
  'roi',
  'kpi',
  'metrics',
  'measurements',
  'analytics',
  'insights',
  'intelligence',
  'data',
  'information',
  'wisdom',
  'skills',
  'abilities',
  'talents',
  'competencies',
  'qualifications',
  'certifications',
  'licenses',
  'degrees',
  'diplomas',
  'credentials',
  'accreditations',
  'memberships',
  'affiliations',
  'associations',
  'organizations',
  'institutions',
  'companies',
  'corporations',
  'enterprises',
  'businesses',
  'firms',
  'agencies',
  'departments',
  'divisions',
  'units',
  'teams',
  'groups',
  'committees',
  'boards',
  'councils',
  'panels',
  'forums',
  'networks',
  'communities',
  'societies',
  'clubs',
  'squads',
  'crews',
  'staff',
  'personnel',
  'employees',
  'workers',
  'associates',
  'colleagues',
  'peers',
  'partners',
  'allies',
  'collaborators',
  'co-workers',
  'team members',
  'staff members',
  'personnel members',
  'employee members',
  'worker members',
  'associate members',
  'colleague members',
  'peer members',
  'partner members',
  'ally members',
  'collaborator members',
  'co-worker members',
  'team member members',
  'staff member members',
  'personnel member members',
  'employee member members',
  'worker member members',
  'associate member members',
  'colleague member members',
  'peer member members',
  'partner member members',
  'ally member members',
  'collaborator member members',
  'co-worker member members'
];

// Funzione per riconoscere se una riga è un titolo di sezione custom
const isCustomSectionTitle = (line: TextItem[]): boolean => {
  if (line.length !== 1) return false;
  
  const textItem = line[0];
  const text = textItem.text.trim();
  
  // Controlla se è in grassetto e maiuscolo (pattern comune per titoli)
  if (isBold(textItem) && hasLetterAndIsAllUpperCase(textItem)) {
    return true;
  }
  
  // Controlla se contiene parole chiave custom
  const hasCustomKeyword = CUSTOM_KEYWORDS_LOWERCASE.some(keyword => 
    text.toLowerCase().includes(keyword.toLowerCase())
  );
  
  // Controlla se è un titolo breve (max 3 parole)
  const wordCount = text.split(/\s+/).length;
  const isShortTitle = wordCount <= 3;
  
  // Controlla se inizia con maiuscola
  const startsWithCapital = /^[A-Z]/.test(text);
  
  return hasCustomKeyword && isShortTitle && startsWithCapital;
};

export const extractCustom = (sections: ResumeSectionToLines) => {
  console.log('🎯 Custom section parsing started:', {
    sections: Object.keys(sections),
    totalSections: Object.keys(sections).length
  });

  // Try to find custom sections using various keywords
  const customLines = getSectionLinesByKeywords(sections, CUSTOM_KEYWORDS_LOWERCASE);
  
  console.log('🎯 Custom lines found by keywords:', {
    customLinesCount: customLines.length,
    customLines: customLines.map(line => line.map(item => item.text))
  });
  
  // Debug: mostra da quale sezione provengono le linee custom
  if (customLines.length > 0) {
    console.log('🎯 Debug: checking which sections contain custom keywords...');
    for (const [sectionName, sectionLines] of Object.entries(sections)) {
      const hasCustomContent = sectionLines.some(line => 
        line.some(item => 
          CUSTOM_KEYWORDS_LOWERCASE.some(keyword => 
            item.text.toLowerCase().includes(keyword.toLowerCase())
          )
        )
      );
      if (hasCustomContent) {
        console.log(`🎯 Section "${sectionName}" contains custom keywords:`, sectionLines.map(line => line.map(item => item.text)));
      }
    }
  }
  
  // Filtra solo le sezioni che sono chiaramente custom (non standard resume sections)
  const customSectionNames = Object.keys(sections).filter(sectionName => {
    const lowerSectionName = sectionName.toLowerCase();
    // Escludi sezioni standard del CV
    const isStandardSection = ['profile', 'work experience', 'education', 'skills', 'projects', 'objective', 'summary'].some(standard => 
      lowerSectionName.includes(standard)
    );
    
    // Includi solo sezioni che contengono keywords custom e non sono standard
    const hasCustomKeywords = CUSTOM_KEYWORDS_LOWERCASE.some(keyword => 
      lowerSectionName.includes(keyword.toLowerCase())
    );
    
    return !isStandardSection && hasCustomKeywords;
  });
  
  console.log('🎯 Custom section names found:', customSectionNames);
  
  // Estrai solo il contenuto delle sezioni custom identificate
  let filteredCustomLines: TextItem[][] = [];
  
  // Ottieni il contenuto del summary/profilo per confronto
  const profileSummaryContent = (sections['profile'] || sections['summary'] || [])
    .flat()
    .map(item => item.text.toLowerCase())
    .join(' ');
  
  console.log('🎯 Profile/Summary content for comparison:', profileSummaryContent.substring(0, 100) + '...');
  
  for (const sectionName of customSectionNames) {
    if (sections[sectionName]) {
      const sectionContent = sections[sectionName]
        .flat()
        .map(item => item.text.toLowerCase())
        .join(' ');
      
      // Verifica se il contenuto della sezione custom è troppo simile al summary/profilo
      const similarityThreshold = 0.7; // 70% di similarità
      const similarity = calculateTextSimilarity(sectionContent, profileSummaryContent);
      
      console.log(`🎯 Checking section "${sectionName}" similarity with profile:`, {
        similarity: similarity.toFixed(2),
        threshold: similarityThreshold,
        sectionContent: sectionContent.substring(0, 100) + '...'
      });
      
      if (similarity < similarityThreshold) {
        filteredCustomLines = filteredCustomLines.concat(sections[sectionName]);
        console.log(`🎯 ✅ Adding content from custom section "${sectionName}" (similarity: ${similarity.toFixed(2)})`);
      } else {
        console.log(`🎯 ❌ Skipping section "${sectionName}" (too similar to profile: ${similarity.toFixed(2)})`);
      }
    }
  }
  
  // Se non abbiamo trovato sezioni custom specifiche, usa il metodo originale
  if (filteredCustomLines.length === 0) {
    console.log('🎯 No specific custom sections found, using original method');
    filteredCustomLines = customLines;
  } else {
    console.log('🎯 Using filtered custom sections content');
  }
  
  // Filtra le righe che contengono statement/privacy text
  const statementKeywords = [
    'this cv and application',
    'recruiting purposes',
    'privacy',
    'confidential',
    'personal information',
    'data protection',
    'consent',
    'authorization'
  ];
  
  const cleanedCustomLines = filteredCustomLines.filter(line => {
    const lineText = line.map(item => item.text).join(' ').toLowerCase();
    const hasStatement = statementKeywords.some(keyword => lineText.includes(keyword));
    
    if (hasStatement) {
      console.log('🎯 Removing statement line:', line.map(item => item.text).join(' '));
    }
    
    return !hasStatement;
  });
  
  console.log('🎯 Cleaned custom lines (removed statements):', {
    originalCount: filteredCustomLines.length,
    cleanedCount: cleanedCustomLines.length,
    removedCount: filteredCustomLines.length - cleanedCustomLines.length
  });
  
  // If no custom sections found, try to look for sections that don't match standard resume sections
  let allCustomLines = cleanedCustomLines;
  
  if (cleanedCustomLines.length === 0) {
    console.log('🎯 No custom lines found by keywords, looking for non-standard sections...');
    
    // Look for sections that might contain custom content
    // Rimuoviamo 'summary' dalle sezioni standard perché potrebbe essere una sezione custom
    const standardSections = ['profile', 'work', 'experience', 'employment', 'education', 'skills', 'projects', 'objective'];
    const allSectionNames = Object.keys(sections);
    
    console.log('🎯 All section names:', allSectionNames);
    console.log('🎯 Standard sections to exclude:', standardSections);
    
    const potentialCustomSections = allSectionNames.filter(sectionName => 
      !standardSections.some(standard => 
        sectionName.toLowerCase().includes(standard.toLowerCase())
      )
    );
    
    console.log('🎯 Potential custom sections:', potentialCustomSections);
    
    // Get lines from potential custom sections
    for (const sectionName of potentialCustomSections) {
      const sectionLines = sections[sectionName];
      if (sectionLines && sectionLines.length > 0) {
        console.log(`🎯 Adding lines from section "${sectionName}":`, sectionLines.map(line => line.map(item => item.text)));
        allCustomLines = [...allCustomLines, ...sectionLines];
      }
    }
  }
  
  console.log('🎯 Total custom lines to process:', {
    totalLines: allCustomLines.length,
    lines: allCustomLines.map(line => line.map(item => item.text))
  });
  
  // Per le sezioni custom, prendiamo tutte le righe tranne quelle che sono chiaramente statement/privacy
  // Non usiamo getDescriptionsLineIdx perché potrebbe saltare righe importanti
  const descriptionsLines = allCustomLines;
  
  // Per le sezioni custom, processiamo ogni riga individualmente per non perdere contenuto
  const descriptions: string[] = [];
  for (const line of descriptionsLines) {
    const lineText = line.map(item => item.text).join(' ').trim();
    if (lineText) {
      // Se la riga contiene bullet points, processala normalmente
      const hasBulletPoint = BULLET_POINTS.some(bullet => lineText.includes(bullet));
      if (hasBulletPoint) {
        const bulletDescriptions = getBulletPointsFromLines([line]);
        descriptions.push(...bulletDescriptions);
      } else {
        // Se non ha bullet points, aggiungi la riga così com'è
        descriptions.push(lineText);
      }
    }
  }

  console.log('🎯 Custom section parsing result:', {
    descriptionsCount: descriptions.length,
    descriptions: descriptions
  });

  const custom: ResumeCustom = {
    descriptions,
  };

  console.log('🎯 Final custom section:', custom);

  return { custom };
};