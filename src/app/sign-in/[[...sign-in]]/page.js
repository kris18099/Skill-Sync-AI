"use client";

import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useEffect, useState } from "react";

export default function SignInPage() {
  const [currentTheme, setCurrentTheme] = useState("dark");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const theme = document.documentElement.getAttribute("data-theme") || "dark";
    setCurrentTheme(theme);

    const observer = new MutationObserver(() => {
      const updatedTheme = document.documentElement.getAttribute("data-theme") || "dark";
      setCurrentTheme(updatedTheme);
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  const isDark = currentTheme === "dark";

  const clerkAppearance = {
    baseTheme: isDark ? dark : undefined,
    variables: {
      colorPrimary: "#6366F1",
      colorBackground: isDark ? "#0A0E1F" : "#FFFFFF",
      colorInputBackground: isDark ? "#131A35" : "#F8FAFC",
      colorInputText: isDark ? "#FFFFFF" : "#0F172A",
      colorText: isDark ? "#FFFFFF" : "#0F172A",
      colorTextSecondary: isDark ? "#94A3B8" : "#4F46E5",
    },
    elements: {
      card: {
        backgroundColor: isDark ? "#0A0E1F" : "#FFFFFF",
        border: isDark ? "1px solid rgba(99, 102, 241, 0.2)" : "1px solid #E2E8F0",
        boxShadow: isDark ? "0 8px 32px 0 rgba(0, 0, 0, 0.5)" : "0 8px 32px 0 rgba(0, 0, 0, 0.05)",
        borderRadius: "16px",
      },
      headerTitle: {
        color: isDark ? "#FFFFFF" : "#0F172A",
        fontFamily: "'Outfit', sans-serif",
        fontWeight: "700",
      },
      headerSubtitle: {
        color: isDark ? "#22D3EE" : "#4F46E5",
        fontSize: "0.95rem",
      },
      formFieldLabel: {
        color: isDark ? "#FFFFFF" : "#0F172A",
        fontWeight: "500",
      },
      socialButtonsBlockButtonText: {
        color: isDark ? "#FFFFFF" : "#0F172A",
        fontWeight: "600",
      },
      socialButtonsBlockButton: {
        backgroundColor: isDark ? "#131A35" : "#F8FAFC",
        border: isDark ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid #E2E8F0",
        color: isDark ? "#FFFFFF" : "#0F172A",
        transition: "all 0.2s ease",
      },
      dividerText: {
        color: isDark ? "#FFFFFF" : "#0F172A",
        fontWeight: "500",
      },
      dividerLine: {
        backgroundColor: isDark ? "rgba(255, 255, 255, 0.15)" : "#E2E8F0",
      },
      formButtonPrimary: {
        color: "#FFFFFF",
        backgroundColor: "#6366F1",
        "&:hover": {
          backgroundColor: "#4F46E5",
        },
      },
      formFieldInput: {
        backgroundColor: isDark ? "#131A35" : "#F8FAFC",
        color: isDark ? "#FFFFFF" : "#0F172A",
        border: isDark ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid #E2E8F0",
      },
      footerActionText: {
        color: isDark ? "#94A3B8" : "#475569",
      },
      footerActionLink: {
        color: "#22D3EE",
        "&:hover": {
          color: "#6366F1",
        }
      }
    },
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "85vh", padding: "2rem" }}>
      <SignIn appearance={clerkAppearance} path="/sign-in" routing="path" signUpUrl="/sign-up" />
    </div>
  );
}
