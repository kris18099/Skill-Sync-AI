import "./globals.css";

export const metadata = {
  title: "SkillSync AI - Resume Analyzer",
  description: "Enterprise-grade AI resume analysis and skill gap detection.",
};

import Navbar from "@/components/Navbar";

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body>
        <div className="background-effects">
          <div className="glow-orb orb-1"></div>
          <div className="glow-orb orb-2"></div>
        </div>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
