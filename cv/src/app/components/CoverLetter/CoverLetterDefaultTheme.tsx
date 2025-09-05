"use client";
import React from 'react';

// Interfacce dati semplificate
interface CoverLetterData {
  personal: {
    name: string;
    title: string;
    email: string;
    phone: string;
    website?: string;
  };
  company: {
    name: string;
    jobTitle: string;
  };
  content: {
    greeting: string;
    body: string[];
    closing: string;
  };
  date: string;
}

// TEMA DEFAULT: Con linea di separazione e colori originali
const createDefaultStyles = (settings: any) => {
  const { fontSize, fontFamily, themeColor, spacing } = settings;
  const fontFamilyValue = fontFamily || 'Inter';
  const fontSizeValue = parseInt(fontSize) || 11;
  const spacingMultiplier = spacing === 'compact' ? 0.8 : 1.2;
  
  // Converti pt in px per HTML (1pt = 1.333px approssimativamente)
  const ptToPx = (pt: number) => Math.round(pt * 1.333);

  return {
    page: {
      fontFamily: `${fontFamilyValue}, system-ui, sans-serif`,
      fontSize: `${fontSizeValue}pt`,
      color: '#2d3748',
      backgroundColor: '#ffffff',
      paddingTop: `${ptToPx(40 * spacingMultiplier)}px`,
      paddingBottom: `${ptToPx(40 * spacingMultiplier)}px`,
      paddingLeft: `${ptToPx(40 * spacingMultiplier)}px`,
      paddingRight: `${ptToPx(40 * spacingMultiplier)}px`,
      width: '100%',
      height: '100%',
      margin: '0',
      boxShadow: 'none',
      boxSizing: 'border-box',
    } as React.CSSProperties,
    header: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: `${ptToPx(24 * spacingMultiplier)}px`,
      paddingBottom: `${ptToPx(16 * spacingMultiplier)}px`,
      borderBottom: `2px solid ${themeColor}`,
    } as React.CSSProperties,
    nameSection: {
      display: 'flex',
      flexDirection: 'column',
      flex: '1',
    } as React.CSSProperties,
    name: {
      fontSize: `${fontSizeValue + 8}pt`,
      fontWeight: '700',
      color: '#1a202c', // Nome con colore originale
      marginBottom: `${ptToPx(4 * spacingMultiplier)}px`,
      lineHeight: '1.2',
    } as React.CSSProperties,
    title: {
      fontSize: `${fontSizeValue + 1}pt`,
      color: themeColor, // Ruolo con colore del tema
      fontWeight: '500',
      lineHeight: '1.3',
    } as React.CSSProperties,
    contact: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      fontSize: `${fontSizeValue - 2}pt`,
      color: '#718096',
      flex: '0 0 auto',
      textAlign: 'right',
    } as React.CSSProperties,
    contactItem: {
      marginBottom: `${ptToPx(2 * spacingMultiplier)}px`,
      whiteSpace: 'nowrap',
    } as React.CSSProperties,
    date: {
      fontSize: `${fontSizeValue - 1}pt`,
      color: '#718096',
      marginBottom: `${ptToPx(16 * spacingMultiplier)}px`,
    } as React.CSSProperties,
    companyInfo: {
      marginBottom: `${ptToPx(20 * spacingMultiplier)}px`,
    } as React.CSSProperties,
    companyName: {
      fontSize: `${fontSizeValue + 1}pt`,
      fontWeight: '600',
      color: '#2d3748', // Nome azienda con colore originale
      marginBottom: `${ptToPx(4 * spacingMultiplier)}px`,
    } as React.CSSProperties,
    jobTitle: {
      fontSize: `${fontSizeValue}pt`,
      color: '#4a5568',
      marginBottom: `${ptToPx(16 * spacingMultiplier)}px`,
    } as React.CSSProperties,
    greeting: {
      fontSize: `${fontSizeValue}pt`,
      fontWeight: '500',
      color: '#2d3748',
      marginBottom: `${ptToPx(12 * spacingMultiplier)}px`,
    } as React.CSSProperties,
    paragraph: {
      fontSize: `${fontSizeValue - 0.5}pt`,
      lineHeight: 1.6,
      textAlign: 'justify',
      marginBottom: `${ptToPx(12 * spacingMultiplier)}px`,
      wordWrap: 'break-word',
      overflowWrap: 'break-word',
      maxWidth: '100%',
      whiteSpace: 'pre-wrap',
      hyphens: 'auto',
    } as React.CSSProperties,
    closing: {
      fontSize: `${fontSizeValue}pt`,
      fontWeight: '500',
      color: '#2d3748',
      marginTop: `${ptToPx(20 * spacingMultiplier)}px`,
      marginBottom: `${ptToPx(8 * spacingMultiplier)}px`,
    } as React.CSSProperties,
    signature: {
      fontSize: `${fontSizeValue + 1}pt`,
      fontWeight: '600',
      color: themeColor, // Firma con colore del tema
    } as React.CSSProperties,
  };
};

// Componente Tema Default HTML
export const CoverLetterDefaultHTML: React.FC<{ 
  data: CoverLetterData;
  settings: any;
}> = ({ data, settings }) => {
  const styles = createDefaultStyles(settings);
  
  return (
    <div style={styles.page}>
      {/* Header con linea di separazione */}
      <div style={styles.header}>
        <div style={styles.nameSection}>
          <div style={styles.name}>{data.personal.name}</div>
          {data.personal.title && (
            <div style={styles.title}>{data.personal.title}</div>
          )}
        </div>
        <div style={styles.contact}>
          <div style={styles.contactItem}>{data.personal.email}</div>
          <div style={styles.contactItem}>{data.personal.phone}</div>
          {data.personal.website && (
            <div style={styles.contactItem}>{data.personal.website}</div>
          )}
        </div>
      </div>

      {/* Data */}
      <div style={styles.date}>{data.date}</div>

      {/* Nome azienda sopra il contenuto */}
      {data.company.name && (
        <div style={styles.companyName}>{data.company.name}</div>
      )}

      {/* Contenuto lettera */}
      <div style={styles.greeting}>{data.content.greeting}</div>
      
      {data.content.body.map((paragraph, index) => (
        <div key={index} style={styles.paragraph}>
          {paragraph}
        </div>
      ))}

      <div style={styles.closing}>{data.content.closing}</div>
      <div style={styles.signature}>{data.personal.name}</div>
    </div>
  );
};
