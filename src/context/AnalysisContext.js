"use client";

import { createContext, useContext, useState, useEffect } from 'react';

const AnalysisContext = createContext();

export function useAnalysis() {
  return useContext(AnalysisContext);
}

export function AnalysisProvider({ children, id }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Custom tracking for learning progress
  const [learningProgress, setLearningProgress] = useState({});

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(`analysis_${id}`);
      if (stored) {
        setAnalysis(JSON.parse(stored));
      } else {
        setError("Analysis not found. Please upload your resume again.");
      }
      
      const storedProgress = sessionStorage.getItem(`progress_${id}`);
      if (storedProgress) {
        setLearningProgress(JSON.parse(storedProgress));
      }
    } catch (err) {
      setError("Failed to load analysis data.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Compute Career Readiness
  const getCareerReadiness = () => {
    if (!analysis) return "Unknown";
    
    const extracted = analysis.extractedSkills?.length || 0;
    const missing = analysis.missingSkills?.length || 0;
    
    // Add points for in-progress or completed learning items
    let progressPoints = 0;
    Object.values(learningProgress).forEach(status => {
      if (status === "in progress") progressPoints += 0.5;
      if (status === "done") progressPoints += 1;
    });

    const effectiveMissing = Math.max(0, missing - progressPoints);
    
    if (extracted === 0) return "Beginner";
    if (effectiveMissing === 0) return "Job-Ready";
    
    const ratio = extracted / (extracted + effectiveMissing);
    
    if (ratio >= 0.8) return "Job-Ready";
    if (ratio >= 0.4) return "Developing";
    return "Beginner";
  };

  const updateLearningProgress = (skillOrCert, status) => {
    const newProgress = { ...learningProgress, [skillOrCert]: status };
    setLearningProgress(newProgress);
    sessionStorage.setItem(`progress_${id}`, JSON.stringify(newProgress));
  };

  const value = {
    id,
    analysis,
    loading,
    error,
    learningProgress,
    updateLearningProgress,
    careerReadiness: getCareerReadiness()
  };

  return (
    <AnalysisContext.Provider value={value}>
      {children}
    </AnalysisContext.Provider>
  );
}
