const https = require('https');

function apiCall(method, path, data, token) {
  return new Promise((resolve, reject) => {
    const body = data ? JSON.stringify(data) : null;
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    if (body) headers['Content-Length'] = Buffer.byteLength(body);
    const req = https.request({
      hostname: 'prohect12.onrender.com',
      path: '/api/v1' + path,
      method,
      headers
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(d) }); }
        catch { resolve({ status: res.statusCode, data: d }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function main() {
  console.log('Logging in as seller...');
  const login = await apiCall('POST', '/auth/login', {
    email: 'seller@medishop.dz',
    password: 'Seller12345'
  });
  const token = login.data.accessToken;
  if (!token) { console.log('Login failed!'); return; }

  console.log('Getting store and categories...');
  const storeRes = await apiCall('GET', '/stores/my-store', null, token);
  const storeId = storeRes.data.id;
  const catsRes = await apiCall('GET', '/categories', null, token);
  const catMap = {};
  catsRes.data.forEach(c => catMap[c.slug] = c.id);

  console.log('Getting ALL existing products for store to delete...');
  // Increased limit to 100 to catch everything
  const prodsRes = await apiCall('GET', `/products?storeId=${storeId}&limit=100`, null, token);
  const existingProds = prodsRes.data.data;
  console.log(`Found ${existingProds.length} products to delete.`);
  
  for (const p of existingProds) {
    console.log(`Deleting ${p.name} (${p.id})...`);
    const delRes = await apiCall('DELETE', `/products/${p.id}`, null, token);
    console.log(`Delete ${p.id}: ${delRes.status}`);
  }

  const products = [
    { name: 'Siemens ACUSON X700 Ultrasound System', description: 'Advanced diagnostic ultrasound with 4D imaging. For cardiology, radiology & obstetrics.', salePrice: 3500000, comparePrice: 4200000, type: 'SALE', stock: 3, brand: 'Siemens', condition: 'NEW', categoryId: catMap['radiology-imaging'], images: ['https://images.unsplash.com/photo-1579154341098-e4e158cc7f55?auto=format&fit=crop&w=600&q=80'] },
    { name: 'Philips IntelliVue MX750 Monitor', description: 'High-acuity patient monitor: ECG, SpO2, NIBP, temperature and invasive pressures.', salePrice: 1850000, comparePrice: 2100000, type: 'SALE', stock: 5, brand: 'Philips', condition: 'NEW', categoryId: catMap['patient-care'], images: ['https://images.unsplash.com/photo-1551190822-a9333d879b1f?auto=format&fit=crop&w=600&q=80'] },
    { name: 'GE Healthcare MAC 5500 ECG Machine', description: '12-lead resting ECG with automated interpretation. Certified for Algerian hospitals.', salePrice: 780000, type: 'SALE', stock: 8, brand: 'GE Healthcare', condition: 'NEW', categoryId: catMap['patient-care'], images: ['https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80'] },
    { name: 'Mindray BS-380 Chemistry Analyzer', description: 'Fully automated biochemistry analyzer. 400 tests/hour. For hospital labs.', salePrice: 2200000, comparePrice: 2500000, type: 'SALE', stock: 2, brand: 'Mindray', condition: 'NEW', categoryId: catMap['laboratory-gear'], images: ['https://images.unsplash.com/photo-1563213126-a4273aed2016?auto=format&fit=crop&w=600&q=80'] },
    { name: 'Drager Evita V800 ICU Ventilator', description: 'Premium ICU ventilator with advanced modes (APRV, BiLevel, NIV). Touchscreen interface.', salePrice: 4800000, type: 'RENT', rentPricePerDay: 15000, stock: 2, brand: 'Drager', condition: 'NEW', categoryId: catMap['patient-care'], images: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80'] },
    { name: 'Stryker 3202 Electric Hospital Bed', description: 'Electric hospital bed with Trendelenburg, side rails and weight scale. CE certified.', salePrice: 320000, type: 'SALE', stock: 15, brand: 'Stryker', condition: 'NEW', categoryId: catMap['hospital-furniture'], images: ['https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=600&q=80'] },
    { name: 'Welch Allyn Spot Vital Signs Monitor', description: 'Portable vital signs: BP, SpO2, temperature & pulse rate with wireless data transfer.', salePrice: 185000, comparePrice: 220000, type: 'SALE', stock: 12, brand: 'Welch Allyn', condition: 'NEW', categoryId: catMap['patient-care'], images: ['https://images.unsplash.com/photo-1559757175-0eb30cd8c063?auto=format&fit=crop&w=600&q=80'] },
    { name: 'Karl Storz HD Laparoscopy System', description: 'Complete HD laparoscopy: camera, light source, insufflator & surgical instruments included.', salePrice: 5200000, type: 'RENT', rentPricePerDay: 25000, stock: 1, brand: 'Karl Storz', condition: 'NEW', categoryId: catMap['surgical-instruments'], images: ['https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?auto=format&fit=crop&w=600&q=80'] },
    { name: 'Osstem Dental Implant Kit', description: 'Complete implant system with drills, implants and prosthetic components. ISO 13485 certified.', salePrice: 450000, type: 'SALE', stock: 20, brand: 'Osstem', condition: 'NEW', categoryId: catMap['dental-equipment'], images: ['https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=600&q=80'] },
    { name: 'Abbott i-STAT Handheld Analyzer', description: 'Point-of-care blood analysis. Results in 2 minutes. For emergency and ICU settings.', salePrice: 680000, type: 'SALE', stock: 6, brand: 'Abbott', condition: 'NEW', categoryId: catMap['laboratory-gear'], images: ['https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?auto=format&fit=crop&w=600&q=80'] },
  ];

  console.log('Adding new products...');
  for (const p of products) {
    const res = await apiCall('POST', '/products', p, token);
    console.log(`${p.name}: ${res.status}`);
  }

  console.log('Done!');
}

main().catch(console.error);
