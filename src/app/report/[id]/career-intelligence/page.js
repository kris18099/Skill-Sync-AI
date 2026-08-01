"use client";

import { useEffect, useState } from 'react';
import { useAnalysis } from '@/context/AnalysisContext';
import styles from '@/app/page.module.css';
import Link from 'next/link';

export default function CareerIntelligencePage() {
  const { analysis, id } = useAnalysis();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!analysis) return;

    // Check if we already cached it in sessionStorage to avoid refetching
    const cacheKey = `career_${id}`;
    const cachedData = sessionStorage.getItem(cacheKey);
    if (cachedData) {
      setData(JSON.parse(cachedData));
      setLoading(false);
      return;
    }

    const fetchCareerIntelligence = async () => {
      try {
        const response = await fetch('/api/career', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            targetRole: analysis.profileClassification,
            skills: analysis.extractedSkills.map(s => s.skill || s)
          })
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        
        setData(result);
        sessionStorage.setItem(cacheKey, JSON.stringify(result));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCareerIntelligence();
  }, [analysis]);

  if (!analysis) return null;

  return (
    <section className={styles.dashboardSection} style={{ marginTop: 0 }}>
      <h2 style={{ marginBottom: '2rem' }}>Career Intelligence</h2>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
        <Link href={`/report/${id}`} style={{ padding: '0.75rem 2rem', background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', transition: 'all 0.2s ease' }}>
          &larr; Back: Overview
        </Link>
        <Link href={`/report/${id}/learning`} style={{ padding: '0.75rem 2rem', background: 'var(--primary-color)', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', transition: 'background 0.2s ease' }}>
          Next: Learning & Growth &rarr;
        </Link>
      </div>
      
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '30vh', justifyContent: 'center' }}>
          <div className={styles.spinner}></div>
          <p>Analyzing labor market trends...</p>
        </div>
      )}

      {error && (
        <div className={styles.errorMsg}>
          {error}
        </div>
      )}

      {data && !loading && (
        <div className={styles.dashboardGrid} style={{ gridTemplateColumns: '1fr 1fr' }}>
          {/* Salary Card */}
          <div className={`${styles.card} glass`}>
            <h3 className={styles.cardTitle}>Estimated Salary</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--success-color)', margin: '1rem 0' }}>
              {data.salaryEstimate?.range}
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {data.salaryEstimate?.disclaimer}
            </p>
          </div>

          {/* Industry Trends */}
          <div className={`${styles.card} glass`}>
            <h3 className={styles.cardTitle}>Industry Trends</h3>
            <ul className={styles.listChecked}>
              {(data.industryTrends || []).map((trend, i) => (
                <li key={i}>{trend}</li>
              ))}
            </ul>
          </div>

          {/* Similar Roles */}
          <div className={`${styles.card} glass ${styles.spanFull}`}>
            <h3 className={styles.cardTitle}>Adjacent Roles You're Qualified For</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              {(data.similarRoles || []).map((role, i) => (
                <div key={i} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ color: 'var(--primary-color)', marginBottom: '0.5rem' }}>{role.title}</h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{role.reason}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Career Path */}
          <div className={`${styles.card} glass ${styles.spanFull}`}>
            <h3 className={styles.cardTitle}>Career Path Timeline</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem', alignItems: 'center' }}>
              {(data.careerPath || []).map((step, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(var(--primary-rgb), 0.05)', border: '1px solid rgba(var(--primary-rgb), 0.2)', borderRadius: '8px' }}>
                    <div style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>{step.stage}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{step.timeline}</div>
                  </div>
                  {i < (data.careerPath?.length || 0) - 1 && (
                    <div style={{ color: 'var(--text-secondary)', fontWeight: 'bold' }}>→</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </section>
  );
}
