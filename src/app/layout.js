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
        layout: {
          unsafe_disableDevelopmentModeWarnings: true,
        },
        variables: {
          colorPrimary: "#6366F1",
          colorBackground: "#0A0E1F",
          colorInputBackground: "#131A35",
          colorInputText: "#FFFFFF",
          colorText: "#ffffff",
          colorTextSecondary: "#e5e5e5",
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
          headerTitle: {
            color: "#FFFFFF",
            fontFamily: "'Outfit', sans-serif",
            fontWeight: "700",
          },
          headerSubtitle: {
            color: "#22D3EE",
            fontSize: "0.95rem",
          },
          formFieldLabel: {
            color: "#ffffff",
          },
          socialButtonsBlockButtonText: {
            color: "#FFFFFF",
            fontWeight: "600",
          },
          socialButtonsBlockButton: {
            backgroundColor: "#131A35",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            color: "#FFFFFF",
            transition: "all 0.2s ease",
          },
          dividerText: {
            color: "#FFFFFF",
            fontWeight: "500",
          },
          dividerLine: {
            backgroundColor: "rgba(255, 255, 255, 0.15)",
          },
          formButtonPrimary: {
            color: "#FFFFFF",
            backgroundColor: "#6366F1",
            "&:hover": {
              backgroundColor: "#4F46E5",
            },
          },
          formFieldInput: {
            backgroundColor: "#131A35",
            color: "#FFFFFF",
            border: "1px solid rgba(255, 255, 255, 0.15)",
          },
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
            color: "#ffffff",
          },
          userPreviewSecondaryIdentifier: {
            color: "#e5e5e5",
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
              backgroundColor: "rgba(99, 102, 241, 0.15) !important",
              color: "#FFFFFF !important",
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
          },
          userButtonPopoverActionButtonIcon: {
            color: "#FFFFFF !important",
          },
          userButtonPopoverFooter: {
            backgroundColor: "#0A0E1F",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            "& button": {
              color: "#FB7185 !important",
              "&:hover": {
                color: "#FFFFFF !important",
                backgroundColor: "rgba(251, 113, 133, 0.15) !important",
              }
            }
          },
          // UserProfile / Manage Account Specific Customizations
          profilePageTitle: {
            color: "#FFFFFF !important",
            fontFamily: "'Outfit', sans-serif",
            fontWeight: "700 !important",
          },
          profilePageSubtitle: {
            color: "#FFFFFF !important",
            fontSize: "0.95rem !important",
          },
          profileSectionTitle: {
            borderBottom: "1px solid rgba(255, 255, 255, 0.15) !important",
            paddingBottom: "8px !important",
            color: "#FFFFFF !important",
          },
          profileSectionTitleText: {
            color: "#FFFFFF !important",
            fontWeight: "700 !important",
            fontSize: "1.1rem !important",
          },
          navbarButton: {
            color: "#FFFFFF !important",
            "&[data-active='true']": {
              color: "#FFFFFF !important",
            },
            "&:hover": {
              color: "#FFFFFF !important",
              backgroundColor: "rgba(255, 255, 255, 0.05) !important",
            }
          },
          navbarButtonText: {
            color: "inherit !important",
            fontWeight: "600 !important",
          },
          userPreviewTitle: {
            color: "#FFFFFF !important",
            fontWeight: "600 !important",
          },
          userPreviewSubtitle: {
            color: "#22D3EE !important",
          },
          profileSectionHeaderTitle: {
            color: "#FFFFFF !important",
            fontWeight: "600 !important",
          },
          profileSectionHeaderSubtitle: {
            color: "#FFFFFF !important",
          },
          profileSectionContent: {
            color: "#ffffff",
          },
          accordionTriggerButton: {
            color: "#ffffff",
          },
          scrollBox: {
            backgroundColor: "#0A0E1F !important",
          },
          pageScrollBox: {
            backgroundColor: "#0A0E1F !important",
          },
          navbar: {
            borderRight: "1px solid rgba(255, 255, 255, 0.1) !important",
          },
          profileSection: {
            borderBottom: "1px solid rgba(255, 255, 255, 0.1) !important",
          },
          small: {
            color: "#FFFFFF !important",
          },
          label: {
            color: "#FFFFFF !important",
          },
          p: {
            color: "#FFFFFF !important",
          },
          span: {
            color: "#FFFFFF !important",
          },
          breadcrumbsItem: {
            color: "#FFFFFF !important",
          },
          breadcrumbsItemText: {
            color: "#FFFFFF !important",
          },
          identityPreviewText: {
            color: "#FFFFFF !important",
          },
          identityPreviewEditButtonIcon: {
            color: "#FFFFFF !important",
          },
          formButtonReset: {
            color: "#FFFFFF !important",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.05) !important",
            }
          },
          badge: {
            color: "#ffffff",
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


