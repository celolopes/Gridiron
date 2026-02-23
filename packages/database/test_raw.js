const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres.mpfqpueldajpmphahezr:urNEE3eYnQoNZ45e@104.18.38.10:5432/postgres?sslmode=require',
  ssl: {
    rejectUnauthorized: false,
    servername: 'db.mpfqpueldajpmphahezr.supabase.co'
  }
});

async function main() {
  try {
    await client.connect();
    const res = await client.query('SELECT version()');
    console.log('SUCCESS:', res.rows);
  } catch (error) {
    console.error('ERROR:', error.message);
  } finally {
    await client.end();
  }
}
main();
