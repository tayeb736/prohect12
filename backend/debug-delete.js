const https = require('https');

async function debugDelete() {
  const loginRes = await fetch('https://prohect12.onrender.com/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'seller@medishop.dz', password: 'Seller12345' })
  }).then(r => r.json());
  const token = loginRes.accessToken;

  const res = await fetch('https://prohect12.onrender.com/api/v1/products/cmop2qktw000ri52b5wanm4vi', {
    method: 'DELETE',
    headers: { 'Authorization': 'Bearer ' + token }
  });
  console.log('Status:', res.status);
  const data = await res.json();
  console.log('Data:', data);
}
debugDelete();
