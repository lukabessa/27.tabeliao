import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export const config = { api: { bodyParser: { sizeLimit: '20mb' } } };

export default async function handler(req, res) {
  const { id } = req.query;
  try {
    if (req.method === 'PUT') {
      await pool.query('UPDATE casos SET data = $1 WHERE id = $2', [req.body, id]);
      return res.json(req.body);
    }
    if (req.method === 'DELETE') {
      await pool.query('DELETE FROM casos WHERE id = $1', [id]);
      return res.json({ ok: true });
    }
    res.status(405).end();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
