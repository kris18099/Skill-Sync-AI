const fs = require('fs');
const PDFDocument = require('pdfkit');


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function createResume(filename, content) {
    return new Promise((resolve) => {
        const doc = new PDFDocument();
        const stream = fs.createWriteStream(filename);
        doc.pipe(stream);
        doc.fontSize(12).text(content, 50, 50);
        doc.end();
        stream.on('finish', resolve);
    });
}

async function testPipeline(filename) {
    console.log(`\n======================================================`);
    console.log(`=== Testing pipeline with: ${filename} ===`);
    console.log(`======================================================\n`);
    
    // 1. Analyze
    const formData = new FormData();
    const fileBuffer = fs.readFileSync(filename);
    const blob = new Blob([fileBuffer], { type: 'application/pdf' });
    formData.append('file', blob, filename);

    const analyzeRes = await fetch('http://localhost:3000/api/analyze', {
        method: 'POST',
        body: formData
    });
    
    const analysis = await analyzeRes.json();
    if (!analyzeRes.ok) {
        console.error("Analysis Failed:", analysis);
        return;
    }
    
    console.log("--- 1. ANALYSIS RESULT ---");
    console.log(`Profile: ${analysis.profileClassification}`);
    console.log(`Experience Level: ${analysis.experienceLevel}`);
    console.log(`Skills: ${analysis.extractedSkills.map(s => s.skill || s).join(', ')}`);

    const skills = analysis.extractedSkills.map(s => s.skill || s);
    const targetRole = analysis.profileClassification;
    const experienceLevel = analysis.experienceLevel;

    await sleep(2000);

    // 2. Career Intelligence
    const careerRes = await fetch('http://localhost:3000/api/career', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetRole, skills })
    });
    const career = await careerRes.json();
    console.log("\n--- 2. CAREER INTELLIGENCE ---");
    if (!careerRes.ok) console.error("Career Error:", career);
    else {
        console.log(`Salary Range: ${career.salaryEstimate?.range}`);
    }

    await sleep(2000);

    // 3. Learning & Growth
    console.log("\n--- 3. LEARNING & GROWTH ---");
    if (analysis.missingSkills && analysis.missingSkills.length > 0) {
        const learningRes = await fetch('http://localhost:3000/api/learning', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ missingSkills: analysis.missingSkills })
        });
        const learning = await learningRes.json();
        if (!learningRes.ok) console.error("Learning Error:", learning);
        else {
            learning.skills?.forEach(s => {
                const certInfo = (s.certification?.name && s.certification.name !== "null") ? `[Cert: ${s.certification.name}]` : '';
                console.log(`Missing: ${s.skillName} ${certInfo} -> ${s.resources?.[0]?.platform} (${s.resources?.[0]?.topic})`);
            });
        }
    } else {
        console.log("No missing skills detected.");
    }

    await sleep(2000);

    // 4. Mock Interview (Generate)
    console.log("\n--- 4. MOCK INTERVIEW ---");
    const interviewRes = await fetch('http://localhost:3000/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: "generate", targetRole, skills, experienceLevel })
    });
    const interview = await interviewRes.json();
    if (!interviewRes.ok) console.error("Interview Error:", interview);
    else {
        interview.forEach((q, i) => console.log(`${i+1}. ${q}`));
    }
}

async function runTests() {
    const filler = "This is a generic professional summary filler text added to ensure the word count exceeds fifty words. I am a dedicated professional with a passion for excellence. I thrive in team environments and consistently deliver high-quality results. I enjoy solving complex problems and continuously learning new skills to improve my performance.";
    
    await createResume('tech_fresher.pdf', `Name: Alice Hacker\nEducation: B.S. Computer Science, Class of 2024\nExperience: None (Recent Graduate)\nSkills: HTML, CSS, JavaScript, React basics, Python, Java.\nProjects: Built a simple to-do app using React. Created a Python script for web scraping.\n${filler}`);
    
    await createResume('tech_experienced.pdf', `Name: Bob Engineer\nExperience: 8 Years as Senior Backend Developer at TechCorp.\nSkills: Java, Spring Boot, Microservices, Kubernetes, Docker, PostgreSQL, AWS Architecture, System Design.\nProjects: Led migration of monolithic backend to microservices running on EKS, improving latency by 40% and reducing infrastructure costs.\n${filler}`);
    
    await createResume('nontech_fresher.pdf', `Name: Charlie Marketer\nEducation: B.A. Communications, Class of 2024\nExperience: None (Student)\nSkills: Copywriting, Social Media Marketing, Content Creation, Microsoft Office, Basic SEO.\nProjects: Wrote articles for the university newspaper. Managed the student union's Instagram account, growing followers by twenty percent.\n${filler}`);
    
    await createResume('nontech_experienced.pdf', `Name: Diana Sales\nExperience: 6 Years as Enterprise Sales Executive.\nSkills: B2B Sales, CRM (Salesforce), Account Management, Negotiation, SaaS, Lead Generation, Pipeline Management.\nAchievements: Consistently exceeded quota by 120% YoY, closed $2M in ARR in 2023. Awarded top salesperson of the year.\n${filler}`);

    await testPipeline('tech_fresher.pdf');
    await testPipeline('tech_experienced.pdf');
    await testPipeline('nontech_fresher.pdf');
    await testPipeline('nontech_experienced.pdf');
}

runTests();
