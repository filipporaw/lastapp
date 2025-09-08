import { Page, View, Document } from "@react-pdf/renderer";
import { styles, spacing } from "components/themes/styles";
import { ResumePDFProfile } from "./ResumePDFProfile";
import { DEFAULT_FONT_COLOR, ShowForm } from "lib/redux/settingsSlice";
import { SuppressResumePDFErrorMessage } from "components/themes/core/SuppressResumePDFErrorMessage";
import { ResumePDFProps } from "../types";
import { ResumePDFWorkExperience } from "./ResumePDFWorkExperience";
import { ResumePDFEducation } from "./ResumePDFEducation";
import { ResumePDFProject } from "./ResumePDFProject";
import { ResumePDFSkills } from "./ResumePDFSkills";
import { ResumePDFCustom } from "./ResumePDFCustom";
import { ResumePDFPrivacyStatements } from "components/themes/core";
import { loadStateFromLocalStorage } from "lib/redux/local-storage";

export const ResumePDFDefault = ({
  resume,
  settings,
  themeColor,
  isPDF = false,
  showFormsOrder,
}: ResumePDFProps) => {
  const { profile, workExperiences, educations, projects, skills, custom } =
    resume;
  const { name } = profile;
  const { formToHeading, showBulletPoints, documentSize, fontFamily, fontSize, privacyStatements } =
    settings;

  const formTypeToComponent: { [type in ShowForm]: () => JSX.Element } = {
    workExperiences: () => (
      <ResumePDFWorkExperience
        heading={formToHeading["workExperiences"]}
        workExperiences={workExperiences}
        themeColor={themeColor}
      />
    ),
    educations: () => (
      <ResumePDFEducation
        heading={formToHeading["educations"]}
        educations={educations}
        themeColor={themeColor}
        showBulletPoints={showBulletPoints["educations"]}
      />
    ),
    projects: () => (
      <ResumePDFProject
        heading={formToHeading["projects"]}
        projects={projects}
        themeColor={themeColor}
      />
    ),
    skills: () => (
      <ResumePDFSkills
        heading={formToHeading["skills"]}
        skills={skills}
        themeColor={themeColor}
        showBulletPoints={showBulletPoints["skills"]}
      />
    ),
    custom: () => (
      <ResumePDFCustom
        heading={formToHeading["custom"]}
        custom={custom}
        themeColor={themeColor}
        showBulletPoints={showBulletPoints["custom"]}
      />
    ),
  };

  // Get the complete state data for JSON metadata
  const stateData = loadStateFromLocalStorage();
  const jsonMetadata = stateData ? JSON.stringify(stateData) : '';
  
  console.log('📄 PDF Generation - JSON metadata size:', jsonMetadata.length);
  console.log('📄 PDF Generation - JSON metadata preview:', jsonMetadata.substring(0, 200) + '...');
  
  // Check if JSON is too large for PDF subject field (typical limit is ~64KB)
  if (jsonMetadata.length > 50000) {
    console.warn('⚠️ JSON metadata is very large (' + jsonMetadata.length + ' chars), might not fit in PDF subject field');
  }

  return (
    <>
      <Document 
        title={`${name} Resume`} 
        author={name} 
        producer={"cv---maker"}
        subject={jsonMetadata}
        keywords={`resume, cv, ${name}, cv---maker, json-data`}
        creator={"cv---maker"}
      >
        <Page
          size={documentSize === "A4" ? "A4" : "LETTER"}
          style={{
            ...styles.flexCol,
            color: DEFAULT_FONT_COLOR,
            fontFamily: fontFamily || "Roboto", // Fallback to Roboto if fontFamily is not available
            fontSize: fontSize + "pt",
          }}
        >
          {Boolean(settings.themeColor) && (
            <View
              style={{
                width: spacing["full"],
                height: spacing[3.5],
                backgroundColor: themeColor,
              }}
            />
          )}
          <View
            style={{
              ...styles.flexCol,
              padding: `${spacing[0]} ${spacing[20]}`,
            }}
          >
            <ResumePDFProfile
              profile={profile}
              themeColor={themeColor}
              isPDF={isPDF}
            />
            {showFormsOrder.map((form) => {
              const Component = formTypeToComponent[form];
              return <Component key={form} />;
            })}
            <ResumePDFPrivacyStatements
              italyPrivacy={privacyStatements.italyPrivacy}
              euPrivacy={privacyStatements.euPrivacy}
              fontFamily={fontFamily}
              fontSize={fontSize}
            />
          </View>
        </Page>
      </Document>
      <SuppressResumePDFErrorMessage />
    </>
  );
};
