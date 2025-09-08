"use client";
import { useEffect } from "react";
import { useJSON, useSetDefaultScale } from "components/Resume/hooks";
import {
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import { usePDF } from "@react-pdf/renderer";
import dynamic from "next/dynamic";
import { loadStateFromLocalStorage } from "lib/redux/local-storage";

const ResumeControlBar = ({
  scale,
  setScale,
  documentSize,
  document,
  fileName,
}: {
  scale: number;
  setScale: (scale: number) => void;
  documentSize: string;
  document: JSX.Element;
  fileName: string;
}) => {
  const { scaleOnResize, setScaleOnResize } = useSetDefaultScale({
    setScale,
    documentSize,
  });

  const [instance, update] = usePDF({ document });

  const { url, update: updateUrl } = useJSON();

  // Hook to update pdf when document changes
  useEffect(() => {
    update();
  }, [update, document]);

  // Hook to update json download when document changes
  useEffect(() => {
    updateUrl();
  }, [updateUrl, document]);

  return (
    <div className="sticky bottom-0 left-0 right-0 flex h-[var(--resume-control-bar-height)] items-center justify-between px-[var(--resume-padding)] text-gray-600 bg-white border-t border-gray-200 shadow-sm">
      <div className="flex items-center gap-3 min-w-0">
        <MagnifyingGlassIcon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
        <input
          type="range"
          min={0.5}
          max={1.5}
          step={0.01}
          value={scale}
          onChange={(e) => {
            setScaleOnResize(false);
            setScale(Number(e.target.value));
          }}
          className="w-32 flex-shrink-0"
        />
        <div className="w-12 text-sm font-medium flex-shrink-0">{`${Math.round(scale * 100)}%`}</div>
        <label className="flex items-center gap-2 flex-shrink-0">
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={scaleOnResize}
            onChange={() => setScaleOnResize((prev) => !prev)}
          />
          <span className="select-none text-sm">Autoscale</span>
        </label>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* JSON download functionality kept but hidden - can be re-enabled in future */}
        {/* <a
          className="flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200 bg-white shadow-sm"
          href={url!}
          download={`${fileName}.json`}
        >
          <DocumentTextIcon className="h-4 w-4" />
          <span className="whitespace-nowrap text-sm font-medium">Download JSON</span>
        </a> */}
        <a
          className="flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200 bg-white shadow-sm"
          href={instance.url!}
          download={fileName}
        >
          <ArrowDownTrayIcon className="h-4 w-4" />
          <span className="whitespace-nowrap text-sm font-medium">Download Resume</span>
        </a>
      </div>
    </div>
  );
};

/**
 * Load ResumeControlBar client side since it uses usePDF, which is a web specific API
 */
export const ResumeControlBarCSR = dynamic(
  () => Promise.resolve(ResumeControlBar),
  {
    ssr: false,
  }
);

export const ResumeControlBarBorder = () => (
  <div className="absolute bottom-[var(--resume-control-bar-height)] w-full border-t-2 bg-gray-50" />
);
