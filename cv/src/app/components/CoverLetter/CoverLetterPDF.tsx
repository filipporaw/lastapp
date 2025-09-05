"use client";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { useAppSelector } from "lib/redux/hooks";
import { selectCoverLetter } from "lib/redux/coverLetterSlice";
import { selectSettings } from "lib/redux/settingsSlice";
import { ENGLISH_FONT_FAMILIES } from "components/fonts/constants";
import { CoverLetterDefaultPDF } from "./CoverLetterDefaultPDF";

interface CoverLetterPDFProps {
  coverLetter: any;
  settings: any;
  isPDF: boolean;
}

const createMinimalStyles = (settings: any) => {
  const { fontSize, fontFamily, themeColor, spacing } = settings;
  const fontFamilyValue = ENGLISH_FONT_FAMILIES.includes(fontFamily) ? fontFamily : "Roboto";
  const fontSizeValue = parseInt(fontSize) || 11;
  const spacingMultiplier = spacing === 'compact' ? 0.8 : 1.2;

  return StyleSheet.create({
    page: {
      fontSize: fontSizeValue,
      fontFamily: fontFamilyValue,
      padding: 40 * spacingMultiplier,
      lineHeight: 1.5,
      color: '#2d3748',
      backgroundColor: '#ffffff',
    },
    header: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 24 * spacingMultiplier,
      paddingBottom: 16 * spacingMultiplier,
    },
    nameSection: {
      display: 'flex',
      flexDirection: 'column',
    },
    name: {
      fontSize: fontSizeValue + 8,
      fontWeight: 'bold',
      marginBottom: 4 * spacingMultiplier,
      color: '#0F172A', // Nome con colore del tema minimal
      flexGrow: 1,
      flexBasis: 0,
      flexShrink: 1,
      maxWidth: "100%",
      textAlign: "left",
    },
    title: {
      fontSize: fontSizeValue + 1,
      color: '#64748B', // Ruolo con colore del tema minimal
      fontWeight: 'medium',
      flexGrow: 1,
      flexBasis: 0,
      flexShrink: 1,
      maxWidth: "100%",
      textAlign: "left",
    },
    contact: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      fontSize: fontSizeValue - 2,
      color: '#718096',
    },
    contactItem: {
      marginBottom: 2 * spacingMultiplier,
      flexGrow: 1,
      flexBasis: 0,
      flexShrink: 1,
      maxWidth: "100%",
      textAlign: "left",
    },
    date: {
      fontSize: fontSizeValue - 1,
      color: '#718096',
      marginBottom: 16 * spacingMultiplier,
      flexGrow: 1,
      flexBasis: 0,
      flexShrink: 1,
      maxWidth: "100%",
      textAlign: "left",
    },
    companyInfo: {
      marginBottom: 20 * spacingMultiplier,
    },
    companyName: {
      fontSize: fontSizeValue + 1,
      fontWeight: 'semibold',
      color: '#1E293B', // Nome azienda con colore del tema minimal
      marginBottom: 4 * spacingMultiplier,
      flexGrow: 1,
      flexBasis: 0,
      flexShrink: 1,
      maxWidth: "100%",
      textAlign: "left",
    },
    jobTitle: {
      fontSize: fontSizeValue,
      color: '#4a5568',
      marginBottom: 16 * spacingMultiplier,
      flexGrow: 1,
      flexBasis: 0,
      flexShrink: 1,
      maxWidth: "100%",
      textAlign: "left",
    },
    greeting: {
      fontSize: fontSizeValue,
      fontWeight: 'medium',
      color: '#2d3748',
      marginBottom: 12 * spacingMultiplier,
      flexGrow: 1,
      flexBasis: 0,
      flexShrink: 1,
      maxWidth: "100%",
      textAlign: "left",
    },
    paragraph: {
      fontSize: fontSizeValue - 0.5,
      lineHeight: 1.6,
      textAlign: 'justify',
      marginBottom: 12 * spacingMultiplier,
      flexGrow: 1,
      flexBasis: 0,
      flexShrink: 1,
      maxWidth: "100%",
    },
    closing: {
      fontSize: fontSizeValue,
      fontWeight: 'medium',
      color: '#2d3748',
      marginTop: 20 * spacingMultiplier,
      marginBottom: 8 * spacingMultiplier,
      flexGrow: 1,
      flexBasis: 0,
      flexShrink: 1,
      maxWidth: "100%",
      textAlign: "left",
    },
    signature: {
      fontSize: fontSizeValue + 1,
      fontWeight: 'semibold',
      color: '#0F172A', // Firma con colore del tema minimal
      flexGrow: 1,
      flexBasis: 0,
      flexShrink: 1,
      maxWidth: "100%",
      textAlign: "left",
    },
  });
};

export const CoverLetterPDF = ({ coverLetter, settings, isPDF }: CoverLetterPDFProps) => {
  const coverLetterTheme = settings.coverLetterTheme || "default";
  
  if (coverLetterTheme === "default") {
    return <CoverLetterDefaultPDF coverLetter={coverLetter} settings={settings} isPDF={isPDF} />;
  }
  
  // Tema minimal
  const styles = createMinimalStyles(settings);
  const { profile, content } = coverLetter;

  // Converti i dati nel nuovo formato per consistenza
  const coverLetterData = {
    personal: {
      name: profile.name,
      title: profile.position || "",
      email: profile.email,
      phone: profile.phone,
      website: profile.location || "website.com"
    },
    company: {
      name: profile.company,
      jobTitle: profile.position
    },
    content: {
      greeting: profile.hiringManager || "Dear Hiring Manager,",
      body: content ? 
        // Dividi il contenuto in paragrafi basati su punti o frasi lunghe
        content.split(/(?<=\.)\s+/).filter((p: string) => p.trim().length > 0) :
        [
          "Scrivo per esprimere il mio forte interesse per la posizione di " + profile.position + " presso " + profile.company + "."
        ],
      closing: profile.closing || "Kind Regards,"
    },
    date: profile.date || new Date().toLocaleDateString('it-IT')
  };

  return (
    <Document
      title={`${coverLetterData.personal.name} - Cover Letter`}
      producer={"cv---maker"}
      creator={"cv---maker"}
    >
      <Page size={settings.documentSize} style={styles.page}>
        {/* Header senza linea di separazione */}
        <View style={styles.header}>
          <View style={{...styles.nameSection, flexGrow: 1, flexBasis: 0}}>
            <Text style={styles.name}>{coverLetterData.personal.name}</Text>
            {coverLetterData.personal.title && (
              <Text style={styles.title}>{coverLetterData.personal.title}</Text>
            )}
          </View>
          <View style={{...styles.contact, flexGrow: 0, flexShrink: 0}}>
            <Text style={styles.contactItem}>{coverLetterData.personal.email}</Text>
            <Text style={styles.contactItem}>{coverLetterData.personal.phone}</Text>
            {coverLetterData.personal.website && (
              <Text style={styles.contactItem}>{coverLetterData.personal.website}</Text>
            )}
          </View>
        </View>

        {/* Data */}
        <Text style={styles.date}>{coverLetterData.date}</Text>

        {/* Nome azienda sopra il contenuto */}
        {coverLetterData.company.name && (
          <Text style={styles.companyName}>{coverLetterData.company.name}</Text>
        )}

        {/* Contenuto lettera */}
        <Text style={styles.greeting}>{coverLetterData.content.greeting}</Text>
        
        {coverLetterData.content.body.map((paragraph: string, index: number) => (
          <Text key={index} style={styles.paragraph}>
            {paragraph}
          </Text>
        ))}

        <Text style={styles.closing}>{coverLetterData.content.closing}</Text>
        <Text style={styles.signature}>{coverLetterData.personal.name}</Text>
      </Page>
    </Document>
  );
};
