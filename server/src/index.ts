import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const app = express();
app.use(cors());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/health/db', async (req, res) => {
  try {
    const result = await pool.query('SELECT PostGIS_Version();');
    res.json({ status: 'ok', postgis: result.rows[0] });
  } catch (err) {
    res.status(500).json({ status: 'error', message: (err as Error).message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));