"use client";
import { ENGLISH_FONT_FAMILIES } from "components/fonts/constants";

interface CoverLetterHTMLProps {
  coverLetter: any;
  settings: any;
}

export const CoverLetterHTML = ({ coverLetter, settings }: CoverLetterHTMLProps) => {
  const { profile, content } = coverLetter;
  const { fontSize, fontFamily, themeColor, documentSize } = settings;
  const fontFamilyValue = ENGLISH_FONT_FAMILIES.includes(fontFamily) ? fontFamily : "Roboto";

  const styles = {
    page: {
      fontSize: `${parseInt(fontSize)}pt`,
      fontFamily: fontFamilyValue,
      padding: "40pt",
      lineHeight: 1.5,
      width: documentSize === "A4" ? "595pt" : "612pt",
      height: documentSize === "A4" ? "842pt" : "792pt",
      margin: "0 auto",
      backgroundColor: "white",
      boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    },
    header: {
      marginBottom: "30pt",
    },
    name: {
      fontSize: `${parseInt(fontSize) + 4}pt`,
      fontWeight: "bold",
      marginBottom: "8pt",
      color: themeColor,
    },
    contactInfo: {
      fontSize: `${parseInt(fontSize) - 1}pt`,
      marginBottom: "4pt",
    },
    date: {
      marginBottom: "20pt",
    },
    companyInfo: {
      marginBottom: "20pt",
    },
    greeting: {
      marginBottom: "20pt",
    },
    content: {
      marginBottom: "20pt",
      textAlign: "justify" as const,
      whiteSpace: "pre-wrap" as const,
    },
    closing: {
      marginTop: "30pt",
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.name}>{profile.name}</div>
        <div style={styles.contactInfo}>{profile.email}</div>
        <div style={styles.contactInfo}>{profile.phone}</div>
        <div style={styles.contactInfo}>{profile.location}</div>
      </div>

      <div style={styles.date}>
        {profile.date}
      </div>

      <div style={styles.companyInfo}>
        <div>{profile.hiringManager || "Dear Hiring Manager,"}</div>
        <div>{profile.company}</div>
      </div>

      <div style={styles.greeting}>
        I am writing to express my strong interest in the {profile.position} position at {profile.company}.
      </div>

      <div style={styles.content}>
        {content}
      </div>

      <div style={styles.closing}>
        <div>Sincerely,</div>
        <div>{profile.name}</div>
      </div>
    </div>
  );
};
