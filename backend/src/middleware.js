import jwt from 'jsonwebtoken';
export function auth(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  try { if (!token) throw new Error(); req.user = jwt.verify(token, process.env.JWT_SECRET); next(); }
  catch { res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Inicia sesión para continuar.' } }); }
}
export const allow = (...roles) => (req, res, next) => roles.includes(req.user?.role) ? next() : res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Tu rol no permite esta acción.' } });
export function deviceAuth(req, res, next) {
  if (req.headers['x-device-key'] !== process.env.DEVICE_API_KEY) return res.status(401).json({ error: { code: 'DEVICE_UNAUTHORIZED', message: 'Clave de dispositivo inválida.' } });
  next();
}
export function errors(err, req, res, next) { console.error(err); res.status(err.status || 500).json({ error: { code: err.code || 'INTERNAL_ERROR', message: err.status ? err.message : 'Error interno del servidor.' } }); }
