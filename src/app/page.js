"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Cpu, Sun, Moon, UploadCloud, Zap, Map } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useAuthModal } from "@/context/AuthModalContext";
import { setStorageItem } from "@/lib/storage";
import styles from "./page.module.css";

function HomeContent() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationError, setValidationError] = useState("");
  const fileInputRef = useRef(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userId } = useAuth();
  const { requireAuth } = useAuthModal();

  useEffect(() => {
    if (searchParams && searchParams.get("showAuth") === "true") {
      const redirect = searchParams.get("redirect") || "/";
      requireAuth(() => {
        router.push(redirect);
      });
    }
  }, [searchParams]);

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      // Validate first so they don't sign in for an invalid file
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(droppedFile.type)) {
        setValidationError("Unsupported file format. Please upload PDF or DOCX.");
        return;
      }
      if (droppedFile.size > 10 * 1024 * 1024) {
        setValidationError("File size exceeds 10MB limit.");
        return;
      }

      requireAuth(() => {
        processFile(droppedFile);
      });
    }
  };

  const processFile = async (selectedFile) => {
    setError("");
    setValidationError("");
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(selectedFile.type)) {
      setValidationError("Unsupported file format. Please upload PDF or DOCX.");
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setValidationError("File size exceeds 10MB limit.");
      return;
    }

    setFile(selectedFile);
    setLoading(true);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 400) {
          throw new Error(`VALIDATION:${data.error || "Invalid file."}`);
        }
        throw new Error(data.error || "Failed to analyze resume.");
      }

      if (!data.isResume) {
        throw new Error("VALIDATION:This document does not appear to be a valid resume.");
      }

      const analysisId = crypto.randomUUID();
      // Scope storage to this specific authenticated user
      setStorageItem(`analysis_${analysisId}`, JSON.stringify(data), userId);
      router.push(`/report/${analysisId}`);

    } catch (err) {
      if (err.message.startsWith("VALIDATION:")) {
        setValidationError(err.message.replace("VALIDATION:", ""));
      } else {
        setError(err.message);
      }
      setFile(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.main}>

      {!loading && (
        <section className={styles.hero}>
          <div className={styles.landingBg}></div>
          <h1 className={styles.title}>Unlock Your Career Potential</h1>
          <p className={styles.subtitle} style={{ marginBottom: '2rem' }}>Upload your resume, get instant feedback, and auto-fix it to be ATS-friendly.</p>

          <div
            className={`${styles.uploadContainer} glass`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => {
              requireAuth(() => {
                fileInputRef.current.click();
              });
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              hidden
              accept=".pdf, .doc, .docx"
              onChange={(e) => {
                if (e.target.files.length) {
                  processFile(e.target.files[0]);
                }
              }}
            />
            <div className={styles.uploadIconWrapper}>
              <UploadCloud size={40} className={styles.logoIcon} />
            </div>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Drag & Drop your resume here</h3>
            <p style={{ color: 'var(--text-secondary)' }}>or click to browse files</p>
            <span className={styles.fileLimits}>Supported: PDF, DOCX (Max 10MB)</span>
          </div>

          {validationError && (
            <div className={styles.validationAlert} style={{ maxWidth: '600px', margin: '-1.5rem auto 1.5rem auto' }}>
              <span>{validationError}</span>
              <button onClick={() => setValidationError("")} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '1.2rem', marginLeft: '1rem' }}>×</button>
            </div>
          )}
          {error && <p className={styles.errorMsg} style={{ maxWidth: '600px', margin: '-1.5rem auto 1.5rem auto' }}>{error}</p>}

          <div style={{ marginTop: '1.5rem', textAlign: 'center', marginBottom: '2rem' }}>
            <Link href="/builder" onClick={(e) => {
              e.preventDefault();
              requireAuth(() => {
                sessionStorage.removeItem('builder_resume_data');
                router.push('/builder');
              });
            }} style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.95rem', transition: 'color 0.2s ease' }} onMouseOver={e => e.target.style.color='var(--primary-color)'} onMouseOut={e => e.target.style.color='var(--text-secondary)'}>
              Don't have a resume yet? <span style={{ color: 'var(--primary-color)', fontWeight: 600 }}>Build one from scratch &rarr;</span>
            </Link>
          </div>

          <div className={styles.featuresRow}>
            <div className={styles.featureItem}>
              <div className={styles.featureIconBox}>
                <Cpu size={24} />
              </div>
              <span>AI-Powered Analysis</span>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIconBox}>
                <Zap size={24} />
              </div>
              <span>Instant Skill Gap Detection</span>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIconBox}>
                <Map size={24} />
              </div>
              <span>Personalized Roadmap</span>
            </div>
          </div>
        </section>
      )}

      {loading && (
        <section className={styles.loadingContainer}>
          <div className={`${styles.spinner}`}></div>
          <h2>Analyzing your resume using Gemini AI...</h2>
          <p className={styles.subtitle}>This might take a few seconds.</p>
        </section>
      )}
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <main className={styles.main}>
        <section className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <h2>Loading...</h2>
        </section>
      </main>
    }>
      <HomeContent />
    </Suspense>
  );
}


