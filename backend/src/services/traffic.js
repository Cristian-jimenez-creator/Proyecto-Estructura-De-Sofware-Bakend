import { query } from '../db.js';
// Solo recomienda un turno para la maqueta. En operación real, los planes deben ser aprobados y el controlador local conserva el modo seguro.
export async function evaluate(intersectionId) {
  const { rows } = await query(`SELECT s.zone, m.vehicle_present, m.measured_at FROM sensors s
    LEFT JOIN LATERAL (SELECT vehicle_present, measured_at FROM measurements WHERE sensor_id=s.id ORDER BY measured_at DESC LIMIT 1) m ON true
    WHERE s.intersection_id=$1 AND s.status='active'`, [intersectionId]);
  const fresh = rows.filter(x => x.measured_at && Date.now() - new Date(x.measured_at).getTime() < 30000);
  const a = fresh.filter(x => /^a\b|v[ií]a\s*a/i.test(x.zone)).some(x => x.vehicle_present);
  const b = fresh.filter(x => /^b\b|v[ií]a\s*b/i.test(x.zone)).some(x => x.vehicle_present);
  let reason = 'Sin vehículos recientes; se conserva el turno actual.';
  if (!fresh.length) reason = 'Mediciones desactualizadas; se conserva el modo seguro.';
  else if (a !== b) reason = `Demanda detectada en vía ${a ? 'A' : 'B'}.`;
  else if (a && b) reason = 'Demanda en ambas vías; se conserva el turno actual.';
  const current = await query('SELECT active_direction, mode FROM signal_state WHERE intersection_id=$1', [intersectionId]);
  const state = current.rows[0] || { active_direction: 'A', mode: 'auto' };
  const direction = fresh.length && a !== b && state.mode !== 'manual' ? (a ? 'A' : 'B') : state.active_direction;
  await query(`INSERT INTO signal_state(intersection_id,active_direction,mode,reason,changed_at) VALUES($1,$2,$3,$4,now())
    ON CONFLICT(intersection_id) DO UPDATE SET active_direction=EXCLUDED.active_direction, mode=EXCLUDED.mode, reason=EXCLUDED.reason, changed_at=now()`,
  [intersectionId, direction, fresh.length ? state.mode : 'safe', reason]);
  return { direction, mode: fresh.length ? state.mode : 'safe', reason, demand: { A: a, B: b } };
}
