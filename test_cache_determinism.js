const fs = require('fs');
const PDFDocument = require('pdfkit');

async function createResume(filename, content) {
    return new Promise((resolve) => {
        const doc = new PDFDocument();
        const stream = fs.createWriteStream(filename);
        doc.pipe(stream);
        doc.fontSize(12).text(content, 100, 100);
        doc.end();
        stream.on('finish', () => {
            resolve();
        });
    });
}

const baseResume = `
Name: Test User
Email: test@example.com

Summary:
Recent graduate looking for entry-level work as a software engineer. I have a strong foundation in modern web technologies and a passion for building scalable, high-performance applications. During my time at university, I collaborated with diverse teams to develop several impactful projects. I am eager to apply my skills in a professional environment and continue learning from experienced peers.

Skills:
- JavaScript (ES6+), TypeScript, Node.js
- Python, Django, Flask
- React, Next.js, Vue.js, Tailwind CSS

Experience:
Software Engineering Intern | Tech Corp | May 2022 - Aug 2022
- Assisted in the development of a microservices architecture using Node.js and Docker.
`;

const modifiedResume = baseResume + `\nEducation:\nB.S. in Computer Science\nUniversity of Technology\nGraduated: May 2023\n`;

async function uploadAndAnalyze(filename) {
    const formData = new FormData();
    const fileBuffer = fs.readFileSync(filename);
    const blob = new Blob([fileBuffer], { type: 'application/pdf' });
    formData.append('file', blob, filename);

    const response = await fetch('http://localhost:3000/api/analyze', {
        method: 'POST',
        body: formData
    });
    
    if (!response.ok) {
        const err = await response.text();
        throw new Error(`API Error: ${response.status} ${err}`);
    }
    return await response.json();
}

async function runTest() {
    console.log("Generating test resumes...");
    await createResume('base_resume.pdf', baseResume);
    await createResume('modified_resume.pdf', modifiedResume);

    console.log("\n--- TEST 1: Identical Resume (3 times) ---");
    let prevScore = null;
    let prevSkills = null;
    for (let i = 1; i <= 3; i++) {
        console.log(`Upload ${i}...`);
        const start = Date.now();
        const data = await uploadAndAnalyze('base_resume.pdf');
        const duration = Date.now() - start;
        console.log(`  ATS Score: ${data.atsScore}`);
        console.log(`  Skills: ${data.extractedSkills.map(s => s.skill).join(', ')}`);
        console.log(`  Time taken: ${duration}ms`);
        
        if (prevScore !== null) {
            if (data.atsScore !== prevScore || JSON.stringify(data.extractedSkills) !== prevSkills) {
                console.error("  FAILED: Output was not identical!");
            } else {
                console.log("  PASSED: Output identical to previous run (Cache Hit expected).");
            }
        }
        prevScore = data.atsScore;
        prevSkills = JSON.stringify(data.extractedSkills);
    }

    console.log("\n--- TEST 2: Modified Resume ---");
    console.log("Uploading modified resume (added a project with quantified achievements)...");
    const start = Date.now();
    const modifiedData = await uploadAndAnalyze('modified_resume.pdf');
    const duration = Date.now() - start;
    
    console.log(`  ATS Score: ${modifiedData.atsScore}`);
    console.log(`  Skills: ${modifiedData.extractedSkills.map(s => s.skill).join(', ')}`);
    console.log(`  Time taken: ${duration}ms`);
    
    if (modifiedData.atsScore !== prevScore) {
        console.log(`  PASSED: Score changed from ${prevScore} to ${modifiedData.atsScore}.`);
    } else {
        console.warn(`  WARNING: Score did not change (Still ${modifiedData.atsScore}).`);
    }
    
    console.log("\nTest completed.");
}

runTest().catch(console.error);
