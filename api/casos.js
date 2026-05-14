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
      const { rows } = await pool.query(
        "SELECT data FROM casos ORDER BY data->>'criadoEm' DESC NULLS LAST"
      );
      return res.json(rows.map(r => r.data));
    }
    if (req.method === 'POST') {
      const caso = req.body;
      await pool.query(
        'INSERT INTO casos (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = $2',
        [caso.id, caso]
      );
      return res.json(caso);
    }
    res.status(405).end();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
