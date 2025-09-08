import "globals.css";
import { TopNavBar } from "components/TopNavBar";

export const metadata = {
  metadataBase: new URL('https://cv-maker.vercel.app'), // Add your actual domain here
  title: "cv---maker",
  description:
    "cv---maker is a free, open-source, and powerful resume builder that allows anyone to create a modern professional resume in 3 simple steps. For those who have an existing resume, cv---maker also provides a resume parser to help test and confirm its ATS readability.",
  openGraph: {
    title: "cv---maker - Free Resume Builder",
    description: "Create resumes in 3 simple steps. Free, open-source, and ATS-friendly resume builder with PDF import functionality.",
    type: "website",
    siteName: "cv---maker",
    images: [
      {
        url: "/og-image.png", // You can add an Open Graph image later
        width: 1200,
        height: 630,
        alt: "cv---maker - Professional Resume Builder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "cv---maker - Free Resume Builder",
    description: "Create resumes in 3 simple steps. Free, open-source, and ATS-friendly resume builder.",
    images: ["/og-image.png"],
  },
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
