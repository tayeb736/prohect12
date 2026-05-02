const fs = require('fs');
const path = require('path');
const dir = 'src/components';

fs.readdirSync(dir).forEach(file => {
  if (file.endsWith('.tsx')) {
    let p = path.join(dir, file);
    let c = fs.readFileSync(p, 'utf8');
    c = c.replace(/import React from 'react';\n\n/g, '');
    c = c.replace(/import React from 'react';\n/g, '');
    fs.writeFileSync(p, c);
  }
});

let ac = fs.readFileSync('src/context/AppContext.tsx', 'utf8');
ac = ac.replace(/import { createContext, useContext, useState, ReactNode } from 'react';/, "import { createContext, useContext, useState } from 'react';\nimport type { ReactNode } from 'react';");
fs.writeFileSync('src/context/AppContext.tsx', ac);
console.log('Fixed imports');
