"use client";

import { useEffect, useState } from 'react';
import { useAnalysis } from '@/context/AnalysisContext';
import styles from '@/app/page.module.css';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

export default function LearningPage() {
  const { analysis, learningProgress, updateLearningProgress, id } = useAnalysis();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!analysis) return;

    if (!analysis.missingSkills || analysis.missingSkills.length === 0) {
      setLoading(false);
      setData({ skills: [], certifications: [] });
      return;
    }

    const cacheKey = `learning_${id}`;
    const cachedData = sessionStorage.getItem(cacheKey);
    if (cachedData) {
      setData(JSON.parse(cachedData));
      setLoading(false);
      return;
    }

    const fetchLearning = async () => {
      try {
        const response = await fetch('/api/learning', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            missingSkills: analysis.missingSkills
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

    fetchLearning();
  }, [analysis]);

  if (!analysis) return null;

  return (
    <section className={styles.dashboardSection} style={{ marginTop: 0 }}>
      <h2 style={{ marginBottom: '2rem' }}>Learning & Growth</h2>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
        <Link href={`/report/${id}/career-intelligence`} style={{ padding: '0.75rem 2rem', background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', transition: 'all 0.2s ease' }}>
          &larr; Back: Career Intelligence
        </Link>
        <Link href={`/report/${id}/mock-interview`} style={{ padding: '0.75rem 2rem', background: 'var(--primary-color)', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', transition: 'background 0.2s ease' }}>
          Next: Mock Interview &rarr;
        </Link>
      </div>
      
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '30vh', justifyContent: 'center' }}>
          <div className={styles.spinner}></div>
          <p>Generating personalized learning resources...</p>
        </div>
      )}

      {error && (
        <div className={styles.errorMsg}>
          {error}
        </div>
      )}

      {data && !loading && (
        <div className={styles.dashboardGrid} style={{ gridTemplateColumns: '1fr' }}>
          
          {/* Missing Skills Resources */}
          <div className={`${styles.card} glass`} style={{ border: 'none', background: 'transparent', boxShadow: 'none', padding: 0 }}>
            {data.skills?.length === 0 ? (
              <p style={{ color: 'var(--success-color)' }}>You have no missing skills detected for this profile!</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {data.skills?.map((skillData, i) => (
                  <SkillResourceCard key={i} skillData={skillData} learningProgress={learningProgress} updateLearningProgress={updateLearningProgress} />
                ))}
              </div>
            )}
          </div>

        </div>
      )}


    </section>
  );
}

function SkillResourceCard({ skillData, learningProgress, updateLearningProgress }) {
  const [expanded, setExpanded] = useState(false);
  const status = learningProgress[skillData.skillName] || 'planned';

  const bestResource = skillData.resources?.[0];
  const otherResources = skillData.resources?.slice(1) || [];
  const cert = skillData.certification;

  return (
    <div style={{ 
      padding: '1.5rem', 
      background: 'var(--card-bg, rgba(255,255,255,0.02))', 
      borderRadius: '8px', 
      border: '1px solid rgba(255, 255, 255, 0.05)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <h4 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{skillData.skillName}</h4>
          {cert?.name && cert.name !== "null" && (
            <div style={{ fontSize: '0.85rem', color: 'var(--primary-color)' }}>
              🏆 Recommended Cert: <strong>{cert.name}</strong>
            </div>
          )}
        </div>
        <select 
          value={status} 
          onChange={(e) => updateLearningProgress(skillData.skillName, e.target.value)}
          className={styles.statusDropdown}
        >
          <option value="planned">Planned</option>
          <option value="in progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      </div>

      {bestResource && (
        <div style={{ marginTop: '1rem' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Top Recommendation</p>
          <ResourceLink resource={bestResource} />
        </div>
      )}

      {otherResources.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <button 
            onClick={() => setExpanded(!expanded)}
            style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontSize: '0.9rem', padding: 0 }}
          >
            {expanded ? "Hide additional resources" : `See ${otherResources.length} more resources`}
          </button>
          
          {expanded && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
              {otherResources.map((res, j) => (
                <ResourceLink key={j} resource={res} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function getPlatformSearchUrl(platform, topic) {
  const query = encodeURIComponent(topic);
  const p = platform.toLowerCase();
  
  if (p.includes('udemy')) return `https://www.udemy.com/courses/search/?q=${query}`;
  if (p.includes('youtube')) return `https://www.youtube.com/results?search_query=${query}`;
  if (p.includes('coursera')) return `https://www.coursera.org/search?query=${query}`;
  if (p.includes('edx')) return `https://www.edx.org/search?q=${query}`;
  if (p.includes('pluralsight')) return `https://www.pluralsight.com/search?q=${query}`;
  if (p.includes('linkedin')) return `https://www.linkedin.com/learning/search?keywords=${query}`;
  
  // Default to google search specifying the platform
  const googleQuery = encodeURIComponent(`${platform} ${topic}`);
  return `https://www.google.com/search?q=${googleQuery}`;
}

function ResourceLink({ resource }) {
  const searchUrl = getPlatformSearchUrl(resource.platform, resource.topic);
  return (
    <a href={searchUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }} className={styles.resourceLinkWrapper}>
      <div style={{ 
        padding: '1rem', 
        background: 'rgba(var(--primary-rgb), 0.03)', 
        borderRadius: '6px', 
        border: '1px solid rgba(var(--primary-rgb), 0.1)', 
        transition: 'background 0.2s', 
        cursor: 'pointer' 
      }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--primary-color)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
          {resource.type} • {resource.platform}
        </div>
        <div 
          className={styles.resourceTitle}
          style={{ 
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: '500'
          }}
        >
          <span style={{ textDecoration: 'underline', textUnderlineOffset: '4px' }}>{resource.topic}</span>
          <ExternalLink size={14} />
        </div>
      </div>
    </a>
  );
}
