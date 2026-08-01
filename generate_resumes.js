const PDFDocument = require('pdfkit');
const fs = require('fs');

function createResume(filename, content) {
    return new Promise((resolve) => {
        const doc = new PDFDocument();
        doc.pipe(fs.createWriteStream(filename));
        doc.fontSize(12).text(content, 100, 100);
        doc.end();
        doc.on('end', () => {
            resolve();
        });
    });
}

const techResume = `
Name: Alice Hacker
Email: alice@example.com
Phone: 555-0101

Summary:
Recent Computer Science graduate seeking a junior software engineering role. Passionate about backend development and cloud architecture.

Skills:
Languages: Python, JavaScript, Java
Frameworks: React, Node.js, Express
Tools: Git, Docker, AWS (EC2, S3)
Databases: PostgreSQL, MongoDB

Education:
B.S. in Computer Science, University of Technology
Graduated: May 2023

Projects:
- Personal Blog: Built a full-stack blog using React and Node.js.
- Weather App: Created a Python script to fetch and display weather data using public APIs.
`;

const marketingResume = `
Name: Bob Marketer
Email: bob.m@example.com
Phone: 555-0202

Summary:
Experienced Marketing Manager with 6 years of experience in digital campaigns, SEO, and brand management. Proven track record of increasing engagement and ROI.

Skills:
- Digital Marketing Strategy
- SEO & SEM Optimization
- Content Creation & Copywriting
- Google Analytics & Ads
- Social Media Management (Hootsuite, Sprout Social)
- Email Marketing (Mailchimp, HubSpot)

Experience:
Marketing Manager | Creative Agency Inc. | Jan 2019 - Present
- Led a team of 4 to execute quarterly digital campaigns, increasing client ROI by 25%.
- Managed a $100k annual ad budget across Google and Facebook.

Marketing Specialist | Startup X | Jun 2016 - Dec 2018
- Developed email marketing flows with a 35% open rate.

Education:
B.A. in Communications, State University
Graduated: May 2016
`;

async function generate() {
    await createResume('tech_fresher_resume.pdf', techResume);
    await createResume('marketing_experienced_resume.pdf', marketingResume);
    console.log("Resumes generated.");
}

generate();
