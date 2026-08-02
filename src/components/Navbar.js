"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Cpu, Sun, Moon, FileText } from "lucide-react";
import { useAuth, UserButton } from "@clerk/nextjs";
import { useAuthModal } from "@/context/AuthModalContext";
import styles from "@/app/page.module.css";

export default function Navbar() {
  const [theme, setTheme] = useState("dark");
  const { isSignedIn } = useAuth();
  const { requireAuth } = useAuthModal();
  const router = useRouter();

  useEffect(() => {
    // Read current theme from html tag if it exists
    const currentTheme = document.documentElement.getAttribute("data-theme") || "dark";
    setTheme(currentTheme);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleBuildResumeClick = (e) => {
    e.preventDefault();
    requireAuth(() => {
      sessionStorage.removeItem('builder_resume_data');
      router.push('/builder');
    });
  };

  return (
    <nav className={`${styles.navbar} glass`} style={{ position: 'sticky', top: 0, zIndex: 100 }}>
      <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className={styles.logo}>
          <Cpu className={styles.logoIcon} />
          <span>SkillSync <span className={styles.highlight}>AI</span></span>
        </div>
      </Link>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <a 
          href="/builder" 
          onClick={handleBuildResumeClick}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            border: '1px solid #6366F1',
            color: '#6366F1',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '0.9rem',
            transition: 'all 0.2s ease',
            backgroundColor: 'transparent'
          }}
          className="build-resume-btn"
        >
          <FileText size={16} />
          <span className="build-resume-text">Build a Resume</span>
        </a>

        {isSignedIn && (
          <UserButton 
            appearance={{
              elements: {
                avatarBox: {
                  width: '32px',
                  height: '32px',
                  border: '2px solid #6366F1',
                }
              }
            }}
          />
        )}

        <button onClick={toggleTheme} className={styles.iconBtn} title="Toggle Theme">
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
      
      <style jsx>{`
        .build-resume-btn:hover {
          background-color: rgba(99, 102, 241, 0.1) !important;
        }
        @media (max-width: 600px) {
          .build-resume-text {
            display: none;
          }
          .build-resume-btn {
            padding: 0.5rem !important;
          }
        }
      `}</style>
    </nav>
  );
}

