const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 5,
});

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-cache');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Total responses
    const totalResult = await pool.query('SELECT COUNT(*) AS count FROM poll_responses');
    const totalResponses = parseInt(totalResult.rows[0].count, 10);

    // Q1 aggregate
    const q1Result = await pool.query(
      `SELECT q1_answer, COUNT(*) AS count
       FROM poll_responses
       WHERE q1_answer IS NOT NULL
       GROUP BY q1_answer
       ORDER BY count DESC`
    );

    const q1 = {};
    q1Result.rows.forEach(row => {
      q1[row.q1_answer] = parseInt(row.count, 10);
    });

    // Q2 aggregate — unnest the array
    const q2Result = await pool.query(
      `SELECT unnest(q2_answers) AS answer, COUNT(*) AS count
       FROM poll_responses
       WHERE q2_answers IS NOT NULL
       GROUP BY answer
       ORDER BY count DESC`
    );

    const q2 = {};
    q2Result.rows.forEach(row => {
      q2[row.answer] = parseInt(row.count, 10);
    });

    // Q3 — return recent free text responses (last 10)
    const q3Result = await pool.query(
      `SELECT q3_answer, created_at
       FROM poll_responses
       WHERE q3_answer IS NOT NULL AND q3_answer != ''
       ORDER BY created_at DESC
       LIMIT 10`
    );

    const q3_responses = q3Result.rows.map(row => ({
      text: row.q3_answer,
      time: row.created_at,
    }));

    return res.status(200).json({
      totalResponses,
      q1,
      q2,
      q3_responses,
    });
  } catch (err) {
    console.error('Results error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
