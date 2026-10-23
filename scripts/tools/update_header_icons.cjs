const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'AdminDashboard.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Ensure Bell and Cog are imported from lucide-react
if (!content.includes('Bell,')) {
    content = content.replace(/import \{ /, 'import { Bell, Cog, ');
}

// Update the header area with template-like notification icons
const headerSearch = `<div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>`;
const newHeaderRight = `<div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <div style={{ position: 'relative', cursor: 'pointer' }}>
              <Bell size={20} color="#67748e" />
              <span style={{ position: 'absolute', top: '-4px', right: '-4px', width: '8px', height: '8px', background: '#ea0606', borderRadius: '50%', border: '2px solid white' }}></span>
            </div>
            <div style={{ cursor: 'pointer' }}>
              <Cog size={20} color="#67748e" />
            </div>`;

content = content.replace(headerSearch, newHeaderRight);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Header updated with template icons');
