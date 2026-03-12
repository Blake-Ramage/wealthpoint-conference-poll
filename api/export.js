const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 5,
});

const EXPORT_TOKEN = process.env.EXPORT_TOKEN || 'wealthpoint2026export';

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Simple token auth
  const token = req.query.token || req.headers['x-export-token'];
  if (token !== EXPORT_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized. Provide ?token=YOUR_TOKEN' });
  }

  try {
    const result = await pool.query(
      `SELECT id, name, email, company, q1_answer, q1_other,
              array_to_string(q2_answers, '; ') AS q2_answers, q2_other,
              q3_answer, created_at
       FROM poll_responses
       ORDER BY created_at ASC`
    );

    // Build CSV
    const headers = ['ID', 'Name', 'Email', 'Company', 'Q1 Answer', 'Q1 Other', 'Q2 Answers', 'Q2 Other', 'Q3 Answer', 'Submitted At'];
    const rows = result.rows.map(r => [
      r.id,
      csvEscape(r.name),
      csvEscape(r.email),
      csvEscape(r.company || ''),
      csvEscape(r.q1_answer || ''),
      csvEscape(r.q1_other || ''),
      csvEscape(r.q2_answers || ''),
      csvEscape(r.q2_other || ''),
      csvEscape(r.q3_answer || ''),
      r.created_at ? new Date(r.created_at).toISOString() : '',
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="wealthpoint-poll-responses.csv"');
    return res.status(200).send(csv);
  } catch (err) {
    console.error('Export error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

function csvEscape(value) {
  if (value == null) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}
