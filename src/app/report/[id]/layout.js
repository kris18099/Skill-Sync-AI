"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { AnalysisProvider, useAnalysis } from '@/context/AnalysisContext';
import styles from './layout.module.css';

function ReportSidebar({ id }) {
  const pathname = usePathname();
  const { careerReadiness, loading, error } = useAnalysis();

  if (loading || error) return null;

  const getBadgeClass = (level) => {
    if (level === "Job-Ready") return styles.ready;
    if (level === "Developing") return styles.developing;
    return "";
  };

  const navItems = [
    { label: "Overview", path: `/report/${id}` },
    { label: "Career Intelligence", path: `/report/${id}/career-intelligence` },
    { label: "Learning & Growth", path: `/report/${id}/learning` },
    { label: "Mock Interview", path: `/report/${id}/mock-interview` },
  ];

  return (
    <aside className={`${styles.sidebar} glass`}>
      <div className={`${styles.readinessBadge} ${getBadgeClass(careerReadiness)}`}>
        Readiness: {careerReadiness}
      </div>
      
      {navItems.map(item => {
        const isActive = pathname === item.path;
        return (
          <Link 
            key={item.path}
            href={item.path}
            className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
          >
            {item.label}
          </Link>
        );
      })}
    </aside>
  );
}

function ReportContent({ children }) {
  const { loading, error } = useAnalysis();

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.spinner}></div>
        <p>Loading your analysis...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.loadingState} style={{ color: 'var(--danger-color)' }}>
        <h2>Error</h2>
        <p>{error}</p>
        <Link href="/" style={{ marginTop: '1rem', color: 'var(--primary-color)' }}>Go back to home</Link>
      </div>
    );
  }

  return children;
}

import { use } from 'react';

export default function ReportLayout({ children, params }) {
  const { id } = use(params);
  return (
    <AnalysisProvider id={id}>
      <div className={styles.layoutContainer}>
        <ReportSidebar id={id} />
        <main className={styles.mainContent}>
          <ReportContent>{children}</ReportContent>
        </main>
      </div>
    </AnalysisProvider>
  );
}
