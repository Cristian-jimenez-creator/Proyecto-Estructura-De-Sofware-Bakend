import 'dotenv/config';
import pg from 'pg';
import { readFile } from 'node:fs/promises';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false });
try { await pool.query(await readFile(new URL('../db/schema.sql', import.meta.url), 'utf8')); console.log('Esquema de base de datos listo.'); }
finally { await pool.end(); }
