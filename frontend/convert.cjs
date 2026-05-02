const fs = require('fs');
let html = fs.readFileSync('src/original-body.html', 'utf8');
html = html.replace(/class=/g, 'className=')
           .replace(/for=/g, 'htmlFor=')
           .replace(/<!--[\s\S]*?-->/g, '')
           .replace(/onclick="[^"]*"/g, '')
           .replace(/onsubmit="[^"]*"/g, '')
           .replace(/style="[^"]*"/g, '')
           .replace(/<input([^>]*?)>/g, '<input$1 />')
           .replace(/<img([^>]*?)>/g, '<img$1 />')
           .replace(/<br([^>]*?)>/g, '<br$1 />');

const jsContent = `import './index.css';

function App() {
  return (
    <>
      ${html}
    </>
  );
}

export default App;
`;

fs.writeFileSync('src/App.tsx', jsContent);
console.log('Converted HTML to JSX in App.tsx');
