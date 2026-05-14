import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export const config = { api: { bodyParser: { sizeLimit: '20mb' } } };

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { rows } = await pool.query('SELECT data FROM tarefas');
      return res.json(rows.map(r => r.data));
    }
    if (req.method === 'POST') {
      const t = req.body;
      await pool.query(
        'INSERT INTO tarefas (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = $2',
        [t.id, t]
      );
      return res.json(t);
    }
    res.status(405).end();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
