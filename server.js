import 'dotenv/config';
import express from 'express';
import pkg from 'pg';
import cors from 'cors';

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const app = express();
app.use(cors());
app.use(express.json({ limit: '20mb' }));

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS casos (
      id TEXT PRIMARY KEY,
      data JSONB NOT NULL
    );
    CREATE TABLE IF NOT EXISTS tarefas (
      id TEXT PRIMARY KEY,
      data JSONB NOT NULL
    );
  `);
  console.log('Banco inicializado.');
}

/* ── CASOS ── */
app.get('/api/casos', async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT data FROM casos ORDER BY data->>'criadoEm' DESC NULLS LAST"
    );
    res.json(rows.map(r => r.data));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/casos', async (req, res) => {
  try {
    const caso = req.body;
    await pool.query('INSERT INTO casos (id, data) VALUES ($1, $2)', [caso.id, caso]);
    res.json(caso);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/casos/:id', async (req, res) => {
  try {
    await pool.query('UPDATE casos SET data = $1 WHERE id = $2', [req.body, req.params.id]);
    res.json(req.body);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/casos/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM casos WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ── TAREFAS ── */
app.get('/api/tarefas', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT data FROM tarefas');
    res.json(rows.map(r => r.data));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/tarefas', async (req, res) => {
  try {
    const t = req.body;
    await pool.query('INSERT INTO tarefas (id, data) VALUES ($1, $2)', [t.id, t]);
    res.json(t);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/tarefas/:id', async (req, res) => {
  try {
    await pool.query('UPDATE tarefas SET data = $1 WHERE id = $2', [req.body, req.params.id]);
    res.json(req.body);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/tarefas/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM tarefas WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

const PORT = process.env.PORT || 3001;
initDB().then(() => app.listen(PORT, () => console.log(`API rodando em http://localhost:${PORT}`))).catch(console.error);
