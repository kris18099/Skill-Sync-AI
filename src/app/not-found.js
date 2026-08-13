"use client";

import Link from "next/link";
import { Cpu, AlertCircle, Home, ArrowLeft } from "lucide-react";
import styles from "./page.module.css";

export default function NotFound() {
  return (
    <main className={styles.main} style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div 
        className="glass" 
        style={{ 
          maxWidth: "600px", 
          width: "100%", 
          padding: "3.5rem 2rem", 
          textAlign: "center",
          borderRadius: "24px",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <div 
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            backgroundColor: "rgba(99, 102, 241, 0.15)",
            border: "1px solid rgba(99, 102, 241, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.5rem auto",
            color: "#6366F1"
          }}
        >
          <AlertCircle size={44} />
        </div>

        <h1 
          style={{ 
            fontSize: "4rem", 
            fontWeight: "800", 
            margin: "0 0 0.5rem 0",
            background: "linear-gradient(to right, #6366F1, #22D3EE)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontFamily: "'Outfit', sans-serif"
          }}
        >
          404
        </h1>

        <h2 
          style={{ 
            fontSize: "1.75rem", 
            fontWeight: "700", 
            color: "var(--text-primary)", 
            marginBottom: "1rem",
            fontFamily: "'Outfit', sans-serif"
          }}
        >
          Page Not Found
        </h2>

        <p 
          style={{ 
            color: "var(--text-secondary)", 
            fontSize: "1.05rem", 
            maxWidth: "440px", 
            margin: "0 auto 2.5rem auto",
            lineHeight: "1.6"
          }}
        >
          The page or route you requested doesn't exist or may have been moved.
        </p>

        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link 
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.8rem 1.75rem",
              borderRadius: "12px",
              backgroundColor: "#6366F1",
              color: "#FFFFFF",
              fontWeight: "600",
              fontSize: "1rem",
              textDecoration: "none",
              transition: "all 0.2s ease",
              boxShadow: "0 4px 20px rgba(99, 102, 241, 0.4)"
            }}
          >
            <Home size={18} />
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
