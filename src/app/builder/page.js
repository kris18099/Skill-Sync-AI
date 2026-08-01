"use client";

import { useState, useEffect } from "react";
import ResumeForm from "./components/ResumeForm";
import ResumePreview from "./components/ResumePreview";
import styles from "./builder.module.css";

const defaultData = {
  contact: { name: "", email: "", phone: "", location: "", linkedin: "", portfolio: "" },
  summary: "",
  experience: [],
  education: [],
  skills: [],
  projects: []
};

export default function ResumeBuilderPage() {
  const [resumeData, setResumeData] = useState(defaultData);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from session storage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem("builder_resume_data");
    if (saved) {
      try {
        setResumeData(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved resume data");
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to session storage when data changes
  useEffect(() => {
    if (isLoaded) {
      sessionStorage.setItem("builder_resume_data", JSON.stringify(resumeData));
    }
  }, [resumeData, isLoaded]);

  if (!isLoaded) return null;

  return (
    <div className={styles.builderContainer}>
      <div className={styles.formPanel}>
        <ResumeForm resumeData={resumeData} setResumeData={setResumeData} />
      </div>
      <div className={styles.previewPanel}>
        <ResumePreview resumeData={resumeData} />
      </div>
    </div>
  );
}
