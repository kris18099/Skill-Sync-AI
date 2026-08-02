"use client";

import { useState } from 'react';
import { useAnalysis } from '@/context/AnalysisContext';
import { useAuth } from '@clerk/nextjs';
import { setStorageItem, removeStorageItem } from '@/lib/storage';
import { Cpu, CheckCircle, XCircle, TrendingUp, Briefcase, Clock } from "lucide-react";
import styles from '@/app/page.module.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function OverviewPage() {
  const { analysis, id } = useAnalysis();
  const router = useRouter();
  const { userId } = useAuth();
  const [isFixing, setIsFixing] = useState(false);

  const handleNewUpload = () => {
    removeStorageItem(`analysis_${id}`, userId);
    removeStorageItem(`progress_${id}`, userId);
    router.push('/');
  };

  const handleAutoFix = async () => {
    if (!analysis.rawText) {
      alert("Raw text not found for this analysis. Please re-upload your resume.");
      return;
    }
    setIsFixing(true);
    try {
      const res = await fetch('/api/autofix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: analysis.rawText })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to auto-fix");
      
      setStorageItem("builder_resume_data", JSON.stringify(data), userId);
      router.push('/builder');
    } catch (err) {
      alert(err.message);
      setIsFixing(false);
    }
  };

  if (!analysis) return null;


  return (
    <section className={styles.dashboardSection}>
      <div className={styles.dashboardHeader}>
        <div>
          <h2>Analysis Report</h2>
          <p className={styles.candidateName}>{analysis.candidateName || "Candidate"}</p>
        </div>
        <button className="glass" onClick={() => window.print()} style={{ padding: '0.75rem 1.5rem', cursor: 'pointer', border: 'none', color: 'var(--text-primary)' }}>
          Download Report
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
        <button onClick={handleNewUpload} style={{ padding: '0.75rem 2rem', background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', transition: 'all 0.2s ease', cursor: 'pointer', fontFamily: 'inherit' }}>
          &larr; Upload New Resume
        </button>
        <Link href={`/report/${id}/career-intelligence`} style={{ padding: '0.75rem 2rem', background: 'var(--primary-color)', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', transition: 'background 0.2s ease' }}>
          Next: Career Intelligence &rarr;
        </Link>
      </div>
      <div className={styles.dashboardGrid}>
        <div className={styles.dashboardSidebar}>
          <div className={`${styles.card} glass ${styles.textCenter}`}>
            <h3 className={styles.cardTitle}>ATS Score</h3>
            <div className={styles.circularChart}>
              <svg viewBox="0 0 36 36" className={styles.circularSvg}>
                <path className={styles.circleBg} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className={styles.circleProgress} 
                      strokeDasharray={`${analysis.atsScore || 0}, 100`} 
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                      stroke={analysis.atsScore > 80 ? 'var(--success-color)' : analysis.atsScore > 50 ? 'var(--primary-color)' : 'var(--danger-color)'}
                />
              </svg>
              <div className={styles.circleText}>{analysis.atsScore || 0}%</div>
            </div>
            <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>{analysis.atsSuggestion}</p>
            <button 
              onClick={handleAutoFix} 
              disabled={isFixing}
              style={{ width: '100%', marginTop: '1.5rem', padding: '0.75rem', background: 'var(--primary-color)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: isFixing ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: isFixing ? 0.7 : 1 }}>
              {isFixing ? "✨ Auto-Fixing..." : "✨ Auto-Fix My Resume"}
            </button>
          </div>

          <div className={`${styles.card} glass`}>
            <h3 className={styles.cardTitle}>Profile Overview</h3>
            <ul className={styles.profileList}>
              <li><Briefcase size={18} color="var(--primary-color)" /> {analysis.profileClassification}</li>
              <li><Clock size={18} color="var(--primary-color)" /> {analysis.experienceLevel}</li>
              <li><Cpu size={18} color="var(--primary-color)" /> {analysis.profileType}</li>
            </ul>
          </div>
        </div>

        <div className={styles.dashboardMain}>
          <div className={`${styles.card} glass ${styles.spanFull}`}>
            <h3 className={styles.cardTitle}>Skill Analysis</h3>
            <div className={styles.skillsGrid}>
              <div className={styles.skillCategory}>
                <h4><CheckCircle size={18} className={styles.textSuccess} /> Extracted Skills</h4>
                <div className={styles.badges}>
                  {(analysis.extractedSkills || []).map((s, i) => <span key={i} className={`${styles.badge} ${styles.badgeSuccess}`} title={s.snippet || ""}>{s.skill || s}</span>)}
                </div>
              </div>
              <div className={styles.skillCategory}>
                <h4><XCircle size={18} className={styles.textDanger} /> Missing Skills</h4>
                <div className={styles.badges}>
                  {(analysis.missingSkills || []).map((s, i) => <span key={i} className={`${styles.badge} ${styles.badgeDanger}`}>{s}</span>)}
                </div>
              </div>
              <div className={styles.skillCategory}>
                <h4><TrendingUp size={18} className={styles.textPrimary} /> Recommended</h4>
                <div className={styles.badges}>
                  {(analysis.recommendedSkills || []).map((s, i) => <span key={i} className={`${styles.badge} ${styles.badgePrimary}`}>{s}</span>)}
                </div>
              </div>
            </div>
          </div>

          <div className={`${styles.card} glass ${styles.spanFull}`}>
            <h3 className={styles.cardTitle}>Learning Roadmap</h3>
            <div className={styles.roadmapTimeline}>
              {(analysis.roadmap || []).map((step, i) => (
                <div key={i} className={styles.timelineItem}>
                  <div style={{ fontWeight: 600 }}>{step.title}</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{step.description}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div className={`${styles.card} glass`}>
              <h3 className={styles.cardTitle}>Strengths</h3>
              <ul className={styles.listChecked}>
                {(analysis.resumeStrengths || []).map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
            <div className={`${styles.card} glass`}>
              <h3 className={styles.cardTitle}>Weaknesses</h3>
              <ul className={styles.listCrossed}>
                {(analysis.resumeWeaknesses || []).map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
