"use client";
import { getHasUsedAppBefore } from "lib/redux/local-storage";
import { ResumeDropzone } from "components/ResumeDropzone";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Home() {
  const [hasUsedAppBefore, setHasUsedAppBefore] = useState(false);
  const [hasAddedResume, setHasAddedResume] = useState(false);
  const onFileUrlChange = (fileUrl: string) => {
    setHasAddedResume(Boolean(fileUrl));
  };

  useEffect(() => {
    setHasUsedAppBefore(getHasUsedAppBefore());
  }, []);

  return (
    <main className="h-screen terminal-bg flex items-center justify-center overflow-hidden">
      <div className="mx-auto max-w-md terminal-border px-6 py-8 text-center bg-white">
        {!hasUsedAppBefore ? (
          <>
            <div className="mb-4">
              <h1 className="text-lg font-bold terminal-text mb-2">
                CREATE YOUR PROFESSIONAL RESUME
              </h1>
              <p className="text-xs terminal-text">
                Import data from an existing resume or start from scratch
              </p>
            </div>
            <ResumeDropzone
              onFileUrlChange={onFileUrlChange}
              className="mt-3"
            />
            {!hasAddedResume && (
              <>
                <OrDivider />
                <SectionWithHeadingAndCreateButton
                  heading="Don't have a resume yet?"
                  buttonText="Create from scratch"
                />
              </>
            )}
          </>
        ) : (
          <>
            {!hasAddedResume && (
              <>
                <SectionWithHeadingAndCreateButton
                  heading="You have data saved in browser from prior session"
                  buttonText="Continue where I left off"
                />
                <OrDivider />
              </>
            )}
            <h1 className="text-base font-bold terminal-text mb-2">
              Override data with a new resume
            </h1>
            <ResumeDropzone
              onFileUrlChange={onFileUrlChange}
              className="mt-3"
            />
          </>
        )}
      </div>
    </main>
  );
}

const OrDivider = () => (
  <div className="mx-[-1.5rem] flex items-center pb-3 pt-4" aria-hidden="true">
    <div className="flex-grow border-t border-black" />
    <span className="mx-2 mt-[-2px] flex-shrink text-xs terminal-text font-medium">OR</span>
    <div className="flex-grow border-t border-black" />
  </div>
);

const SectionWithHeadingAndCreateButton = ({
  heading,
  buttonText,
}: {
  heading: string;
  buttonText: string;
}) => {
  return (
    <>
      <p className="text-sm font-semibold terminal-text mb-2">{heading}</p>
      <div className="mt-2">
        <Link
          href="/resume-builder"
          className="inline-flex items-center justify-center rounded-none bg-black text-white px-4 py-2 text-xs font-semibold border border-black hover:bg-gray-800 transition-all duration-300"
        >
          {buttonText}
        </Link>
      </div>
    </>
  );
};
