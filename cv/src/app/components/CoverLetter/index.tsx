"use client";
import { useState, useMemo } from "react";
import { CoverLetterIframeCSR } from "components/CoverLetter/CoverLetterIFrame";
import { CoverLetterPDF } from "components/CoverLetter/CoverLetterPDF";
import {
  CoverLetterControlBarCSR,
  CoverLetterControlBarBorder,
} from "components/CoverLetter/CoverLetterControlBar";
import { FlexboxSpacer } from "components/FlexboxSpacer";
import { useAppSelector } from "lib/redux/hooks";
import { selectCoverLetter } from "lib/redux/coverLetterSlice";
import { selectSettings } from "lib/redux/settingsSlice";
import { DEBUG_RESUME_PDF_FLAG } from "lib/constants";
import {
  useRegisterReactPDFFont,
  useRegisterReactPDFHyphenationCallback,
} from "components/fonts/hooks";
import { NonEnglishFontsCSSLazyLoader } from "components/fonts/NonEnglishFontsCSSLoader";

export const CoverLetter = () => {
  const [scale, setScale] = useState(0.8);
  const coverLetter = useAppSelector(selectCoverLetter);
  const settings = useAppSelector(selectSettings);
  const document = useMemo(
    () => <CoverLetterPDF coverLetter={coverLetter} settings={settings} isPDF={true} />,
    [coverLetter, settings]
  );

  useRegisterReactPDFFont();
  useRegisterReactPDFHyphenationCallback(settings.fontFamily);

  return (
    <>
      <NonEnglishFontsCSSLazyLoader />
      <div className="relative flex justify-center md:justify-start">
        <FlexboxSpacer maxWidth={50} className="hidden md:block" />
        <div className="relative">
          <section className="h-[calc(100vh-var(--top-nav-bar-height)-var(--resume-control-bar-height))] overflow-auto md:p-[var(--resume-padding)]">
            <CoverLetterIframeCSR
              documentSize={settings.documentSize}
              scale={scale}
              enablePDFViewer={DEBUG_RESUME_PDF_FLAG ?? false}
            />
          </section>
          <CoverLetterControlBarCSR
            scale={scale}
            setScale={setScale}
            documentSize={settings.documentSize}
            document={document}
            fileName={coverLetter.profile.name + " - Cover Letter"}
          />
        </div>
        <CoverLetterControlBarBorder />
      </div>
    </>
  );
};
