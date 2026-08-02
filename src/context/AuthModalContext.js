"use client";

import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useAuth, SignIn, SignUp } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Cpu } from "lucide-react";

const AuthModalContext = createContext();

export function useAuthModal() {
  return useContext(AuthModalContext);
}

export function AuthModalProvider({ children }) {
  const { isSignedIn, isLoaded } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState("signup"); // Default to signup for first-time visitors
  const [currentTheme, setCurrentTheme] = useState("dark");
  const pendingActionRef = useRef(null);

  // Monitor theme changes to dynamically adapt Clerk modal styling
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

  // When user becomes signed in, run any action they had pending
  useEffect(() => {
    if (isLoaded && isSignedIn && pendingActionRef.current) {
      const action = pendingActionRef.current;
      pendingActionRef.current = null;
      setIsOpen(false);
      if (typeof action === "function") {
        action();
      }
    }
  }, [isSignedIn, isLoaded]);

  const requireAuth = (callback) => {
    if (isLoaded && isSignedIn) {
      callback();
    } else {
      pendingActionRef.current = callback;
      setMode("signup"); // Default to signup when opening modal for the first time
      setIsOpen(true);
    }
  };

  const closeAuthModal = () => {
    setIsOpen(false);
    pendingActionRef.current = null;
  };

  const isDark = currentTheme === "dark";

  // Customize Clerk components appearance to match Electric Indigo / Cyan themes
  const clerkAppearance = {
    baseTheme: isDark ? dark : undefined,
    variables: {
      colorPrimary: "#6366F1", // Indigo
      colorBackground: isDark ? "#0A0E1F" : "#FFFFFF",
      colorInputBackground: isDark ? "#131A35" : "#F8FAFC",
      colorInputText: isDark ? "#FFFFFF" : "#0F172A",
      colorText: isDark ? "#FFFFFF" : "#0F172A",
      colorForeground: isDark ? "#FFFFFF" : "#0F172A",
      colorTextSecondary: isDark ? "#22D3EE" : "#4F46E5", // Cyan / Indigo
      colorMutedForeground: isDark ? "#94A3B8" : "#475569",
      colorPrimaryForeground: "#FFFFFF",
    },
    elements: {
      card: {
        backgroundColor: isDark ? "#0A0E1F" : "#FFFFFF",
        border: "none", // Remove border since outer wrapper has it
        boxShadow: "none", // Remove shadow since outer wrapper has it
        borderRadius: "0px",
        padding: "10px 24px",
      },
      logoBox: {
        display: "none", // Hidden, rendered by custom header
      },
      footerAction: {
        display: "none", // Hidden, rendered by custom footer
      }
    },
  };

  return (
    <AuthModalContext.Provider value={{ requireAuth, setIsOpen, setMode, isOpen }}>
      {children}
      {isOpen && (
        <div className="auth-modal-overlay">
          <div className="auth-modal-content">
            <button className="auth-modal-close" onClick={closeAuthModal} aria-label="Close authentication modal">
              &times;
            </button>

            {/* Custom Brand Logo and Header */}
            <div className="auth-modal-logo-header">
              <Cpu size={32} color="#6366F1" style={{ animation: "float-cpu 6s ease-in-out infinite" }} />
              <span>SkillSync <span className="highlight">AI</span></span>
            </div>

            {mode === "signin" ? (
              <div>
                <SignIn
                  routing="hash"
                  appearance={clerkAppearance}
                />
                <div className="auth-modal-footer">
                  New to SkillSync AI?{" "}
                  <button onClick={() => setMode("signup")} className="auth-toggle-link">
                    Sign Up
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <SignUp
                  routing="hash"
                  appearance={clerkAppearance}
                />
                <div className="auth-modal-footer">
                  Already have an account?{" "}
                  <button onClick={() => setMode("signin")} className="auth-toggle-link">
                    Sign In
                  </button>
                </div>
              </div>
            )}
          </div>
          <style jsx global>{`
            .auth-modal-overlay {
              position: fixed;
              top: 0;
              left: 0;
              width: 100vw;
              height: 100vh;
              background: rgba(10, 14, 31, 0.85);
              backdrop-filter: blur(12px);
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 9999;
              animation: fadeIn 0.2s ease-out;
            }
            .auth-modal-content {
              position: relative;
              background: ${isDark ? "#0A0E1F" : "#FFFFFF"};
              padding: 12px;
              border-radius: 18px;
              border: 1px solid ${isDark ? "rgba(99, 102, 241, 0.3)" : "#E2E8F0"};
              box-shadow: 0 10px 40px 0 ${isDark ? "rgba(99, 102, 241, 0.25)" : "rgba(0, 0, 0, 0.1)"};
              animation: scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
              width: 100%;
              max-width: 460px;
            }
            .auth-modal-logo-header {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 0.5rem;
              margin: 1.5rem 0 0.5rem 0;
              font-family: 'Outfit', sans-serif;
              font-size: 1.5rem;
              font-weight: 700;
              color: ${isDark ? "#FFFFFF" : "#0F172A"};
            }
            .auth-modal-logo-header .highlight {
              color: #6366F1;
              background: linear-gradient(to right, #6366F1, #22D3EE);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
            }
            .auth-modal-close {
              position: absolute;
              top: 15px;
              right: 15px;
              background: none;
              border: none;
              color: ${isDark ? "#94A3B8" : "#475569"};
              font-size: 1.8rem;
              cursor: pointer;
              z-index: 10005;
              transition: color 0.2s;
              line-height: 1;
            }
            .auth-modal-close:hover {
              color: #6366F1;
            }
            .auth-modal-footer {
              margin-top: 0.5rem;
              margin-bottom: 1.5rem;
              text-align: center;
              font-size: 0.9rem;
              color: ${isDark ? "#94A3B8" : "#475569"};
              font-family: 'Inter', sans-serif;
            }
            .auth-toggle-link {
              background: none;
              border: none;
              color: #22D3EE;
              font-weight: 600;
              cursor: pointer;
              transition: color 0.2s, text-decoration 0.2s;
              font-family: inherit;
              padding: 0;
              margin-left: 0.25rem;
              text-decoration: underline;
            }
            .auth-toggle-link:hover {
              color: #6366F1;
              text-decoration: none;
            }
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes scaleIn {
              from { transform: scale(0.95); opacity: 0; }
              to { transform: scale(1); opacity: 1; }
            }
            @keyframes float-cpu {
              0%, 100% { transform: translateY(0) rotate(0deg); }
              50% { transform: translateY(-4px) rotate(15deg); }
            }
          `}</style>
        </div>
      )}
    </AuthModalContext.Provider>
  );
}

