import type {
  ResumeSectionToLines,
  TextItem,
  FeatureSet,
} from "lib/parse-resume-from-pdf/types";
import { getSectionLinesByKeywords } from "lib/parse-resume-from-pdf/extract-resume-from-sections/lib/get-section-lines";
import {
  isBold,
  hasNumber,
  hasComma,
  hasLetter,
  hasLetterAndIsAllUpperCase,
} from "lib/parse-resume-from-pdf/extract-resume-from-sections/lib/common-features";
import { getTextWithHighestFeatureScore } from "lib/parse-resume-from-pdf/extract-resume-from-sections/lib/feature-scoring-system";

// Name
export const matchOnlyLetterSpaceOrPeriod = (item: TextItem) =>
  item.text.match(/^[a-zA-Z\s\.]+$/);

// Email
// Simple email regex: xxx@xxx.xxx (xxx = anything not space)
export const matchEmail = (item: TextItem) => item.text.match(/\S+@\S+\.\S+/);
const hasAt = (item: TextItem) => item.text.includes("@");

// Phone
// Simple phone regex that matches (xxx)-xxx-xxxx where () and - are optional, - can also be space
export const matchPhone = (item: TextItem) =>
  item.text.match(/\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}/);
const hasParenthesis = (item: TextItem) => /\([0-9]+\)/.test(item.text);

// Location
// Simple location regex that matches "<City>, <ST>"
export const matchCityAndState = (item: TextItem) =>
  item.text.match(/[A-Z][a-zA-Z\s]+, [A-Z]{2}/);

// Url
// Simple url regex that matches "xxx.xxx/xxx" (xxx = anything not space)
export const matchUrl = (item: TextItem) => item.text.match(/\S+\.[a-z]+\/\S+/);
// Match https://xxx.xxx where s is optional
const matchUrlHttpFallback = (item: TextItem) =>
  item.text.match(/https?:\/\/\S+\.\S+/);
// Match www.xxx.xxx
const matchUrlWwwFallback = (item: TextItem) =>
  item.text.match(/www\.\S+\.\S+/);
const hasSlash = (item: TextItem) => item.text.includes("/");

// Summary
const has4OrMoreWords = (item: TextItem) => item.text.split(" ").length >= 4;

/**
 *              Unique Attribute
 * Name         Bold or Has all uppercase letter
 * Email        Has @
 * Phone        Has ()
 * Location     Has ,    (overlap with summary)
 * Url          Has slash
 * Summary      Has 4 or more words
 */

/**
 * Name -> contains only letters/space/period, e.g. Leonardo W. DiCaprio
 *         (it isn't common to include middle initial in resume)
 *      -> is bolded or has all letters as uppercase
 */
const NAME_FEATURE_SETS: FeatureSet[] = [
  [matchOnlyLetterSpaceOrPeriod, 4, true],
  [isBold, 3],
  [hasLetterAndIsAllUpperCase, 3],
  // Match against other unique attributes
  [hasAt, -6], // Email
  [hasNumber, -6], // Phone
  [hasParenthesis, -6], // Phone
  [hasComma, -6], // Location
  [hasSlash, -6], // Url
  [has4OrMoreWords, -4], // Summary
];

// Email -> match email regex xxx@xxx.xxx
const EMAIL_FEATURE_SETS: FeatureSet[] = [
  [matchEmail, 5, true],
  [isBold, -2], // Name
  [hasLetterAndIsAllUpperCase, -2], // Name
  [hasParenthesis, -6], // Phone
  [hasComma, -6], // Location
  [hasSlash, -6], // Url
  [has4OrMoreWords, -6], // Summary
];

// Phone -> match phone regex (xxx)-xxx-xxxx
const PHONE_FEATURE_SETS: FeatureSet[] = [
  [matchPhone, 5, true],
  [hasLetter, -6], // Name, Email, Location, Url, Summary
];

// Location -> match location regex <City>, <ST>
const LOCATION_FEATURE_SETS: FeatureSet[] = [
  [matchCityAndState, 5, true],
  [isBold, -2], // Name
  [hasAt, -6], // Email
  [hasParenthesis, -4], // Phone
  [hasSlash, -6], // Url
];

// URL -> match url regex xxx.xxx/xxx
const URL_FEATURE_SETS: FeatureSet[] = [
  [matchUrl, 5, true],
  [matchUrlHttpFallback, 4, true],
  [matchUrlWwwFallback, 4, true],
  [isBold, -2], // Name
  [hasAt, -6], // Email
  [hasParenthesis, -4], // Phone
  [hasComma, -6], // Location
  [has4OrMoreWords, -6], // Summary
];

// Summary -> has 4 or more words
const SUMMARY_FEATURE_SETS: FeatureSet[] = [
  [has4OrMoreWords, 3],
  [isBold, -2], // Name
  [hasAt, -6], // Email
  [hasParenthesis, -4], // Phone
  [matchCityAndState, -6, false], // Location
];

export const extractProfile = (sections: ResumeSectionToLines) => {
  const lines = sections.profile || [];
  const textItems = lines.flat();

  const [name, nameScores] = getTextWithHighestFeatureScore(
    textItems,
    NAME_FEATURE_SETS
  );
  const [email, emailScores] = getTextWithHighestFeatureScore(
    textItems,
    EMAIL_FEATURE_SETS
  );
  const [phone, phoneScores] = getTextWithHighestFeatureScore(
    textItems,
    PHONE_FEATURE_SETS
  );
  const [location, locationScores] = getTextWithHighestFeatureScore(
    textItems,
    LOCATION_FEATURE_SETS
  );
  const [url, urlScores] = getTextWithHighestFeatureScore(
    textItems,
    URL_FEATURE_SETS
  );
  const [summary, summaryScores] = getTextWithHighestFeatureScore(
    textItems,
    SUMMARY_FEATURE_SETS,
    undefined,
    true
  );

  const summaryLines = getSectionLinesByKeywords(sections, ["summary"]);
  const summarySection = summaryLines
    .flat()
    .map((textItem) => textItem.text)
    .join(" ");
  const objectiveLines = getSectionLinesByKeywords(sections, ["objective"]);
  const objectiveSection = objectiveLines
    .flat()
    .map((textItem) => textItem.text)
    .join(" ");

  return {
    profile: {
      name,
      email,
      phone,
      location,
      url,
      // Dedicated section takes higher precedence over profile summary
      summary: summarySection || objectiveSection || summary,
    },
    // For debugging
    profileScores: {
      name: nameScores,
      email: emailScores,
      phone: phoneScores,
      location: locationScores,
      url: urlScores,
      summary: summaryScores,
    },
  };
};
