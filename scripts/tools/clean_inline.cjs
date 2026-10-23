const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'AdminDashboard.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Strip out ugly inline button styles to let CSS take over
content = content.replace(/style={{ background: selectedAnnouncements\.length > 0 \? '#ef4444' : '#f1f5f9', color: selectedAnnouncements\.length > 0 \? 'white' : '#94a3b8', padding: '0\.5rem 1rem' }}/g, '');
content = content.replace(/style={{ background: localAnnouncements\.length > 0 \? '#ef4444' : '#f1f5f9', color: localAnnouncements\.length > 0 \? 'white' : '#94a3b8', padding: '0\.5rem 1rem' }}/g, '');

// Simplify card styles
content = content.replace(/style={{ maxWidth: '800px', margin: '0 auto 2rem' }}/g, 'className="card-narrow" style={{ maxWidth: "800px", margin: "0 auto 2rem" }}');

// Save it back
fs.writeFileSync(filePath, content, 'utf8');
console.log('AdminDashboard cleaned inline styles');
