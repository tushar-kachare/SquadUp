import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

pool.query('SELECT PostGIS_Version();', (err, res) => {
  if (err) {
    console.error('Connection failed:', err);
  } else {
    console.log('Connected! PostGIS version:', res.rows[0]);
  }
  pool.end();
});