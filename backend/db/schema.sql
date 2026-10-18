CREATE TABLE IF NOT EXISTS app_users (
 id BIGSERIAL PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE,
 password_hash TEXT NOT NULL, role TEXT NOT NULL CHECK (role IN ('admin','supervisor','operator')),
 active BOOLEAN NOT NULL DEFAULT TRUE, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS intersections (
 id BIGSERIAL PRIMARY KEY, name TEXT NOT NULL, location TEXT NOT NULL DEFAULT '', description TEXT NOT NULL DEFAULT '',
 status TEXT NOT NULL DEFAULT 'normal' CHECK (status IN ('normal','congestion','fault','offline')),
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS sensors (
 id BIGSERIAL PRIMARY KEY, intersection_id BIGINT NOT NULL REFERENCES intersections(id) ON DELETE CASCADE,
 name TEXT NOT NULL, zone TEXT NOT NULL DEFAULT '', kind TEXT NOT NULL DEFAULT 'ultrasonic',
 status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','disconnected','maintenance','error')),
 last_seen TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS measurements (
 id BIGSERIAL PRIMARY KEY, sensor_id BIGINT NOT NULL REFERENCES sensors(id) ON DELETE CASCADE,
 distance_cm NUMERIC(7,2), vehicle_present BOOLEAN NOT NULL, confidence NUMERIC(4,3) NOT NULL DEFAULT 1,
 measured_at TIMESTAMPTZ NOT NULL DEFAULT now(), raw JSONB NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS measurements_sensor_time_idx ON measurements(sensor_id, measured_at DESC);
CREATE TABLE IF NOT EXISTS signal_state (
 intersection_id BIGINT PRIMARY KEY REFERENCES intersections(id) ON DELETE CASCADE,
 active_direction TEXT NOT NULL DEFAULT 'A' CHECK (active_direction IN ('A','B')),
 mode TEXT NOT NULL DEFAULT 'auto' CHECK (mode IN ('auto','manual','safe')),
 reason TEXT NOT NULL DEFAULT 'Inicio del sistema', changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS alerts (
 id BIGSERIAL PRIMARY KEY, intersection_id BIGINT REFERENCES intersections(id) ON DELETE SET NULL,
 sensor_id BIGINT REFERENCES sensors(id) ON DELETE SET NULL, severity TEXT NOT NULL CHECK (severity IN ('low','medium','high','critical')),
 title TEXT NOT NULL, detail TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','acknowledged','attended','closed')),
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS incidents (
 id BIGSERIAL PRIMARY KEY, alert_id BIGINT REFERENCES alerts(id) ON DELETE SET NULL,
 intersection_id BIGINT REFERENCES intersections(id) ON DELETE SET NULL, description TEXT NOT NULL,
 classification TEXT NOT NULL DEFAULT 'review' CHECK (classification IN ('real','false_positive','review')),
 notes TEXT NOT NULL DEFAULT '', created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS audit_log (
 id BIGSERIAL PRIMARY KEY, user_id BIGINT REFERENCES app_users(id) ON DELETE SET NULL,
 action TEXT NOT NULL, entity TEXT NOT NULL, entity_id TEXT, detail JSONB NOT NULL DEFAULT '{}'::jsonb,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
