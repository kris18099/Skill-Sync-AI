"use client";

import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { Download, ChevronDown } from "lucide-react";
import styles from "../builder.module.css";

export default function ResumePreview({ resumeData }) {
  const [template, setTemplate] = useState("classic");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePrint = () => {
    setIsDropdownOpen(false);
    window.print();
  };

  const handleDownloadDocx = () => {
    setIsDropdownOpen(false);
    
    // We clone the paper element to get its HTML
    const element = document.querySelector(`.${styles.resumePaper}`);
    if (!element) return;
    
    const content = element.innerHTML;
    // Word requires a specific XML namespace in HTML for proper parsing
    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Resume</title></head><body>`;
    const footer = "</body></html>";
    const sourceHTML = header + content + footer;
    
    const blob = new Blob(['\ufeff', sourceHTML], {
      type: 'application/msword'
    });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'resume.doc'; // .doc extension correctly triggers Word to parse HTML
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const { contact, summary, experience, education, skills, projects } = resumeData;

  const getContactLink = (url, labelFallback) => {
    if (!url) return null;
    const href = url.startsWith('http') ? url : `https://${url}`;
    let label = labelFallback;
    if (url.toLowerCase().includes('github.com')) label = 'GitHub';
    else if (url.toLowerCase().includes('linkedin.com')) label = 'LinkedIn';
    
    return (
      <a href={href} style={{ color: "inherit", textDecoration: "none" }} target="_blank" rel="noopener noreferrer">
        {label}
      </a>
    );
  };

  const contactItems = [
    contact.email && <a href={`mailto:${contact.email}`} style={{ color: "inherit", textDecoration: "none" }}>{contact.email}</a>,
    contact.phone && <span>{contact.phone}</span>,
    contact.location && <span>{contact.location}</span>,
    contact.linkedin && getContactLink(contact.linkedin, 'LinkedIn'),
    contact.portfolio && getContactLink(contact.portfolio, 'Portfolio')
  ].filter(Boolean);

  const renderClassic = () => (
    <div style={{ fontFamily: "Georgia, serif", lineHeight: 1.5, color: "#000" }}>
      <div style={{ textAlign: "center", marginBottom: "16px", borderBottom: "2px solid #000", paddingBottom: "16px" }}>
        <h1 style={{ fontSize: "24px", margin: "0 0 8px 0", fontWeight: "bold" }}>{contact.name || "YOUR NAME"}</h1>
        <div style={{ fontSize: "14px", display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center" }}>
          {contactItems.map((item, index) => (
            <span key={index} style={{ whiteSpace: "nowrap" }}>
              {item}
              {index < contactItems.length - 1 && <span style={{ margin: "0 8px" }}>|</span>}
            </span>
          ))}
        </div>
      </div>

      {summary && (
        <div style={{ marginBottom: "16px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: "bold", textTransform: "uppercase", marginBottom: "8px" }}>Professional Summary</h2>
          <p style={{ fontSize: "14px", margin: 0 }}>{summary}</p>
        </div>
      )}

      {experience.length > 0 && (
        <div style={{ marginBottom: "16px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: "bold", textTransform: "uppercase", marginBottom: "8px", borderBottom: "1px solid #000" }}>Experience</h2>
          {experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: "14px" }}>
                <span>{exp.title}</span>
                <span>{exp.startDate} {exp.startDate && exp.endDate ? "-" : ""} {exp.endDate}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontStyle: "italic", fontSize: "14px", marginBottom: "4px" }}>
                <span>{exp.company}</span>
                <span>{exp.location}</span>
              </div>
              <ul style={{ margin: "4px 0 0 0", paddingLeft: "20px", fontSize: "14px" }}>
                {exp.bullets.map((bullet, bi) => bullet.trim() && (
                  <li key={bi} style={{ marginBottom: "4px" }}>{bullet}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {education.length > 0 && (
        <div style={{ marginBottom: "16px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: "bold", textTransform: "uppercase", marginBottom: "8px", borderBottom: "1px solid #000" }}>Education</h2>
          {education.map((edu, i) => (
            <div key={i} style={{ marginBottom: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: "14px" }}>
                <span>{edu.institution}</span>
                <span>{edu.startYear} {edu.startYear && edu.endYear ? "-" : ""} {edu.endYear}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                <span style={{ fontStyle: "italic" }}>{edu.degree}</span>
                <span>{edu.location}</span>
              </div>
              {edu.gpa && <div style={{ fontSize: "14px" }}>GPA: {edu.gpa}</div>}
            </div>
          ))}
        </div>
      )}

      {skills.length > 0 && (
        <div style={{ marginBottom: "16px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: "bold", textTransform: "uppercase", marginBottom: "8px", borderBottom: "1px solid #000" }}>Skills</h2>
          <div style={{ fontSize: "14px" }}>{skills.join(", ")}</div>
        </div>
      )}

      {projects.length > 0 && (
        <div style={{ marginBottom: "16px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: "bold", textTransform: "uppercase", marginBottom: "8px", borderBottom: "1px solid #000" }}>Projects</h2>
          {projects.map((proj, i) => (
            <div key={i} style={{ marginBottom: "12px" }}>
              <div style={{ fontWeight: "bold", fontSize: "14px", display: "flex", gap: "8px", alignItems: "baseline" }}>
                <span>{proj.name}</span>
                {proj.link && <a href={proj.link} style={{ fontSize: "12px", fontWeight: "normal", color: "#333", textDecoration: "underline" }}>{proj.link.replace("https://", "")}</a>}
              </div>
              {proj.tech && <div style={{ fontSize: "12px", fontStyle: "italic", marginBottom: "4px" }}>Tech: {proj.tech}</div>}
              <p style={{ fontSize: "14px", margin: 0 }}>{proj.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderModern = () => (
    <div style={{ fontFamily: "Arial, sans-serif", lineHeight: 1.4, color: "#222" }}>
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ fontSize: "28px", margin: "0 0 4px 0", fontWeight: "bold", color: "#111" }}>{contact.name || "YOUR NAME"}</h1>
        <div style={{ fontSize: "12px", color: "#555", display: "flex", flexWrap: "wrap", gap: "12px" }}>
          {contactItems.map((item, index) => (
            <span key={index} style={{ whiteSpace: "nowrap" }}>{item}</span>
          ))}
        </div>
      </div>

      {summary && (
        <div style={{ marginBottom: "20px" }}>
          <h2 style={{ fontSize: "14px", fontWeight: "bold", textTransform: "uppercase", marginBottom: "6px", color: "#000" }}>Summary</h2>
          <p style={{ fontSize: "13px", margin: 0, color: "#333" }}>{summary}</p>
        </div>
      )}

      {experience.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <h2 style={{ fontSize: "14px", fontWeight: "bold", textTransform: "uppercase", marginBottom: "10px", color: "#000" }}>Experience</h2>
          {experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "2px" }}>
                <span style={{ fontWeight: "bold", fontSize: "14px" }}>{exp.title}</span>
                <span style={{ fontSize: "12px", color: "#666" }}>{exp.startDate} {exp.startDate && exp.endDate ? "—" : ""} {exp.endDate}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "6px" }}>
                <span style={{ fontWeight: "600", fontSize: "13px", color: "#444" }}>{exp.company}</span>
                <span style={{ fontSize: "12px", color: "#666" }}>{exp.location}</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "13px", color: "#333" }}>
                {exp.bullets.map((bullet, bi) => bullet.trim() && (
                  <li key={bi} style={{ marginBottom: "3px" }}>{bullet}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {education.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <h2 style={{ fontSize: "14px", fontWeight: "bold", textTransform: "uppercase", marginBottom: "10px", color: "#000" }}>Education</h2>
          {education.map((edu, i) => (
            <div key={i} style={{ marginBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontWeight: "bold", fontSize: "14px" }}>{edu.degree}</div>
                <div style={{ fontSize: "13px", color: "#444", marginTop: "2px" }}>{edu.institution}</div>
                {edu.gpa && <div style={{ fontSize: "12px", color: "#666", marginTop: "2px" }}>GPA: {edu.gpa}</div>}
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "12px", color: "#666" }}>{edu.startYear} {edu.startYear && edu.endYear ? "—" : ""} {edu.endYear}</div>
                <div style={{ fontSize: "12px", color: "#666", marginTop: "2px" }}>{edu.location}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {skills.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <h2 style={{ fontSize: "14px", fontWeight: "bold", textTransform: "uppercase", marginBottom: "8px", color: "#000" }}>Skills</h2>
          <div style={{ fontSize: "13px", color: "#333" }}>
            {skills.map((skill, i) => (
              <span key={i} style={{ display: "inline-block", marginRight: "6px", marginBottom: "4px" }}>{skill}{i < skills.length - 1 ? "," : ""}</span>
            ))}
          </div>
        </div>
      )}

      {projects.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <h2 style={{ fontSize: "14px", fontWeight: "bold", textTransform: "uppercase", marginBottom: "10px", color: "#000" }}>Projects</h2>
          {projects.map((proj, i) => (
            <div key={i} style={{ marginBottom: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "2px" }}>
                <span style={{ fontWeight: "bold", fontSize: "14px" }}>{proj.name}</span>
                {proj.link && <span style={{ fontSize: "12px", color: "#666" }}>{proj.link.replace("https://", "")}</span>}
              </div>
              <p style={{ fontSize: "13px", margin: "2px 0 0 0", color: "#333" }}>{proj.description}</p>
              {proj.tech && <div style={{ fontSize: "12px", color: "#555", marginTop: "4px" }}><strong>Tech:</strong> {proj.tech}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderMinimalist = () => (
    <div style={{ fontFamily: '"Times New Roman", Times, serif', lineHeight: 1.6, color: "#111" }}>
      <div style={{ textAlign: "left", marginBottom: "24px" }}>
        <h1 style={{ fontSize: "26px", margin: "0 0 6px 0", fontWeight: "300", textTransform: "uppercase", letterSpacing: "1px" }}>{contact.name || "YOUR NAME"}</h1>
        <div style={{ fontSize: "13px", color: "#555", display: "flex", flexWrap: "wrap", gap: "16px" }}>
          {contactItems.map((item, index) => (
            <span key={index} style={{ whiteSpace: "nowrap" }}>
              {item}
              {index < contactItems.length - 1 && <span style={{ color: "#aaa" }}>•</span>}
            </span>
          ))}
        </div>
      </div>

      {summary && (
        <div style={{ marginBottom: "20px" }}>
          <h2 style={{ fontSize: "14px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px", borderBottom: "1px solid #ddd", paddingBottom: "3px" }}>Summary</h2>
          <p style={{ fontSize: "13px", margin: 0 }}>{summary}</p>
        </div>
      )}

      {experience.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <h2 style={{ fontSize: "14px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px", borderBottom: "1px solid #ddd", paddingBottom: "3px" }}>Experience</h2>
          {experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: "13px" }}>
                <span>{exp.title}</span>
                <span>{exp.startDate} {exp.startDate && exp.endDate ? "–" : ""} {exp.endDate}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontStyle: "italic", color: "#555", marginBottom: "4px" }}>
                <span>{exp.company}</span>
                <span>{exp.location}</span>
              </div>
              <ul style={{ margin: "4px 0 0 0", paddingLeft: "16px", fontSize: "13px" }}>
                {exp.bullets.map((bullet, bi) => bullet.trim() && (
                  <li key={bi} style={{ marginBottom: "3px" }}>{bullet}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {education.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <h2 style={{ fontSize: "14px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px", borderBottom: "1px solid #ddd", paddingBottom: "3px" }}>Education</h2>
          {education.map((edu, i) => (
            <div key={i} style={{ marginBottom: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: "13px" }}>
                <span>{edu.institution}</span>
                <span>{edu.startYear} {edu.startYear && edu.endYear ? "–" : ""} {edu.endYear}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                <span style={{ fontStyle: "italic", color: "#555" }}>{edu.degree}</span>
                <span>{edu.location}</span>
              </div>
              {edu.gpa && <div style={{ fontSize: "13px", color: "#555" }}>GPA: {edu.gpa}</div>}
            </div>
          ))}
        </div>
      )}

      {skills.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <h2 style={{ fontSize: "14px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px", borderBottom: "1px solid #ddd", paddingBottom: "3px" }}>Skills</h2>
          <div style={{ fontSize: "13px" }}>{skills.join(", ")}</div>
        </div>
      )}

      {projects.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <h2 style={{ fontSize: "14px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px", borderBottom: "1px solid #ddd", paddingBottom: "3px" }}>Projects</h2>
          {projects.map((proj, i) => (
            <div key={i} style={{ marginBottom: "12px" }}>
              <div style={{ fontWeight: "bold", fontSize: "13px", display: "flex", gap: "8px", alignItems: "baseline" }}>
                <span>{proj.name}</span>
                {proj.link && <a href={proj.link} style={{ fontSize: "11px", fontWeight: "normal", color: "#555", textDecoration: "underline" }}>{proj.link.replace("https://", "")}</a>}
              </div>
              {proj.tech && <div style={{ fontSize: "11px", fontStyle: "italic", color: "#555", marginBottom: "2px" }}>Tech: {proj.tech}</div>}
              <p style={{ fontSize: "13px", margin: 0 }}>{proj.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderCompact = () => (
    <div style={{ fontFamily: "Arial, Helvetica, sans-serif", lineHeight: 1.25, color: "#111" }}>
      <div style={{ textAlign: "center", marginBottom: "10px", borderBottom: "1.5px solid #111", paddingBottom: "6px" }}>
        <h1 style={{ fontSize: "20px", margin: "0 0 3px 0", fontWeight: "bold" }}>{contact.name || "YOUR NAME"}</h1>
        <div style={{ fontSize: "11px", display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: "8px" }}>
          {contactItems.map((item, index) => (
            <span key={index} style={{ whiteSpace: "nowrap" }}>
              {item}
              {index < contactItems.length - 1 && <span style={{ margin: "0 4px", color: "#888" }}>|</span>}
            </span>
          ))}
        </div>
      </div>

      {summary && (
        <div style={{ marginBottom: "8px" }}>
          <h2 style={{ fontSize: "12px", fontWeight: "bold", textTransform: "uppercase", marginBottom: "3px" }}>Summary</h2>
          <p style={{ fontSize: "11px", margin: 0 }}>{summary}</p>
        </div>
      )}

      {experience.length > 0 && (
        <div style={{ marginBottom: "8px" }}>
          <h2 style={{ fontSize: "12px", fontWeight: "bold", textTransform: "uppercase", marginBottom: "3px", borderBottom: "1px solid #111" }}>Experience</h2>
          {experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: "6px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: "11px" }}>
                <span>{exp.title}</span>
                <span>{exp.startDate} {exp.startDate && exp.endDate ? "-" : ""} {exp.endDate}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontStyle: "italic", fontSize: "11px" }}>
                <span>{exp.company}</span>
                <span>{exp.location}</span>
              </div>
              <ul style={{ margin: "2px 0 0 0", paddingLeft: "15px", fontSize: "11px" }}>
                {exp.bullets.map((bullet, bi) => bullet.trim() && (
                  <li key={bi} style={{ marginBottom: "1px" }}>{bullet}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {education.length > 0 && (
        <div style={{ marginBottom: "8px" }}>
          <h2 style={{ fontSize: "12px", fontWeight: "bold", textTransform: "uppercase", marginBottom: "3px", borderBottom: "1px solid #111" }}>Education</h2>
          {education.map((edu, i) => (
            <div key={i} style={{ marginBottom: "4px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: "11px" }}>
                <span>{edu.institution}</span>
                <span>{edu.startYear} {edu.startYear && edu.endYear ? "-" : ""} {edu.endYear}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px" }}>
                <span style={{ fontStyle: "italic" }}>{edu.degree}</span>
                <span>{edu.location}</span>
              </div>
              {edu.gpa && <div style={{ fontSize: "11px" }}>GPA: {edu.gpa}</div>}
            </div>
          ))}
        </div>
      )}

      {skills.length > 0 && (
        <div style={{ marginBottom: "8px" }}>
          <h2 style={{ fontSize: "12px", fontWeight: "bold", textTransform: "uppercase", marginBottom: "3px", borderBottom: "1px solid #111" }}>Skills</h2>
          <div style={{ fontSize: "11px" }}>{skills.join(", ")}</div>
        </div>
      )}

      {projects.length > 0 && (
        <div style={{ marginBottom: "8px" }}>
          <h2 style={{ fontSize: "12px", fontWeight: "bold", textTransform: "uppercase", marginBottom: "3px", borderBottom: "1px solid #111" }}>Projects</h2>
          {projects.map((proj, i) => (
            <div key={i} style={{ marginBottom: "6px" }}>
              <div style={{ fontWeight: "bold", fontSize: "11px", display: "flex", gap: "6px", alignItems: "baseline" }}>
                <span>{proj.name}</span>
                {proj.link && <a href={proj.link} style={{ fontSize: "10px", fontWeight: "normal", color: "#555", textDecoration: "underline" }}>{proj.link.replace("https://", "")}</a>}
              </div>
              {proj.tech && <div style={{ fontSize: "10px", fontStyle: "italic", marginBottom: "2px" }}>Tech: {proj.tech}</div>}
              <p style={{ fontSize: "11px", margin: 0 }}>{proj.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderModernPro = () => (
    <div style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', lineHeight: 1.45, color: "#2d3748" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "28px", margin: "0 0 6px 0", fontWeight: "bold", color: "#6366F1" }}>{contact.name || "YOUR NAME"}</h1>
        <div style={{ fontSize: "12px", color: "#4a5568", display: "flex", flexWrap: "wrap", gap: "14px" }}>
          {contactItems.map((item, index) => (
            <span key={index} style={{ whiteSpace: "nowrap" }}>{item}</span>
          ))}
        </div>
      </div>

      {summary && (
        <div style={{ marginBottom: "20px" }}>
          <h2 style={{ fontSize: "13px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.5px", color: "#6366F1", borderLeft: "3px solid #6366F1", paddingLeft: "8px", marginBottom: "8px" }}>Summary</h2>
          <p style={{ fontSize: "13px", margin: 0, color: "#2d3748" }}>{summary}</p>
        </div>
      )}

      {experience.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <h2 style={{ fontSize: "13px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.5px", color: "#6366F1", borderLeft: "3px solid #6366F1", paddingLeft: "8px", marginBottom: "10px" }}>Experience</h2>
          {experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "2px" }}>
                <span style={{ fontWeight: "bold", fontSize: "13px", color: "#1a202c" }}>{exp.title}</span>
                <span style={{ fontSize: "12px", color: "#718096" }}>{exp.startDate} {exp.startDate && exp.endDate ? "—" : ""} {exp.endDate}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "6px" }}>
                <span style={{ fontWeight: "600", fontSize: "13px", color: "#4a5568" }}>{exp.company}</span>
                <span style={{ fontSize: "12px", color: "#718096" }}>{exp.location}</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "13px", color: "#2d3748" }}>
                {exp.bullets.map((bullet, bi) => bullet.trim() && (
                  <li key={bi} style={{ marginBottom: "3px" }}>{bullet}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {education.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <h2 style={{ fontSize: "13px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.5px", color: "#6366F1", borderLeft: "3px solid #6366F1", paddingLeft: "8px", marginBottom: "10px" }}>Education</h2>
          {education.map((edu, i) => (
            <div key={i} style={{ marginBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontWeight: "bold", fontSize: "13px", color: "#1a202c" }}>{edu.degree}</div>
                <div style={{ fontSize: "13px", color: "#4a5568", marginTop: "2px" }}>{edu.institution}</div>
                {edu.gpa && <div style={{ fontSize: "12px", color: "#718096", marginTop: "2px" }}>GPA: {edu.gpa}</div>}
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "12px", color: "#718096" }}>{edu.startYear} {edu.startYear && edu.endYear ? "—" : ""} {edu.endYear}</div>
                <div style={{ fontSize: "12px", color: "#718096", marginTop: "2px" }}>{edu.location}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {skills.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <h2 style={{ fontSize: "13px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.5px", color: "#6366F1", borderLeft: "3px solid #6366F1", paddingLeft: "8px", marginBottom: "8px" }}>Skills</h2>
          <div style={{ fontSize: "13px", color: "#2d3748" }}>
            {skills.map((skill, i) => (
              <span key={i} style={{ display: "inline-block", marginRight: "6px", marginBottom: "4px" }}>{skill}{i < skills.length - 1 ? "," : ""}</span>
            ))}
          </div>
        </div>
      )}

      {projects.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <h2 style={{ fontSize: "13px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.5px", color: "#6366F1", borderLeft: "3px solid #6366F1", paddingLeft: "8px", marginBottom: "10px" }}>Projects</h2>
          {projects.map((proj, i) => (
            <div key={i} style={{ marginBottom: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "2px" }}>
                <span style={{ fontWeight: "bold", fontSize: "13px", color: "#1a202c" }}>{proj.name}</span>
                {proj.link && <span style={{ fontSize: "12px", color: "#718096" }}>{proj.link.replace("https://", "")}</span>}
              </div>
              <p style={{ fontSize: "13px", margin: "2px 0 0 0", color: "#2d3748" }}>{proj.description}</p>
              {proj.tech && <div style={{ fontSize: "12px", color: "#4a5568", marginTop: "4px" }}><strong>Tech:</strong> {proj.tech}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderSkillsFirst = () => (
    <div style={{ fontFamily: "Georgia, serif", lineHeight: 1.5, color: "#000" }}>
      <div style={{ textAlign: "center", marginBottom: "16px", borderBottom: "2px solid #000", paddingBottom: "16px" }}>
        <h1 style={{ fontSize: "24px", margin: "0 0 8px 0", fontWeight: "bold" }}>{contact.name || "YOUR NAME"}</h1>
        <div style={{ fontSize: "14px", display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center" }}>
          {contactItems.map((item, index) => (
            <span key={index} style={{ whiteSpace: "nowrap" }}>
              {item}
              {index < contactItems.length - 1 && <span style={{ margin: "0 8px" }}>|</span>}
            </span>
          ))}
        </div>
      </div>

      {summary && (
        <div style={{ marginBottom: "16px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: "bold", textTransform: "uppercase", marginBottom: "8px" }}>Professional Summary</h2>
          <p style={{ fontSize: "14px", margin: 0 }}>{summary}</p>
        </div>
      )}

      {skills.length > 0 && (
        <div style={{ marginBottom: "16px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: "bold", textTransform: "uppercase", marginBottom: "8px", borderBottom: "1px solid #000" }}>Skills</h2>
          <div style={{ fontSize: "14px" }}>{skills.join(", ")}</div>
        </div>
      )}

      {experience.length > 0 && (
        <div style={{ marginBottom: "16px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: "bold", textTransform: "uppercase", marginBottom: "8px", borderBottom: "1px solid #000" }}>Experience</h2>
          {experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: "14px" }}>
                <span>{exp.title}</span>
                <span>{exp.startDate} {exp.startDate && exp.endDate ? "-" : ""} {exp.endDate}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontStyle: "italic", fontSize: "14px", marginBottom: "4px" }}>
                <span>{exp.company}</span>
                <span>{exp.location}</span>
              </div>
              <ul style={{ margin: "4px 0 0 0", paddingLeft: "20px", fontSize: "14px" }}>
                {exp.bullets.map((bullet, bi) => bullet.trim() && (
                  <li key={bi} style={{ marginBottom: "4px" }}>{bullet}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {projects.length > 0 && (
        <div style={{ marginBottom: "16px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: "bold", textTransform: "uppercase", marginBottom: "8px", borderBottom: "1px solid #000" }}>Projects</h2>
          {projects.map((proj, i) => (
            <div key={i} style={{ marginBottom: "12px" }}>
              <div style={{ fontWeight: "bold", fontSize: "14px", display: "flex", gap: "8px", alignItems: "baseline" }}>
                <span>{proj.name}</span>
                {proj.link && <a href={proj.link} style={{ fontSize: "12px", fontWeight: "normal", color: "#333", textDecoration: "underline" }}>{proj.link.replace("https://", "")}</a>}
              </div>
              {proj.tech && <div style={{ fontSize: "12px", fontStyle: "italic", marginBottom: "4px" }}>Tech: {proj.tech}</div>}
              <p style={{ fontSize: "14px", margin: 0 }}>{proj.description}</p>
            </div>
          ))}
        </div>
      )}

      {education.length > 0 && (
        <div style={{ marginBottom: "16px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: "bold", textTransform: "uppercase", marginBottom: "8px", borderBottom: "1px solid #000" }}>Education</h2>
          {education.map((edu, i) => (
            <div key={i} style={{ marginBottom: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: "14px" }}>
                <span>{edu.institution}</span>
                <span>{edu.startYear} {edu.startYear && edu.endYear ? "-" : ""} {edu.endYear}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                <span style={{ fontStyle: "italic" }}>{edu.degree}</span>
                <span>{edu.location}</span>
              </div>
              {edu.gpa && <div style={{ fontSize: "14px" }}>GPA: {edu.gpa}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className={styles.previewControls}>
        <select 
          className={styles.templateSelect} 
          value={template} 
          onChange={e => setTemplate(e.target.value)}
        >
          <option value="classic">Classic Professional</option>
          <option value="modern">Modern Minimal</option>
          <option value="minimalist">Minimalist Clean</option>
          <option value="compact">Compact Executive</option>
          <option value="modern_pro">Modern Professional Accent</option>
          <option value="skills_first">Skills-First Hybrid</option>
        </select>
        <div className={styles.downloadWrapper} ref={dropdownRef}>
          <button className={styles.btnPrimary} onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
            <Download size={18} /> Download <ChevronDown size={18} />
          </button>
          
          {isDropdownOpen && (
            <div className={styles.dropdownMenu}>
              <button className={styles.dropdownItem} onClick={handlePrint}>Download as PDF</button>
              <button className={styles.dropdownItem} onClick={handleDownloadDocx}>Download as DOCX</button>
            </div>
          )}
        </div>
      </div>

      <div className={styles.resumePaper}>
        {template === "classic" && renderClassic()}
        {template === "modern" && renderModern()}
        {template === "minimalist" && renderMinimalist()}
        {template === "compact" && renderCompact()}
        {template === "modern_pro" && renderModernPro()}
        {template === "skills_first" && renderSkillsFirst()}
      </div>
    </>
  );
}
