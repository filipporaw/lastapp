import "globals.css";
import { TopNavBar } from "components/TopNavBar";

export const metadata = {
  title: "cv---maker",
  description:
    "cv---maker is a free, open-source, and powerful resume builder that allows anyone to create a modern professional resume in 3 simple steps. For those who have an existing resume, cv---maker also provides a resume parser to help test and confirm its ATS readability.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" href="/fonts/fonts.css" as="style" />
        <link rel="stylesheet" href="/fonts/fonts.css" />
      </head>
      <body>
        <TopNavBar />
        {children}
      </body>
    </html>
  );
}
