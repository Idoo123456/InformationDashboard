const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'AdminDashboard.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Fix subtitle opacity / text color issues
content = content.replace(/color: '#8392ab'/g, "color: '#64748b', fontWeight: 500");
content = content.replace(/color: '#67748e'/g, "color: '#475569', fontWeight: 600");

// Fix TV Preview Dark Background
const darkTvRegex = /background: 'linear-gradient\(195deg, #323a54 0%, #1a2035 100%\)', borderRadius: '1rem', padding: '2rem', position: 'relative', overflow: 'hidden', boxShadow: 'inset 0 4px 20px rgba\(0,0,0,0\.5\)', marginTop: '1rem'/;
const lightTvBackground = "background: '#f8fafc', borderRadius: '1rem', padding: '2rem', position: 'relative', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.05)', marginTop: '1rem'";
content = content.replace(darkTvRegex, lightTvBackground);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed announcements TV preview and text colors');
