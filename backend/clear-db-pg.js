const { Client } = require('pg');
require('dotenv').config();

async function clearDB() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to PostgreSQL...');
    await client.connect();
    console.log('Connected. Clearing tables...');

    await client.query('DELETE FROM product_images');
    await client.query('DELETE FROM products');
    
    console.log('Successfully cleared products and images.');
  } catch (err) {
    console.error('Error clearing DB:', err);
  } finally {
    await client.end();
  }
}

clearDB();
