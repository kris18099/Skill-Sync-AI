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
          colorPrimary: "#6366F1", // Indigo primary button
          colorBackground: "#0A0E1F", // Dark Background
          colorInputBackground: "#131A35", // Dark input background
          colorInputText: "#FFFFFF", // White input text
          colorText: "#FFFFFF",
          colorTextSecondary: "#94A3B8", // High-contrast light grey/blue for secondary text/labels
          colorDanger: "#FB7185", // Rose warning/error color
        },
        elements: {
          card: {
            backgroundColor: "#0A0E1F",
            border: "1px solid rgba(99, 102, 241, 0.2)",
            boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.5)",
            borderRadius: "16px",
          },
          logoBox: {
            display: "none", // Hide default Clerk logo
          },
          footerAction: {
            display: "none", // Hide default footer toggle
          },
          dividerLine: {
            backgroundColor: "rgba(255, 255, 255, 0.15)",
          },
          dividerText: {
            color: "#FFFFFF",
            fontWeight: "500",
          },
          headerTitle: {
            color: "#FFFFFF",
            fontFamily: "'Outfit', sans-serif",
            fontWeight: "700",
          },
          headerSubtitle: {
            color: "#22D3EE", // Cyan accent subtitle
            fontSize: "0.95rem",
          },
          formFieldLabel: {
            color: "#FFFFFF",
            fontWeight: "500",
          },
          formFieldInput: {
            backgroundColor: "#131A35",
            color: "#FFFFFF",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            "&:focus": {
              borderColor: "#6366F1",
              boxShadow: "0 0 0 1px #6366F1",
            }
          },
          formFieldAction: {
            color: "#22D3EE !important",
            fontWeight: "600",
            "&:hover": {
              color: "#6366F1 !important",
            }
          },
          formResendCodeLink: {
            color: "#22D3EE",
            "&:hover": {
              color: "#6366F1",
            }
          },
          formButtonPrimary: {
            color: "#FFFFFF !important",
            backgroundColor: "#6366F1 !important",
            "&:hover": {
              backgroundColor: "#4F46E5 !important",
              color: "#FFFFFF !important",
            },
            "&:focus": {
              backgroundColor: "#4F46E5 !important",
              color: "#FFFFFF !important",
            },
            "&:active": {
              backgroundColor: "#4338CA !important",
              color: "#FFFFFF !important",
            }
          },
          formFieldInputShowHideButton: {
            color: "#22D3EE",
            "&:hover": {
              color: "#6366F1",
            }
          },
          socialButtonsBlockButton: {
            backgroundColor: "#131A35",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            color: "#FFFFFF !important",
            transition: "all 0.2s ease",
            "&:hover": {
              backgroundColor: "#1C254B",
              borderColor: "rgba(255, 255, 255, 0.3)",
              color: "#FFFFFF !important",
            }
          },
          socialButtonsBlockButtonText: {
            color: "#FFFFFF !important",
            fontWeight: "600",
            "&:hover": {
              color: "#FFFFFF !important",
            }
          },
          identityPreviewText: {
            color: "#FFFFFF",
          },
          identityPreviewEditButtonIcon: {
            color: "#22D3EE",
          },
          // Account Indicator / User Button Dropdown Customization
          userButtonPopoverCard: {
            backgroundColor: "#0A0E1F",
            border: "1px solid rgba(99, 102, 241, 0.3)",
            boxShadow: "0 10px 40px 0 rgba(0, 0, 0, 0.6)",
            borderRadius: "14px",
            padding: "8px",
          },
          userButtonPopoverMain: {
            backgroundColor: "#0A0E1F",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            padding: "12px",
          },
          userPreviewMainIdentifier: {
            color: "#FFFFFF !important", // High contrast white for user name
            fontWeight: "700 !important",
          },
          userPreviewSecondaryIdentifier: {
            color: "#22D3EE !important", // Cyan accent for email/secondary identifier
          },
          userButtonPopoverTitle: {
            color: "#FFFFFF",
            fontWeight: "700",
          },
          userButtonPopoverSubtitle: {
            color: "#22D3EE",
          },
          userButtonPopoverActionButton: {
            color: "#FFFFFF !important",
            transition: "all 0.2s ease",
            "&:hover": {
              backgroundColor: "rgba(99, 102, 241, 0.15) !important", // Lighter indigo-tinted highlight
              color: "#FFFFFF !important", // Ensure text stays white on hover
            },
            "&:focus": {
              backgroundColor: "rgba(99, 102, 241, 0.25) !important",
              color: "#FFFFFF !important",
            },
            "&:active": {
              backgroundColor: "rgba(99, 102, 241, 0.3) !important",
              color: "#FFFFFF !important",
            }
          },
          userButtonPopoverActionButtonText: {
            color: "#FFFFFF !important",
            fontWeight: "600",
            "&:hover": {
              color: "#FFFFFF !important",
            }
          },
          userButtonPopoverActionButtonIcon: {
            color: "#FFFFFF !important",
            "&:hover": {
              color: "#FFFFFF !important",
            }
          },
          userButtonPopoverFooter: {
            backgroundColor: "#0A0E1F",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            "& button": {
              color: "#FB7185 !important", // Rose for Sign Out
              "&:hover": {
                color: "#FFFFFF !important", // Turns white on hover
                backgroundColor: "rgba(251, 113, 133, 0.15) !important", // Lighter rose-tinted highlight on hover
              }
            }
          }
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


