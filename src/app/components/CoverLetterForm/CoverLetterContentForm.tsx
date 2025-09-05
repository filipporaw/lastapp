"use client";
import { useAppDispatch, useAppSelector } from "lib/redux/hooks";
import { changeCoverLetterContent, selectCoverLetter } from "lib/redux/coverLetterSlice";

export const CoverLetterContentForm = () => {
  const coverLetter = useAppSelector(selectCoverLetter);
  const dispatch = useAppDispatch();
  const { content } = coverLetter;

  const handleContentChange = (value: string) => {
    dispatch(changeCoverLetterContent({ value }));
  };

  return (
    <section className="flex flex-col gap-3 rounded-md bg-white p-6 pt-4 shadow transition-opacity duration-200">
      <div className="col-span-full">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cover Letter Content
        </label>
        <textarea
          className="w-full h-96 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          placeholder=""
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
        />
      </div>
    </section>
  );
};
