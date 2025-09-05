import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "lib/redux/store";

export interface CoverLetterProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
  date: string;
  company: string;
  position: string;
  hiringManager: string;
  closing: string;
}

export interface CoverLetter {
  profile: CoverLetterProfile;
  content: string;
}

export const initialCoverLetterProfile: CoverLetterProfile = {
  name: "",
  email: "",
  phone: "",
  location: "",
  date: "",
  company: "",
  position: "",
  hiringManager: "",
  closing: "",
};

export const initialCoverLetterState: CoverLetter = {
  profile: initialCoverLetterProfile,
  content: "",
};

export const coverLetterSlice = createSlice({
  name: "coverLetter",
  initialState: initialCoverLetterState,
  reducers: {
    changeCoverLetterProfile: (
      draft,
      action: PayloadAction<{ field: keyof CoverLetterProfile; value: string }>
    ) => {
      const { field, value } = action.payload;
      draft.profile[field] = value;
    },
    changeCoverLetterContent: (
      draft,
      action: PayloadAction<{ value: string }>
    ) => {
      const { value } = action.payload;
      draft.content = value;
    },
    setCoverLetter: (draft, action: PayloadAction<CoverLetter>) => {
      return action.payload;
    },
  },
});

export const {
  changeCoverLetterProfile,
  changeCoverLetterContent,
  setCoverLetter,
} = coverLetterSlice.actions;

export const selectCoverLetter = (state: RootState) => state.coverLetter;

export default coverLetterSlice.reducer;
