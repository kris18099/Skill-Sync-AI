"use client";

import { SignUp } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useEffect, useState } from "react";

export default function SignUpPage() {
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
      colorForeground: isDark ? "#FFFFFF" : "#0F172A",
      colorTextSecondary: isDark ? "#22D3EE" : "#4F46E5",
      colorMutedForeground: isDark ? "#94A3B8" : "#475569",
      colorPrimaryForeground: "#FFFFFF",
    },
    elements: {
      card: {
        backgroundColor: isDark ? "#0A0E1F" : "#FFFFFF",
        border: isDark ? "1px solid rgba(99, 102, 241, 0.2)" : "1px solid #E2E8F0",
        boxShadow: isDark ? "0 8px 32px 0 rgba(0, 0, 0, 0.5)" : "0 8px 32px 0 rgba(0, 0, 0, 0.05)",
        borderRadius: "16px",
      },
    },
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "85vh", padding: "2rem" }}>
      <SignUp appearance={clerkAppearance} path="/sign-up" routing="path" signInUrl="/sign-in" />
    </div>
  );
}
