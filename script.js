const generateBtn = document.getElementById('generate-btn');

generateBtn.addEventListener('click', async function () {

  const clientName = document.getElementById('client-name').value;
  const projectType = document.getElementById('project-type').value;
  const roomSize = document.getElementById('room-size').value;
  const budget = document.getElementById('budget').value;
  const goals = document.getElementById('goals').value;

  if (!clientName || !projectType || !roomSize || !budget || !goals) {
    alert('Please fill out all fields before generating a proposal.');
    return;
  }

  generateBtn.textContent = 'Generating...';
  generateBtn.disabled = true;

  const prompt = `You are a professional AVL (Audio, Video, Lighting) systems integrator writing a formal project proposal.

Generate a complete, professional proposal for the following project:

- Client Name: ${clientName}
- Project Type: ${projectType}
- Room Size: ${roomSize}
- Budget Range: ${budget}
- Client Goals & Notes: ${goals}

The proposal should include:
1. A brief executive summary
2. Scope of work
3. Recommended system overview (audio, video, and/or lighting as relevant)
4. Project phases (Design, Procurement, Installation, Testing, Training)
5. A professional closing statement

Write in a professional but approachable tone. Be specific and relevant to the AVL industry.`;

  try {
    const response = await fetch('http://localhost:3000/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt })
    });

    const data = await response.json();
    console.log('API Response:', JSON.stringify(data));
    const proposalText = data.content[0].text;
    displayProposal(proposalText);

  } catch (error) {
    alert('Something went wrong. Please try again.');
    console.error(error);
  }

  generateBtn.textContent = 'Generate Proposal';
  generateBtn.disabled = false;

});

function convertMarkdown(text) {
  return text
    .split('\n')
    .map(line => {
      line = line.trim();
      if (!line) return '<br>';
      if (line.startsWith('# ')) return `<h2 class="proposal-main-title">${line.slice(2)}</h2>`;
      if (line.startsWith('## ')) return `<h3 class="proposal-section">${line.slice(3)}</h3>`;
      if (line.startsWith('### ')) return `<h4 class="proposal-subsection">${line.slice(4)}</h4>`;
      if (line === '---') return '<hr class="proposal-divider">';
      if (line.startsWith('- ')) {
        return `<li>${line.slice(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</li>`;
      }
      line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return `<p>${line}</p>`;
    })
    .join('')
    .replace(/(<li>.*?<\/li>)+/gs, match => `<ul>${match}</ul>`);
}

function displayProposal(text) {

  const existing = document.getElementById('proposal-output');
  if (existing) existing.remove();

  const clientName = document.getElementById('client-name').value;
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  const outputDiv = document.createElement('div');
  outputDiv.id = 'proposal-output';
  outputDiv.innerHTML = `
    <div class="proposal-header">
      <h2>Project Proposal</h2>
      <div class="proposal-meta">
        <span>Prepared for: <strong>${clientName}</strong></span>
        <span>Date: <strong>${today}</strong></span>
      </div>
    </div>
    <div class="proposal-body">${convertMarkdown(text)}</div>
    <div class="proposal-actions">
      <button onclick="window.print()" id="print-btn">Print / Save as PDF</button>
    </div>
  `;

  document.querySelector('.container').appendChild(outputDiv);
  outputDiv.scrollIntoView({ behavior: 'smooth' });
}