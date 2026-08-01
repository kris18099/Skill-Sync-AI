"use client";

import { useState } from "react";
import { Plus, X, ChevronRight, ChevronLeft } from "lucide-react";
import styles from "../builder.module.css";

export default function ResumeForm({ resumeData, setResumeData }) {
  const [step, setStep] = useState(1);
  const totalSteps = 6;

  const handleContactChange = (field, value) => {
    setResumeData({
      ...resumeData,
      contact: { ...resumeData.contact, [field]: value }
    });
  };

  const handleArrayChange = (arrayName, index, field, value) => {
    const newArray = [...resumeData[arrayName]];
    newArray[index] = { ...newArray[index], [field]: value };
    setResumeData({ ...resumeData, [arrayName]: newArray });
  };

  const addArrayItem = (arrayName, defaultItem) => {
    setResumeData({
      ...resumeData,
      [arrayName]: [...resumeData[arrayName], defaultItem]
    });
  };

  const removeArrayItem = (arrayName, index) => {
    const newArray = [...resumeData[arrayName]];
    newArray.splice(index, 1);
    setResumeData({ ...resumeData, [arrayName]: newArray });
  };

  const [newSkill, setNewSkill] = useState("");
  const addSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim() && !resumeData.skills.includes(newSkill.trim())) {
      setResumeData({
        ...resumeData,
        skills: [...resumeData.skills, newSkill.trim()]
      });
      setNewSkill("");
    }
  };
  const removeSkill = (skill) => {
    setResumeData({
      ...resumeData,
      skills: resumeData.skills.filter(s => s !== skill)
    });
  };

  const handleBulletChange = (expIndex, bulletIndex, value) => {
    const newExp = [...resumeData.experience];
    newExp[expIndex].bullets[bulletIndex] = value;
    setResumeData({ ...resumeData, experience: newExp });
  };
  const addBullet = (expIndex) => {
    const newExp = [...resumeData.experience];
    newExp[expIndex].bullets.push("");
    setResumeData({ ...resumeData, experience: newExp });
  };
  const removeBullet = (expIndex, bulletIndex) => {
    const newExp = [...resumeData.experience];
    newExp[expIndex].bullets.splice(bulletIndex, 1);
    setResumeData({ ...resumeData, experience: newExp });
  };

  return (
    <div>
      <div className={styles.formHeader}>
        <h2 style={{ color: "var(--text-primary)" }}>
          {step === 1 && "Contact Information"}
          {step === 2 && "Professional Summary"}
          {step === 3 && "Work Experience"}
          {step === 4 && "Education"}
          {step === 5 && "Skills"}
          {step === 6 && "Projects"}
        </h2>
        <span className={styles.stepIndicator}>Step {step} of {totalSteps}</span>
      </div>

      {step === 1 && (
        <div>
          <div className={styles.grid2}>
            <div className={styles.formGroup}>
              <label>Full Name *</label>
              <input type="text" value={resumeData.contact.name} onChange={e => handleContactChange("name", e.target.value)} placeholder="Jane Doe" />
            </div>
            <div className={styles.formGroup}>
              <label>Email *</label>
              <input type="email" value={resumeData.contact.email} onChange={e => handleContactChange("email", e.target.value)} placeholder="jane@example.com" />
            </div>
            <div className={styles.formGroup}>
              <label>Phone</label>
              <input type="tel" value={resumeData.contact.phone} onChange={e => handleContactChange("phone", e.target.value)} placeholder="(555) 123-4567" />
            </div>
            <div className={styles.formGroup}>
              <label>Location</label>
              <input type="text" value={resumeData.contact.location} onChange={e => handleContactChange("location", e.target.value)} placeholder="New York, NY" />
            </div>
            <div className={styles.formGroup}>
              <label>LinkedIn URL</label>
              <input type="url" value={resumeData.contact.linkedin} onChange={e => handleContactChange("linkedin", e.target.value)} placeholder="linkedin.com/in/janedoe" />
            </div>
            <div className={styles.formGroup}>
              <label>Portfolio / GitHub URL</label>
              <input type="url" value={resumeData.contact.portfolio} onChange={e => handleContactChange("portfolio", e.target.value)} placeholder="github.com/janedoe" />
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <div className={styles.formGroup}>
            <label>Summary</label>
            <textarea 
              value={resumeData.summary} 
              onChange={e => setResumeData({...resumeData, summary: e.target.value})} 
              placeholder="A brief 2-4 sentence overview of your professional background and goals."
            />
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          {resumeData.experience.map((exp, i) => (
            <div key={i} className={styles.entryCard}>
              <button className={styles.removeBtn} onClick={() => removeArrayItem("experience", i)}><X size={18} /></button>
              <div className={styles.grid2}>
                <div className={styles.formGroup}>
                  <label>Job Title</label>
                  <input type="text" value={exp.title} onChange={e => handleArrayChange("experience", i, "title", e.target.value)} placeholder="Software Engineer" />
                </div>
                <div className={styles.formGroup}>
                  <label>Company</label>
                  <input type="text" value={exp.company} onChange={e => handleArrayChange("experience", i, "company", e.target.value)} placeholder="Tech Corp" />
                </div>
                <div className={styles.formGroup}>
                  <label>Location</label>
                  <input type="text" value={exp.location} onChange={e => handleArrayChange("experience", i, "location", e.target.value)} placeholder="San Francisco, CA" />
                </div>
                <div className={styles.grid2}>
                  <div className={styles.formGroup}>
                    <label>Start Date</label>
                    <input type="text" value={exp.startDate} onChange={e => handleArrayChange("experience", i, "startDate", e.target.value)} placeholder="Jan 2020" />
                  </div>
                  <div className={styles.formGroup}>
                    <label>End Date</label>
                    <input type="text" value={exp.endDate} onChange={e => handleArrayChange("experience", i, "endDate", e.target.value)} placeholder="Present" />
                  </div>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Responsibilities & Achievements</label>
                {exp.bullets.map((bullet, bi) => (
                  <div key={bi} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input style={{ flex: 1 }} type="text" value={bullet} onChange={e => handleBulletChange(i, bi, e.target.value)} placeholder="Led development of..." />
                    <button type="button" onClick={() => removeBullet(i, bi)} style={{ background: 'none', border: 'none', color: 'var(--danger-color)', cursor: 'pointer' }}><X size={18} /></button>
                  </div>
                ))}
                <button type="button" onClick={() => addBullet(i)} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>+ Add Bullet</button>
              </div>
            </div>
          ))}
          <button className={styles.addBtn} onClick={() => addArrayItem("experience", { title: "", company: "", location: "", startDate: "", endDate: "", bullets: [""] })}>
            <Plus size={18} /> Add Experience
          </button>
        </div>
      )}

      {step === 4 && (
        <div>
          {resumeData.education.map((edu, i) => (
            <div key={i} className={styles.entryCard}>
              <button className={styles.removeBtn} onClick={() => removeArrayItem("education", i)}><X size={18} /></button>
              <div className={styles.grid2}>
                <div className={styles.formGroup}>
                  <label>Degree / Certificate</label>
                  <input type="text" value={edu.degree} onChange={e => handleArrayChange("education", i, "degree", e.target.value)} placeholder="B.S. Computer Science" />
                </div>
                <div className={styles.formGroup}>
                  <label>Institution</label>
                  <input type="text" value={edu.institution} onChange={e => handleArrayChange("education", i, "institution", e.target.value)} placeholder="University Name" />
                </div>
                <div className={styles.formGroup}>
                  <label>Location</label>
                  <input type="text" value={edu.location} onChange={e => handleArrayChange("education", i, "location", e.target.value)} placeholder="Boston, MA" />
                </div>
                <div className={styles.formGroup}>
                  <label>GPA (Optional)</label>
                  <input type="text" value={edu.gpa} onChange={e => handleArrayChange("education", i, "gpa", e.target.value)} placeholder="3.8/4.0" />
                </div>
                <div className={styles.formGroup}>
                  <label>Start Year</label>
                  <input type="text" value={edu.startYear} onChange={e => handleArrayChange("education", i, "startYear", e.target.value)} placeholder="2018" />
                </div>
                <div className={styles.formGroup}>
                  <label>End Year</label>
                  <input type="text" value={edu.endYear} onChange={e => handleArrayChange("education", i, "endYear", e.target.value)} placeholder="2022" />
                </div>
              </div>
            </div>
          ))}
          <button className={styles.addBtn} onClick={() => addArrayItem("education", { degree: "", institution: "", location: "", startYear: "", endYear: "", gpa: "" })}>
            <Plus size={18} /> Add Education
          </button>
        </div>
      )}

      {step === 5 && (
        <div>
          <div className={styles.formGroup}>
            <label>Skills</label>
            <div className={styles.skillsContainer}>
              {resumeData.skills.map((skill, i) => (
                <div key={i} className={styles.skillBadge}>
                  {skill}
                  <button type="button" onClick={() => removeSkill(skill)} className={styles.skillRemove} style={{ background:'none', border:'none' }}><X size={14} /></button>
                </div>
              ))}
            </div>
            <form onSubmit={addSkill} className={styles.addSkillInput}>
              <input type="text" value={newSkill} onChange={e => setNewSkill(e.target.value)} placeholder="e.g. JavaScript, React, Project Management..." />
              <button type="submit" className={styles.btnSecondary}>Add</button>
            </form>
          </div>
        </div>
      )}

      {step === 6 && (
        <div>
          {resumeData.projects.map((proj, i) => (
            <div key={i} className={styles.entryCard}>
              <button className={styles.removeBtn} onClick={() => removeArrayItem("projects", i)}><X size={18} /></button>
              <div className={styles.grid2}>
                <div className={styles.formGroup}>
                  <label>Project Name</label>
                  <input type="text" value={proj.name} onChange={e => handleArrayChange("projects", i, "name", e.target.value)} placeholder="E-commerce Platform" />
                </div>
                <div className={styles.formGroup}>
                  <label>Link (Optional)</label>
                  <input type="url" value={proj.link} onChange={e => handleArrayChange("projects", i, "link", e.target.value)} placeholder="github.com/project" />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Technologies Used</label>
                <input type="text" value={proj.tech} onChange={e => handleArrayChange("projects", i, "tech", e.target.value)} placeholder="React, Node.js, MongoDB" />
              </div>
              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea value={proj.description} onChange={e => handleArrayChange("projects", i, "description", e.target.value)} placeholder="Describe what you built and your impact..." />
              </div>
            </div>
          ))}
          <button className={styles.addBtn} onClick={() => addArrayItem("projects", { name: "", description: "", tech: "", link: "" })}>
            <Plus size={18} /> Add Project
          </button>
        </div>
      )}

      <div className={styles.navigationButtons}>
        <button 
          className={styles.btnSecondary} 
          onClick={() => setStep(step - 1)} 
          style={{ visibility: step > 1 ? 'visible' : 'hidden' }}
        >
          <ChevronLeft size={18} /> Back
        </button>
        <button 
          className={styles.btnPrimary} 
          onClick={() => setStep(step + 1)} 
          style={{ display: step < totalSteps ? 'flex' : 'none' }}
        >
          Next <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
