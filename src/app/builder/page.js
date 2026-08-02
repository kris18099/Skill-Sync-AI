"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import ResumeForm from "./components/ResumeForm";
import ResumePreview from "./components/ResumePreview";
import { getStorageItem, setStorageItem } from "@/lib/storage";
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
  const { userId, isLoaded: isAuthLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  // Guard route: redirect if not signed in
  useEffect(() => {
    if (isAuthLoaded && !isSignedIn) {
      router.push("/?showAuth=true&redirect=/builder");
    }
  }, [isAuthLoaded, isSignedIn, router]);

  // Load from user-scoped storage on mount
  useEffect(() => {
    if (!isAuthLoaded) return;
    
    const saved = getStorageItem("builder_resume_data", userId);
    if (saved) {
      try {
        setResumeData(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved resume data");
      }
    }
    setIsLoaded(true);
  }, [isAuthLoaded, userId]);

  // Save to user-scoped storage when data changes
  useEffect(() => {
    if (isLoaded && isAuthLoaded) {
      setStorageItem("builder_resume_data", JSON.stringify(resumeData), userId);
    }
  }, [resumeData, isLoaded, isAuthLoaded, userId]);

  if (!isAuthLoaded || !isSignedIn || !isLoaded) return null;

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

