"use client";
import React from 'react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  Font 
} from '@react-pdf/renderer';

// Registra i font (stesso pattern di OpenResume)
Font.register({
  family: 'Inter',
  fonts: [
    { src: '/fonts/Inter-Regular.ttf' },
    { src: '/fonts/Inter-Medium.ttf', fontWeight: 500 },
    { src: '/fonts/Inter-SemiBold.ttf', fontWeight: 600 },
    { src: '/fonts/Inter-Bold.ttf', fontWeight: 700 }
  ]
});

// Interfacce dati (stesse di OpenResume)
interface CoverLetterData {
  personal: {
    name: string;
    title: string;
    email: string;
    phone: string;
    linkedin?: string;
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
}

// TEMA 1: Moderno/Minimal - Stile OpenResume
const modernStyles = StyleSheet.create({
  page: {
    fontFamily: 'Inter',
    fontSize: 11,
    color: '#2d3748',
    backgroundColor: '#ffffff',
    paddingTop: 40,
    paddingBottom: 40,
    paddingLeft: 40,
    paddingRight: 40,
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#4299e1',
    borderBottomStyle: 'solid',
  },
  nameSection: {
    display: 'flex',
    flexDirection: 'column',
  },
  name: {
    fontSize: 20,
    fontWeight: 700,
    color: '#1a202c',
    marginBottom: 4,
  },
  title: {
    fontSize: 12,
    color: '#4299e1',
    fontWeight: 500,
  },
  contact: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    fontSize: 9,
    color: '#718096',
  },
  contactItem: {
    marginBottom: 2,
  },
  date: {
    fontSize: 10,
    color: '#718096',
    marginBottom: 16,
  },
  companyInfo: {
    marginBottom: 20,
  },
  companyName: {
    fontSize: 12,
    fontWeight: 600,
    color: '#2d3748',
    marginBottom: 4,
  },
  jobTitle: {
    fontSize: 11,
    color: '#4a5568',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 11,
    fontWeight: 500,
    color: '#2d3748',
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 10.5,
    lineHeight: 1.6,
    textAlign: 'justify',
    marginBottom: 12,
  },
  closing: {
    fontSize: 11,
    fontWeight: 500,
    color: '#2d3748',
    marginTop: 20,
    marginBottom: 8,
  },
  signature: {
    fontSize: 12,
    fontWeight: 600,
    color: '#4299e1',
  },
});

// TEMA 2: Elegante/Professionale - Stile più formale
const elegantStyles = StyleSheet.create({
  page: {
    fontFamily: 'Inter',
    fontSize: 11,
    color: '#1a1a1a',
    backgroundColor: '#ffffff',
    paddingTop: 35,
    paddingBottom: 40,
    paddingLeft: 45,
    paddingRight: 45,
  },
  headerBackground: {
    backgroundColor: '#2c3e50',
    marginTop: -35,
    marginLeft: -45,
    marginRight: -45,
    paddingTop: 25,
    paddingBottom: 25,
    paddingLeft: 45,
    paddingRight: 45,
    marginBottom: 25,
  },
  headerContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  name: {
    fontSize: 22,
    fontWeight: 400,
    color: '#ffffff',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 12,
    color: '#ecf0f1',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  contact: {
    fontSize: 9,
    color: '#bdc3c7',
    textAlign: 'center',
  },
  date: {
    fontSize: 10,
    color: '#666666',
    textAlign: 'right',
    fontStyle: 'italic',
    marginBottom: 18,
  },
  companyInfo: {
    marginBottom: 22,
  },
  companyName: {
    fontSize: 12,
    fontWeight: 600,
    color: '#2c3e50',
    marginBottom: 3,
  },
  jobTitle: {
    fontSize: 11,
    color: '#555555',
    fontStyle: 'italic',
    marginBottom: 18,
  },
  greeting: {
    fontSize: 11,
    fontWeight: 500,
    color: '#2c3e50',
    marginBottom: 16,
  },
  paragraph: {
    fontSize: 10.5,
    lineHeight: 1.7,
    textAlign: 'justify',
    marginBottom: 14,
  },
  closing: {
    fontSize: 11,
    fontWeight: 500,
    color: '#2c3e50',
    marginTop: 24,
    marginBottom: 12,
  },
  signature: {
    fontSize: 13,
    fontWeight: 600,
    color: '#2c3e50',
  },
});

// Componente Tema Moderno
export const CoverLetterModernPDF: React.FC<{ data: CoverLetterData }> = ({ data }) => (
  <Document>
    <Page size="A4" style={modernStyles.page}>
      {/* Header riutilizzabile da OpenResume */}
      <View style={modernStyles.header}>
        <View style={modernStyles.nameSection}>
          <Text style={modernStyles.name}>{data.personal.name}</Text>
          <Text style={modernStyles.title}>{data.personal.title}</Text>
        </View>
        <View style={modernStyles.contact}>
          <Text style={modernStyles.contactItem}>{data.personal.email}</Text>
          <Text style={modernStyles.contactItem}>{data.personal.phone}</Text>
          {data.personal.linkedin && (
            <Text style={modernStyles.contactItem}>{data.personal.linkedin}</Text>
          )}
        </View>
      </View>

      {/* Data */}
      <Text style={modernStyles.date}>{new Date().toLocaleDateString('it-IT')}</Text>

      {/* Informazioni azienda */}
      <View style={modernStyles.companyInfo}>
        <Text style={modernStyles.companyName}>{data.company.name}</Text>
        <Text style={modernStyles.jobTitle}>Oggetto: Candidatura per {data.company.jobTitle}</Text>
      </View>

      {/* Contenuto lettera */}
      <Text style={modernStyles.greeting}>{data.content.greeting}</Text>
      
      {data.content.body.map((paragraph, index) => (
        <Text key={index} style={modernStyles.paragraph}>
          {paragraph}
        </Text>
      ))}

      <Text style={modernStyles.closing}>{data.content.closing}</Text>
      <Text style={modernStyles.signature}>{data.personal.name}</Text>
    </Page>
  </Document>
);

// Componente Tema Elegante
export const CoverLetterElegantPDF: React.FC<{ data: CoverLetterData }> = ({ data }) => (
  <Document>
    <Page size="A4" style={elegantStyles.page}>
      {/* Header con background */}
      <View style={elegantStyles.headerBackground}>
        <View style={elegantStyles.headerContent}>
          <Text style={elegantStyles.name}>{data.personal.name}</Text>
          <Text style={elegantStyles.title}>{data.personal.title}</Text>
          <Text style={elegantStyles.contact}>
            {data.personal.email} • {data.personal.phone}
            {data.personal.linkedin && ` • ${data.personal.linkedin}`}
          </Text>
        </View>
      </View>

      {/* Data */}
      <Text style={elegantStyles.date}>Milano, {new Date().toLocaleDateString('it-IT')}</Text>

      {/* Informazioni azienda */}
      <View style={elegantStyles.companyInfo}>
        <Text style={elegantStyles.companyName}>{data.company.name}</Text>
        <Text style={elegantStyles.jobTitle}>Re: {data.company.jobTitle}</Text>
      </View>

      {/* Contenuto lettera */}
      <Text style={elegantStyles.greeting}>{data.content.greeting}</Text>
      
      {data.content.body.map((paragraph, index) => (
        <Text key={index} style={elegantStyles.paragraph}>
          {paragraph}
        </Text>
      ))}

      <Text style={elegantStyles.closing}>{data.content.closing}</Text>
      <Text style={elegantStyles.signature}>{data.personal.name}</Text>
    </Page>
  </Document>
);

// Dati di esempio per testing
export const sampleCoverLetterData: CoverLetterData = {
  personal: {
    name: "Marco Rossi",
    title: "Full Stack Developer",
    email: "marco.rossi@email.com",
    phone: "+39 328 123 4567",
    linkedin: "linkedin.com/in/marcorossi"
  },
  company: {
    name: "TechInnovate S.r.l.",
    jobTitle: "Senior React Developer"
  },
  content: {
    greeting: "Gentili Signori,",
    body: [
      "Scrivo per esprimere il mio forte interesse per la posizione di Senior React Developer presso TechInnovate. Con oltre 5 anni di esperienza nello sviluppo front-end e una passione per l'innovazione tecnologica, sono convinto di poter contribuire significativamente al successo del vostro team.",
      "Nel mio ruolo attuale in DevSolutions, ho guidato lo sviluppo di applicazioni React scalabili che servono oltre 100.000 utenti giornalieri. Ho implementato architetture moderne utilizzando TypeScript, Redux Toolkit e Next.js, riducendo i tempi di caricamento del 40% e migliorando l'esperienza utente.",
      "Sono particolarmente interessato al vostro progetto di piattaforma e-commerce menzionato nell'annuncio. La mia esperienza con microservizi e API RESTful, combinata con la conoscenza di Node.js e PostgreSQL, mi permetterebbe di contribuire immediatamente sia al frontend che al backend.",
      "Sarei entusiasta di discutere come le mie competenze in React, la mia esperienza con metodologie Agile e la mia passione per il clean code possano supportare gli obiettivi di crescita di TechInnovate."
    ],
    closing: "Cordiali saluti,"
  }
};

// Hook per generazione PDF (stesso pattern di OpenResume)
import { usePDF } from '@react-pdf/renderer';

export const useCoverLetterPDF = (theme: 'modern' | 'elegant', data: CoverLetterData) => {
  const Component = theme === 'modern' ? CoverLetterModernPDF : CoverLetterElegantPDF;
  const [instance, updateInstance] = usePDF({ document: <Component data={data} /> });
  
  return {
    instance,
    updateInstance,
    loading: instance.loading,
    error: instance.error,
    url: instance.url,
    blob: instance.blob
  };
};

// Integrazione con Redux (stesso pattern di OpenResume)
export interface CoverLetterState {
  personal: CoverLetterData['personal'];
  company: CoverLetterData['company'];
  content: CoverLetterData['content'];
  theme: 'modern' | 'elegant';
  isGenerating: boolean;
}

// Selectors Redux
export const selectCoverLetterData = (state: { coverLetter: CoverLetterState }): CoverLetterData => ({
  personal: state.coverLetter.personal,
  company: state.coverLetter.company,
  content: state.coverLetter.content
});

export const selectCoverLetterTheme = (state: { coverLetter: CoverLetterState }) => 
  state.coverLetter.theme;
