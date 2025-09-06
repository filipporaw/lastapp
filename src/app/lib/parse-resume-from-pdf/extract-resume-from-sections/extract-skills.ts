import type { ResumeSkills, FeaturedSkill } from "lib/redux/types";
import type { ResumeSectionToLines, TextItem } from "lib/parse-resume-from-pdf/types";
import { deepClone } from "lib/deep-clone";
import { getSectionLinesByKeywords } from "lib/parse-resume-from-pdf/extract-resume-from-sections/lib/get-section-lines";
import { initialFeaturedSkills } from "lib/redux/resumeSlice";
import {
  getBulletPointsFromLines,
  getDescriptionsLineIdx,
} from "lib/parse-resume-from-pdf/extract-resume-from-sections/lib/bullet-points";

// Funzioni per riconoscere diversi pattern di rating
const hasRatingPattern = (text: string): number | null => {
  // Pattern 1: Cerchi/pallini (●○○○○, ●●●○○, etc.) - migliorato
  const circlePattern = /[●○]{1,5}$/;
  const circleMatch = text.match(circlePattern);
  if (circleMatch) {
    const circles = circleMatch[0];
    const filledCircles = (circles.match(/●/g) || []).length;
    return filledCircles;
  }
  
  // Pattern 1b: Cerchi/pallini nel mezzo del testo (React ●●●●○)
  const circlePatternMid = /[●○]{1,5}/;
  const circleMatchMid = text.match(circlePatternMid);
  if (circleMatchMid) {
    const circles = circleMatchMid[0];
    const filledCircles = (circles.match(/●/g) || []).length;
    if (filledCircles > 0) {
      return filledCircles;
    }
  }
  
  // Pattern 2: Stelle (★★★★☆, ★★★☆☆, etc.)
  const starPattern = /[★☆]{1,5}$/;
  const starMatch = text.match(starPattern);
  if (starMatch) {
    const stars = starMatch[0];
    return stars.split('★').length - 1; // Conta le stelle piene
  }
  
  // Pattern 3: Numeri (5/5, 4/5, etc.)
  const numberPattern = /(\d+)\/5$/;
  const numberMatch = text.match(numberPattern);
  if (numberMatch) {
    return parseInt(numberMatch[1]);
  }
  
  // Pattern 4: Percentuali (100%, 80%, etc.)
  const percentPattern = /(\d+)%$/;
  const percentMatch = text.match(percentPattern);
  if (percentMatch) {
    const percent = parseInt(percentMatch[1]);
    return Math.round(percent / 20); // Converte percentuale in rating 0-5
  }
  
  // Pattern 5: Parole (Expert, Advanced, Intermediate, Beginner)
  const wordPattern = /(Expert|Advanced|Intermediate|Beginner|Novice)$/i;
  const wordMatch = text.match(wordPattern);
  if (wordMatch) {
    const word = wordMatch[1].toLowerCase();
    switch (word) {
      case 'expert': return 5;
      case 'advanced': return 4;
      case 'intermediate': return 3;
      case 'beginner': return 2;
      case 'novice': return 1;
      default: return 3;
    }
  }
  
  // Pattern 6: Barre (|||||, ||||, |||, etc.)
  const barPattern = /\|{1,5}$/;
  const barMatch = text.match(barPattern);
  if (barMatch) {
    return barMatch[0].length;
  }
  
  // Pattern 7: Punti (....., ...., ..., etc.)
  const dotPattern = /\.{1,5}$/;
  const dotMatch = text.match(dotPattern);
  if (dotMatch) {
    return dotMatch[0].length;
  }
  
  // Pattern 8: Numeri semplici alla fine (1, 2, 3, 4, 5)
  const simpleNumberPattern = /^(\d)$/;
  const simpleNumberMatch = text.match(simpleNumberPattern);
  if (simpleNumberMatch) {
    const num = parseInt(simpleNumberMatch[1]);
    if (num >= 1 && num <= 5) {
      return num;
    }
  }
  
  // Pattern 9: Testo con numeri tra parentesi (JavaScript (4), Python (5))
  const parenthesesPattern = /\((\d)\)$/;
  const parenthesesMatch = text.match(parenthesesPattern);
  if (parenthesesMatch) {
    const num = parseInt(parenthesesMatch[1]);
    if (num >= 1 && num <= 5) {
      return num;
    }
  }
  
  // Pattern 10: Testo con numeri dopo due punti (JavaScript: 4, Python: 5)
  const colonPattern = /:\s*(\d)$/;
  const colonMatch = text.match(colonPattern);
  if (colonMatch) {
    const num = parseInt(colonMatch[1]);
    if (num >= 1 && num <= 5) {
      return num;
    }
  }
  
  return null;
};

const extractSkillName = (text: string): string => {
  // Rimuove i pattern di rating dal testo per ottenere solo il nome della skill
  return text
    .replace(/[●○]{1,5}$/, '') // Rimuove cerchi
    .replace(/[★☆]{1,5}$/, '') // Rimuove stelle
    .replace(/\d+\/5$/, '') // Rimuove numeri/5
    .replace(/\d+%$/, '') // Rimuove percentuali
    .replace(/(Expert|Advanced|Intermediate|Beginner|Novice)$/i, '') // Rimuove parole di livello
    .replace(/\|{1,5}$/, '') // Rimuove barre
    .replace(/\.{1,5}$/, '') // Rimuove punti
    .replace(/^\d$/, '') // Rimuove numeri semplici
    .replace(/\(\d\)$/, '') // Rimuove numeri tra parentesi
    .replace(/:\s*\d$/, '') // Rimuove numeri dopo due punti
    .trim();
};

const parseFeaturedSkills = (textItems: TextItem[]): FeaturedSkill[] => {
  const featuredSkills = deepClone(initialFeaturedSkills);
  let skillIndex = 0;
  
  console.log('Parsing featured skills from text items:', textItems.map(item => item.text));
  
  for (let i = 0; i < textItems.length && skillIndex < 6; i++) {
    const textItem = textItems[i];
    const text = textItem.text.trim();
    
    if (text) {
      // Gestisce il caso in cui più skill potrebbero essere nella stessa riga separate da virgole
      const skillParts = text.split(',').map(part => part.trim()).filter(part => part);
      
      for (const skillPart of skillParts) {
        if (skillIndex >= 6) break;
        
        const rating = hasRatingPattern(skillPart);
        const skillName = extractSkillName(skillPart);
        
        if (skillName) { // Solo se c'è un nome di skill valido
          console.log(`Skill: "${skillName}", Rating: ${rating}, Original: "${skillPart}"`);
          featuredSkills[skillIndex] = {
            skill: skillName,
            rating: rating !== null ? rating : 0, // Default rating 0 se non trovato (non inventare)
          };
          skillIndex++;
        }
      }
    }
  }
  
  return featuredSkills;
};

export const extractSkills = (sections: ResumeSectionToLines) => {
  const lines = getSectionLinesByKeywords(sections, ["skill"]);
  const descriptionsLineIdx = getDescriptionsLineIdx(lines) ?? 0;
  const descriptionsLines = lines.slice(descriptionsLineIdx);
  const descriptions = getBulletPointsFromLines(descriptionsLines);

  let featuredSkills = deepClone(initialFeaturedSkills);
  
  if (descriptionsLineIdx !== 0) {
    const featuredSkillsLines = lines.slice(0, descriptionsLineIdx);
    const featuredSkillsTextItems = featuredSkillsLines
      .flat()
      .filter((item) => item.text.trim());
    
    featuredSkills = parseFeaturedSkills(featuredSkillsTextItems);
  }

  const skills: ResumeSkills = {
    featuredSkills,
    descriptions,
  };

  return { skills };
};
