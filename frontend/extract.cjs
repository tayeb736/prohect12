const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

const components = [
  { name: 'Loader', regex: /<div className="loader-screen"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/ },
  { name: 'ScrollProgress', regex: /<div className="scroll-progress"[\s\S]*?<\/div>/ },
  { name: 'Sidebar', regex: /<aside className="side-nav"[\s\S]*?<\/aside>/ },
  { name: 'Header', regex: /<header className="header"[\s\S]*?<\/header>/ },
  { name: 'Marquee', regex: /<div className="marquee-bar"[\s\S]*?<\/div>\s*<\/div>/ },
  { name: 'Hero', regex: /<section className="hero container"[\s\S]*?<\/section>/ },
  { name: 'TrustBar', regex: /<section className="trust-bar"[\s\S]*?<\/section>/ },
  { name: 'StatsBar', regex: /<section className="stats-bar"[\s\S]*?<\/section>/ },
  { name: 'Categories', regex: /<section className="categories container"[\s\S]*?<\/section>/ },
  { name: 'ProductsSection', regex: /<section className="products-section container"[\s\S]*?<\/section>/ },
  { name: 'RecentlyViewed', regex: /<section className="recently-section"[\s\S]*?<\/section>/ },
  { name: 'Testimonials', regex: /<section className="testimonials-section"[\s\S]*?<\/section>/ },
  { name: 'Brands', regex: /<section className="brands-section"[\s\S]*?<\/section>/ },
  { name: 'Offers', regex: /<section className="offers-section"[\s\S]*?<\/section>/ },
  { name: 'Newsletter', regex: /<section className="newsletter-section"[\s\S]*?<\/section>/ },
  { name: 'Footer', regex: /<footer className="footer"[\s\S]*?<\/footer>/ },
  { name: 'CartPanel', regex: /<div className="cart-overlay"[\s\S]*?<\/aside>/ },
  { name: 'Modal', regex: /<div className="modal-overlay"[\s\S]*?<\/div>\s*<\/div>/ },
  { name: 'CompareBar', regex: /<div className="compare-bar"[\s\S]*?<\/div>/ },
  { name: 'ToastContainer', regex: /<div className="toast-container"[\s\S]*?<\/div>/ },
  { name: 'ScrollTop', regex: /<button className="scroll-top"[\s\S]*?<\/button>/ }
];

let appImports = `import './index.css';\n`;
let appJSX = '';

components.forEach(comp => {
  const match = app.match(comp.regex);
  if (match) {
    const jsx = match[0];
    const componentCode = `import React from 'react';\n\nexport const ${comp.name} = () => {\n  return (\n    <>\n      ${jsx}\n    </>\n  );\n};\n`;
    fs.writeFileSync(`src/components/${comp.name}.tsx`, componentCode);
    appImports += `import { ${comp.name} } from './components/${comp.name}';\n`;
    appJSX += `      <${comp.name} />\n`;
    console.log(`Extracted ${comp.name}`);
  } else {
    console.log(`Failed to extract ${comp.name}`);
  }
});

const newAppCode = `${appImports}\nfunction App() {\n  return (\n    <>\n${appJSX}    </>\n  );\n}\n\nexport default App;\n`;
fs.writeFileSync('src/App.tsx', newAppCode);
console.log('App.tsx updated.');
