"use client";

import { useEffect, useState } from 'react';
import { useAnalysis } from '@/context/AnalysisContext';
import { useAuth } from '@clerk/nextjs';
import { getStorageItem, setStorageItem } from '@/lib/storage';
import styles from '@/app/page.module.css';
import Link from 'next/link';

export default function MockInterviewPage() {
  const { analysis, id } = useAnalysis();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState(["", "", "", "", ""]);
  const [feedback, setFeedback] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState("");
  const { userId, isLoaded: isAuthLoaded } = useAuth();

  useEffect(() => {
    if (!analysis || !isAuthLoaded) return;

    const cacheKey = `interview_q_${id}`;
    const cachedData = getStorageItem(cacheKey, userId);
    if (cachedData) {
      setQuestions(JSON.parse(cachedData));
      setLoading(false);
      return;
    }

    const generateQuestions = async () => {
      try {
        const response = await fetch('/api/interview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: "generate",
            targetRole: analysis.profileClassification,
            skills: analysis.extractedSkills.map(s => s.skill || s),
            experienceLevel: analysis.experienceLevel
          })
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        
        setQuestions(result);
        setStorageItem(cacheKey, JSON.stringify(result), userId);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    generateQuestions();
  }, [analysis, isAuthLoaded, userId, id]);


  const handleEvaluate = async () => {
    setEvaluating(true);
    setError("");
    try {
      const response = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: "evaluate",
          questions,
          answers
        })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      
      setFeedback(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setEvaluating(false);
    }
  };

  if (!analysis) return null;

  return (
    <section className={styles.dashboardSection} style={{ marginTop: 0 }}>
      <h2 style={{ marginBottom: '2rem' }}>Mock Interview</h2>
      <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
        <Link href={`/report/${id}/learning`} style={{ padding: '0.75rem 2rem', background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', transition: 'all 0.2s ease' }}>
          &larr; Back: Learning & Growth
        </Link>
      </div>
      
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '30vh', justifyContent: 'center' }}>
          <div className={styles.spinner}></div>
          <p>Generating personalized interview questions...</p>
        </div>
      )}

      {error && (
        <div className={styles.errorMsg} style={{ marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {!loading && questions.length > 0 && (
        <div className={styles.dashboardGrid} style={{ gridTemplateColumns: '1fr' }}>
          
          <div className={`${styles.card} glass`}>
            <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
              Take your time to answer the following {questions.length} questions. When you're ready, click "Get Feedback" to have Gemini evaluate your responses.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {questions.map((q, i) => (
                <div key={i} style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                  <h4 style={{ marginBottom: '1rem', color: 'var(--primary-color)', fontSize: '1.1rem' }}>Q{i+1}: {q}</h4>
                  
                  {!feedback.length ? (
                    <textarea 
                      value={answers[i] || ""}
                      onChange={(e) => {
                        const newAnswers = [...answers];
                        newAnswers[i] = e.target.value;
                        setAnswers(newAnswers);
                      }}
                      placeholder="Type your answer here..."
                      style={{ 
                        width: '100%', minHeight: '100px', padding: '1rem', 
                        borderRadius: '6px', border: '1px solid var(--border-color)', 
                        background: 'var(--bg-color)', color: 'var(--text-primary)',
                        fontFamily: 'inherit', resize: 'vertical'
                      }}
                    />
                  ) : (
                    <div style={{ marginTop: '1rem' }}>
                      <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', marginBottom: '1rem' }}>
                        <strong>Your Answer:</strong><br />
                        <span style={{ color: 'var(--text-secondary)' }}>{answers[i] || "No answer provided."}</span>
                      </div>
                      {feedback[i] && (
                        <div style={{ padding: '1rem', background: 'rgba(var(--primary-rgb), 0.05)', borderLeft: '4px solid var(--primary-color)', borderRadius: '4px' }}>
                          <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                            <span className={`${styles.badge} ${styles.badgePrimary}`}>Clarity: {feedback[i].clarity}</span>
                            <span className={`${styles.badge} ${styles.badgePrimary}`}>Relevance: {feedback[i].relevance}</span>
                          </div>
                          <p style={{ color: 'var(--text-primary)', marginTop: '0.5rem' }}>{feedback[i].feedback}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {!feedback.length && (
              <button 
                onClick={handleEvaluate}
                disabled={evaluating}
                style={{
                  marginTop: '2rem', padding: '1rem 2rem',
                  background: 'var(--primary-color)', color: '#fff',
                  border: 'none', borderRadius: '8px',
                  fontSize: '1.1rem', fontWeight: '600',
                  cursor: evaluating ? 'not-allowed' : 'pointer',
                  opacity: evaluating ? 0.7 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%'
                }}
              >
                {evaluating ? "Evaluating..." : "Get Feedback"}
              </button>
            )}

            {feedback.length > 0 && (
              <button 
                onClick={() => { setFeedback([]); setAnswers(["", "", "", "", ""]); }}
                style={{
                  marginTop: '2rem', padding: '1rem 2rem',
                  background: 'transparent', color: 'var(--primary-color)',
                  border: '1px solid var(--primary-color)', borderRadius: '8px',
                  fontSize: '1.1rem', fontWeight: '600',
                  cursor: 'pointer', display: 'flex', justifyContent: 'center', width: '100%'
                }}
              >
                Retry Interview
              </button>
            )}
          </div>
        </div>
      )}

    </section>
  );
}
