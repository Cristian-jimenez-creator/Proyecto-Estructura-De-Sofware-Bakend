import 'dotenv/config'; import bcrypt from 'bcryptjs'; import { query,pool } from '../src/db.js';
try {
 const email=process.env.ADMIN_EMAIL||'admin@semaforos.local',password=process.env.ADMIN_PASSWORD||'ChangeMe-123!';
 if(process.env.NODE_ENV==='production'&&(!process.env.ADMIN_PASSWORD||password.length<12))throw new Error('En producción configura ADMIN_PASSWORD (mínimo 12 caracteres).');
 await query(`INSERT INTO app_users(name,email,password_hash,role) VALUES('Administrador', $1,$2,'admin') ON CONFLICT(email) DO NOTHING`,[email,await bcrypt.hash(password,12)]);
 const {rows}=await query(`INSERT INTO intersections(name,location,description) SELECT 'Cruce de demostración','Maqueta escolar','Intersección de dos vías para pruebas controladas' WHERE NOT EXISTS(SELECT 1 FROM intersections)`);
 const ix=rows[0]?.id ?? (await query('SELECT id FROM intersections ORDER BY id LIMIT 1')).rows[0]?.id;
 if(ix){await query('INSERT INTO signal_state(intersection_id) VALUES($1) ON CONFLICT DO NOTHING',[ix]);await query(`INSERT INTO sensors(intersection_id,name,zone) SELECT $1,'Sensor HC-SR04 A','Vía A' WHERE NOT EXISTS(SELECT 1 FROM sensors WHERE intersection_id=$1)`,[ix]);await query(`INSERT INTO sensors(intersection_id,name,zone) SELECT $1,'Sensor HC-SR04 B','Vía B' WHERE (SELECT count(*) FROM sensors WHERE intersection_id=$1)<2`,[ix]);}
 console.log(`Datos de demostración listos. Usuario: ${email}`);
} finally { await pool.end(); }
