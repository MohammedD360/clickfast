const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const REQUIRED_ENV = ['DB_HOST', 'POSTGRES_USER', 'POSTGRES_PASSWORD', 'POSTGRES_DB'];
const missing = REQUIRED_ENV.filter(name => !process.env[name]);
if (missing.length > 0) {
  console.error(`Variable(s) d'environnement manquante(s) : ${missing.join(', ')}. Copier .env.example vers .env et le remplir.`);
  process.exit(1);
}

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  connectionTimeoutMillis: 3000
});

pool.on('error', err => console.error('Connexion Postgres perdue :', err.message));

let schemaReady = null;
function ensureSchema() {
  if (!schemaReady) {
    schemaReady = pool.query(`
      CREATE TABLE IF NOT EXISTS scores (
        id         SERIAL PRIMARY KEY,
        username   VARCHAR(20) NOT NULL,
        score      INTEGER     NOT NULL CHECK (score >= 0),
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )`).catch(err => { schemaReady = null; throw err; });
  }
  return schemaReady;
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '1kb' }));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.post('/scores', async (req, res) => {
  const { username, score } = req.body || {};
  if (typeof username !== 'string' || !username.trim() || username.trim().length > 20) {
    return res.status(400).json({ error: 'username doit faire entre 1 et 20 caractères' });
  }
  if (!Number.isInteger(score) || score < 0 || score > 1000) {
    return res.status(400).json({ error: 'score doit être un entier entre 0 et 1000' });
  }
  try {
    await ensureSchema();
    const { rows } = await pool.query(
      'INSERT INTO scores (username, score) VALUES ($1, $2) RETURNING id, username, score, created_at',
      [username.trim(), score]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('POST /scores :', err.message);
    res.status(503).json({ error: 'Base de données indisponible' });
  }
});

app.get('/scores', async (req, res) => {
  try {
    await ensureSchema();
    const { rows } = await pool.query(
      'SELECT username, score, created_at FROM scores ORDER BY score DESC, created_at ASC LIMIT 10'
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /scores :', err.message);
    res.status(503).json({ error: 'Base de données indisponible' });
  }
});

const port = Number(process.env.API_PORT) || 3000;
app.listen(port, () => console.log(`API scores sur le port ${port}`));
