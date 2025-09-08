"use client";
import { useMemo } from "react";
import Frame from "react-frame-component";
import {
  A4_HEIGHT_PX,
  A4_WIDTH_PX,
  A4_WIDTH_PT,
  LETTER_HEIGHT_PX,
  LETTER_WIDTH_PX,
  LETTER_WIDTH_PT,
} from "lib/constants";
import { CoverLetterPDF } from "components/CoverLetter/CoverLetterPDF";
import { CoverLetterModernHTML } from "components/CoverLetter/CoverLetterThemesHTML";
import { useAppSelector } from "lib/redux/hooks";
import { selectCoverLetter } from "lib/redux/coverLetterSlice";
import { selectSettings } from "lib/redux/settingsSlice";
import { DEBUG_RESUME_PDF_FLAG } from "lib/constants";
import dynamic from "next/dynamic";
import { getAllFontFamiliesToLoad } from "components/fonts/lib";

const getIframeInitialContent = (isA4: boolean) => {
  const width = isA4 ? A4_WIDTH_PT : LETTER_WIDTH_PT;
  const allFontFamilies = getAllFontFamiliesToLoad();

  const allFontFamiliesPreloadLinks = allFontFamilies
    .map(
      (
        font
      ) => `<link rel="preload" as="font" href="/fonts/${font}-Regular.ttf" type="font/ttf" crossorigin="anonymous">
<link rel="preload" as="font" href="/fonts/${font}-Bold.ttf" type="font/ttf" crossorigin="anonymous">`
    )
    .join("");

  const allFontFamiliesFontFaces = allFontFamilies
    .map(
      (
        font
      ) => `@font-face {font-family: "${font}"; src: url("/fonts/${font}-Regular.ttf");}
@font-face {font-family: "${font}"; src: url("/fonts/${font}-Bold.ttf"); font-weight: bold;}`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
  <head>
    ${allFontFamiliesPreloadLinks}
    <style>
      ${allFontFamiliesFontFaces}
    </style>
  </head>
  <body style='overflow: hidden; width: ${width}pt; margin: 0; padding: 0; -webkit-text-size-adjust:none;'>
    <div></div>
  </body>
</html>`;
};

const CoverLetterIframe = ({
  documentSize,
  scale,
  enablePDFViewer = false,
}: {
  documentSize: string;
  scale: number;
  enablePDFViewer?: boolean;
}) => {
  const isA4 = documentSize === "A4";
  const iframeInitialContent = useMemo(
    () => getIframeInitialContent(isA4),
    [isA4]
  );
  
  const coverLetter = useAppSelector(selectCoverLetter);
  const settings = useAppSelector(selectSettings);

  if (enablePDFViewer) {
    return (
      <div className="w-full h-full">
        <CoverLetterPDF
          coverLetter={coverLetter}
          settings={settings}
          isPDF={true}
        />
      </div>
    );
  }

  // Converti i dati del cover letter nel nuovo formato semplificato
  const coverLetterData = {
    personal: {
      name: coverLetter.profile.name,
      title: coverLetter.profile.position || "",
      email: coverLetter.profile.email,
      phone: coverLetter.profile.phone,
      website: coverLetter.profile.location || "website.com"
    },
    company: {
      name: coverLetter.profile.company,
      jobTitle: coverLetter.profile.position
    },
    content: {
      greeting: coverLetter.profile.hiringManager || "Dear Hiring Manager,",
      body: coverLetter.content ? 
        // Dividi il contenuto solo sui doppi invii a capo per creare paragrafi reali
        coverLetter.content.split(/\n\s*\n/).filter((p: string) => p.trim().length > 0) :
        [
          "Scrivo per esprimere il mio forte interesse per la posizione di " + coverLetter.profile.position + " presso " + coverLetter.profile.company + "."
        ],
      closing: coverLetter.profile.closing || "Kind Regards,"
    },
    date: coverLetter.profile.date || new Date().toLocaleDateString('it-IT')
  };

  const width = isA4 ? A4_WIDTH_PX : LETTER_WIDTH_PX;
  const height = isA4 ? A4_HEIGHT_PX : LETTER_HEIGHT_PX;

  return (
    <div
      style={{
        maxWidth: `${width * scale}px`,
        maxHeight: `${height * scale}px`,
      }}
    >
      <div
        style={{
          width: `${width}px`,
          height: `${height}px`,
          transform: `scale(${scale})`,
        }}
        className="origin-top-left bg-white shadow-lg"
      >
        <Frame
          style={{ width: "100%", height: "100%" }}
          initialContent={iframeInitialContent}
          key={isA4 ? "A4" : "LETTER"}
        >
          <CoverLetterModernHTML 
            data={coverLetterData} 
            settings={settings}
          />
        </Frame>
      </div>
    </div>
  );
};

export const CoverLetterIframeCSR = dynamic(() => Promise.resolve(CoverLetterIframe), {
  ssr: false,
}); 
