const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 5,
});

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, company, q1_answer, q1_other, q2_answers, q2_other, q3_answer, q3_other } = req.body;

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    if (!q1_answer) {
      return res.status(400).json({ error: 'Question 1 answer is required' });
    }

    if (!q2_answers || !Array.isArray(q2_answers) || q2_answers.length === 0) {
      return res.status(400).json({ error: 'Question 2 answers are required' });
    }

    if (!q3_answer) {
      return res.status(400).json({ error: 'Question 3 answer is required' });
    }

    // Insert into database
    await pool.query(
      `INSERT INTO poll_responses (name, email, company, q1_answer, q1_other, q2_answers, q2_other, q3_answer, q3_other)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        name.trim(),
        email.trim(),
        (company || '').trim(),
        q1_answer,
        (q1_other || '').trim(),
        q2_answers,
        (q2_other || '').trim(),
        q3_answer,
        (q3_other || '').trim(),
      ]
    );

    // Fetch Q3 aggregate data for display
    const q3Result = await pool.query(
      `SELECT q3_answer, COUNT(*) AS count
       FROM poll_responses
       WHERE q3_answer IS NOT NULL
       GROUP BY q3_answer
       ORDER BY count DESC`
    );

    const q3 = {};
    q3Result.rows.forEach(row => {
      q3[row.q3_answer] = parseInt(row.count, 10);
    });

    return res.status(200).json({
      success: true,
      q3: q3,
    });
  } catch (err) {
    console.error('Submit error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
