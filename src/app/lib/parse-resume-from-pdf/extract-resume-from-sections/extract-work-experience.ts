import type { ResumeWorkExperience } from "lib/redux/types";
import type {
  TextItem,
  FeatureSet,
  ResumeSectionToLines,
} from "lib/parse-resume-from-pdf/types";
import { getSectionLinesByKeywords } from "lib/parse-resume-from-pdf/extract-resume-from-sections/lib/get-section-lines";
import {
  DATE_FEATURE_SETS,
  hasNumber,
  getHasText,
  isBold,
} from "lib/parse-resume-from-pdf/extract-resume-from-sections/lib/common-features";
import { divideSectionIntoSubsections } from "lib/parse-resume-from-pdf/extract-resume-from-sections/lib/subsections";
import { getTextWithHighestFeatureScore } from "lib/parse-resume-from-pdf/extract-resume-from-sections/lib/feature-scoring-system";
import {
  getBulletPointsFromLines,
  getDescriptionsLineIdx,
} from "lib/parse-resume-from-pdf/extract-resume-from-sections/lib/bullet-points";

// prettier-ignore
const WORK_EXPERIENCE_KEYWORDS_LOWERCASE = ['work', 'experience', 'employment', 'history', 'job'];
// prettier-ignore
const JOB_TITLES = ['Accountant', 'Administrator', 'Advisor', 'Agent', 'Analyst', 'Apprentice', 'Architect', 'Assistant', 'Associate', 'Auditor', 'Bartender', 'Biologist', 'Bookkeeper', 'Buyer', 'Carpenter', 'Cashier', 'CEO', 'Clerk', 'Co-op', 'Co-Founder', 'Consultant', 'Coordinator', 'CTO', 'Developer', 'Designer', 'Director', 'Driver', 'Editor', 'Electrician', 'Engineer', 'Extern', 'Founder', 'Freelancer', 'Head', 'Intern', 'Janitor', 'Journalist', 'Laborer', 'Lawyer', 'Lead', 'Manager', 'Mechanic', 'Member', 'Nurse', 'Officer', 'Operator', 'Operation', 'Photographer', 'President', 'Producer', 'Recruiter', 'Representative', 'Researcher', 'Sales', 'Server', 'Scientist', 'Specialist', 'Supervisor', 'Teacher', 'Technician', 'Trader', 'Trainee', 'Treasurer', 'Tutor', 'Vice', 'VP', 'Volunteer', 'Webmaster', 'Worker', 'Programmer', 'Software Engineer', 'Data Scientist', 'Product Manager', 'Project Manager', 'Scrum Master', 'DevOps Engineer', 'Cloud Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Mobile Developer', 'iOS Developer', 'Android Developer', 'UI Designer', 'UX Designer', 'Graphic Designer', 'Web Designer', 'Marketing Manager', 'Digital Marketing', 'Content Creator', 'Social Media Manager', 'SEO Specialist', 'Growth Hacker', 'Business Analyst', 'Financial Analyst', 'Investment Analyst', 'Risk Analyst', 'Operations Manager', 'Supply Chain Manager', 'Logistics Coordinator', 'Customer Success Manager', 'Account Manager', 'Sales Manager', 'Business Development', 'Partnership Manager', 'Product Owner', 'Technical Writer', 'QA Engineer', 'Test Engineer', 'Security Engineer', 'Network Engineer', 'System Administrator', 'Database Administrator', 'IT Support', 'Help Desk', 'Technical Support', 'Customer Support', 'Sales Representative', 'Account Executive', 'Business Development Representative', 'Inside Sales', 'Outside Sales', 'Territory Manager', 'Regional Manager', 'District Manager', 'Area Manager', 'Store Manager', 'Branch Manager', 'Department Manager', 'Team Lead', 'Senior Manager', 'Principal', 'Partner', 'Executive', 'C-Level', 'Board Member', 'Advisor', 'Mentor', 'Coach', 'Trainer', 'Instructor', 'Professor', 'Lecturer', 'Researcher', 'Scientist', 'Research Scientist', 'Data Analyst', 'Business Intelligence', 'Machine Learning Engineer', 'AI Engineer', 'Robotics Engineer', 'Automation Engineer', 'Process Engineer', 'Manufacturing Engineer', 'Quality Engineer', 'Test Engineer', 'Validation Engineer', 'Compliance Officer', 'Regulatory Affairs', 'Legal Counsel', 'Paralegal', 'Contract Manager', 'Procurement Manager', 'Vendor Manager', 'Category Manager', 'Brand Manager', 'Product Marketing', 'Digital Marketing', 'Performance Marketing', 'Email Marketing', 'Content Marketing', 'Influencer Marketing', 'Affiliate Marketing', 'Paid Search', 'Paid Social', 'Media Buyer', 'Media Planner', 'Creative Director', 'Art Director', 'Copywriter', 'Content Writer', 'Technical Writer', 'Grant Writer', 'Editor', 'Proofreader', 'Translator', 'Interpreter', 'Event Coordinator', 'Event Manager', 'Wedding Planner', 'Travel Agent', 'Tour Guide', 'Concierge', 'Receptionist', 'Administrative Assistant', 'Executive Assistant', 'Personal Assistant', 'Office Manager', 'Facilities Manager', 'Property Manager', 'Real Estate Agent', 'Real Estate Broker', 'Mortgage Broker', 'Insurance Agent', 'Insurance Broker', 'Financial Advisor', 'Investment Advisor', 'Wealth Manager', 'Portfolio Manager', 'Trader', 'Broker', 'Compliance Manager', 'Risk Manager', 'Audit Manager', 'Tax Manager', 'Controller', 'CFO', 'Treasurer', 'Accountant', 'Bookkeeper', 'Payroll Specialist', 'HR Manager', 'HR Generalist', 'Recruiter', 'Talent Acquisition', 'HR Business Partner', 'Compensation Analyst', 'Benefits Administrator', 'Training Manager', 'Learning and Development', 'Organizational Development', 'Change Management', 'Project Coordinator', 'Program Manager', 'Portfolio Manager', 'Release Manager', 'Delivery Manager', 'Implementation Manager', 'Client Success Manager', 'Customer Experience Manager', 'Operations Analyst', 'Process Analyst', 'Business Process Manager', 'Continuous Improvement', 'Lean Manager', 'Six Sigma', 'Quality Manager', 'Quality Assurance', 'Quality Control', 'Compliance Specialist', 'Regulatory Specialist', 'Safety Manager', 'Environmental Manager', 'Sustainability Manager', 'Corporate Social Responsibility', 'Community Manager', 'Partnership Coordinator', 'Alliance Manager', 'Channel Manager', 'Distribution Manager', 'Fleet Manager', 'Transportation Manager', 'Warehouse Manager', 'Inventory Manager', 'Procurement Specialist', 'Sourcing Manager', 'Vendor Relations', 'Supplier Manager', 'Contract Specialist', 'Legal Assistant', 'Paralegal', 'Compliance Analyst', 'Risk Analyst', 'Internal Auditor', 'External Auditor', 'Forensic Accountant', 'Tax Specialist', 'Tax Preparer', 'Estate Planner', 'Financial Planner', 'Retirement Planner', 'Insurance Underwriter', 'Claims Adjuster', 'Loss Prevention', 'Fraud Investigator', 'Security Manager', 'Security Officer', 'Facilities Coordinator', 'Maintenance Manager', 'Building Manager', 'Property Coordinator', 'Leasing Agent', 'Property Developer', 'Construction Manager', 'Project Engineer', 'Site Manager', 'Foreman', 'Supervisor', 'Team Lead', 'Shift Manager', 'Production Manager', 'Manufacturing Manager', 'Plant Manager', 'Operations Supervisor', 'Production Supervisor', 'Quality Supervisor', 'Maintenance Supervisor', 'Safety Supervisor', 'Training Supervisor', 'HR Supervisor', 'Customer Service Supervisor', 'Sales Supervisor', 'Retail Manager', 'Store Supervisor', 'Assistant Manager', 'Department Head', 'Section Manager', 'Unit Manager', 'Division Manager', 'General Manager', 'Managing Director', 'CEO', 'President', 'Vice President', 'Senior Vice President', 'Executive Vice President', 'Chief Operating Officer', 'Chief Technology Officer', 'Chief Financial Officer', 'Chief Marketing Officer', 'Chief Information Officer', 'Chief Human Resources Officer', 'Chief Legal Officer', 'Chief Compliance Officer', 'Chief Risk Officer', 'Chief Security Officer', 'Chief Data Officer', 'Chief Digital Officer', 'Chief Innovation Officer', 'Chief Strategy Officer', 'Chief Revenue Officer', 'Chief Growth Officer', 'Chief Customer Officer', 'Chief Experience Officer', 'Chief Product Officer', 'Chief Design Officer', 'Chief Creative Officer', 'Chief Content Officer', 'Chief Communications Officer', 'Chief Brand Officer', 'Chief Sustainability Officer', 'Chief Diversity Officer', 'Chief Inclusion Officer', 'Chief Talent Officer', 'Chief Learning Officer', 'Chief Knowledge Officer', 'Chief Information Security Officer', 'Chief Privacy Officer', 'Chief Ethics Officer', 'Chief Governance Officer', 'Chief Audit Executive', 'Chief Risk Executive', 'Chief Compliance Executive', 'Chief Legal Executive', 'Chief Financial Executive', 'Chief Operating Executive', 'Chief Technology Executive', 'Chief Marketing Executive', 'Chief Human Resources Executive', 'Chief Information Executive', 'Chief Data Executive', 'Chief Digital Executive', 'Chief Innovation Executive', 'Chief Strategy Executive', 'Chief Revenue Executive', 'Chief Growth Executive', 'Chief Customer Executive', 'Chief Experience Executive', 'Chief Product Executive', 'Chief Design Executive', 'Chief Creative Executive', 'Chief Content Executive', 'Chief Communications Executive', 'Chief Brand Executive', 'Chief Sustainability Executive', 'Chief Diversity Executive', 'Chief Inclusion Executive', 'Chief Talent Executive', 'Chief Learning Executive', 'Chief Knowledge Executive', 'Chief Information Security Executive', 'Chief Privacy Executive', 'Chief Ethics Executive', 'Chief Governance Executive', 'Chief Audit Officer', 'Chief Risk Officer', 'Chief Compliance Officer', 'Chief Legal Officer', 'Chief Financial Officer', 'Chief Operating Officer', 'Chief Technology Officer', 'Chief Marketing Officer', 'Chief Human Resources Officer', 'Chief Information Officer', 'Chief Data Officer', 'Chief Digital Officer', 'Chief Innovation Officer', 'Chief Strategy Officer', 'Chief Revenue Officer', 'Chief Growth Officer', 'Chief Customer Officer', 'Chief Experience Officer', 'Chief Product Officer', 'Chief Design Officer', 'Chief Creative Officer', 'Chief Content Officer', 'Chief Communications Officer', 'Chief Brand Officer', 'Chief Sustainability Officer', 'Chief Diversity Officer', 'Chief Inclusion Officer', 'Chief Talent Officer', 'Chief Learning Officer', 'Chief Knowledge Officer', 'Chief Information Security Officer', 'Chief Privacy Officer', 'Chief Ethics Officer', 'Chief Governance Officer'];

const hasJobTitle = (item: TextItem) =>
  JOB_TITLES.some((jobTitle) =>
    item.text.split(/\s/).some((word) => word === jobTitle)
  );
const hasMoreThan5Words = (item: TextItem) => item.text.split(/\s/).length > 5;
const JOB_TITLE_FEATURE_SET: FeatureSet[] = [
  [hasJobTitle, 4],
  [hasNumber, -4],
  [hasMoreThan5Words, -3],
];

export const extractWorkExperience = (sections: ResumeSectionToLines) => {
  const workExperiences: ResumeWorkExperience[] = [];
  const workExperiencesScores = [];
  const lines = getSectionLinesByKeywords(
    sections,
    WORK_EXPERIENCE_KEYWORDS_LOWERCASE
  );
  const subsections = divideSectionIntoSubsections(lines);

  for (const subsectionLines of subsections) {
    const descriptionsLineIdx = getDescriptionsLineIdx(subsectionLines) ?? 2;

    const subsectionInfoTextItems = subsectionLines
      .slice(0, descriptionsLineIdx)
      .flat();
    const [date, dateScores] = getTextWithHighestFeatureScore(
      subsectionInfoTextItems,
      DATE_FEATURE_SETS
    );
    const [jobTitle, jobTitleScores] = getTextWithHighestFeatureScore(
      subsectionInfoTextItems,
      JOB_TITLE_FEATURE_SET
    );
    const COMPANY_FEATURE_SET: FeatureSet[] = [
      [isBold, 3],
      [getHasText(date), -4],
      [getHasText(jobTitle), -4],
    ];
    const [company, companyScores] = getTextWithHighestFeatureScore(
      subsectionInfoTextItems,
      COMPANY_FEATURE_SET,
      false
    );

    const subsectionDescriptionsLines =
      subsectionLines.slice(descriptionsLineIdx);
    const descriptions = getBulletPointsFromLines(subsectionDescriptionsLines);

    workExperiences.push({ company, jobTitle, date, descriptions });
    workExperiencesScores.push({
      companyScores,
      jobTitleScores,
      dateScores,
    });
  }
  return { workExperiences, workExperiencesScores };
};
