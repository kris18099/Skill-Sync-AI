

async function testCareer() {
    console.log(`\n=== Testing Career API ===`);
    
    const targetRole = "Fresher/Student";
    const skills = ["Python", "JavaScript", "Java"];

    const careerRes = await fetch('http://localhost:3000/api/career', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetRole, skills })
    });
    
    const career = await careerRes.json();
    if (!careerRes.ok) console.error("Career Error:", career);
    else {
        console.log("\nCareer Intelligence:");
        console.log(`Salary Range: ${career.salaryEstimate?.range}`);
        console.log(`Disclaimer: ${career.salaryEstimate?.disclaimer}`);
        console.log(`Adjacent Roles: ${career.similarRoles?.map(r => r.title).join(', ')}`);
    }
}

testCareer();
