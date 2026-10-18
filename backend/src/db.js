import pg from 'pg';
export const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false });
export const query = (sql, args) => pool.query(sql, args);
