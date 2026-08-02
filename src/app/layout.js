import "./globals.css";
import Navbar from "@/components/Navbar";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { AuthModalProvider } from "@/context/AuthModalContext";

export const metadata = {
  title: "SkillSync AI - Resume Analyzer",
  description: "Enterprise-grade AI resume analysis and skill gap detection.",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#6366F1",
          colorBackground: "#0A0E1F",
          colorInputBackground: "#131A35",
          colorInputText: "#FFFFFF",
          colorText: "#FFFFFF",
          colorTextSecondary: "#94A3B8",
          colorDanger: "#FB7185",
        },
        elements: {
          card: {
            backgroundColor: "#0A0E1F",
            border: "1px solid rgba(99, 102, 241, 0.2)",
            boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.5)",
            borderRadius: "16px",
          },
          logoBox: {
            display: "none",
          },
          headerSubtitle: {
            color: "#22D3EE",
          },
        }
      }}
      localization={{
        signIn: {
          start: {
            title: "Sign in to SkillSync AI",
            subtitle: "to continue to your account",
          }
        },
        signUp: {
          start: {
            title: "Create your SkillSync AI account",
            subtitle: "to start building or analyzing your resume",
          }
        }
      }}
    >
      <html lang="en" data-theme="dark" suppressHydrationWarning>
        <body>
          <AuthModalProvider>
            <div className="background-effects">
              <div className="glow-orb orb-1"></div>
              <div className="glow-orb orb-2"></div>
            </div>
            <Navbar />
            {children}
          </AuthModalProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}


