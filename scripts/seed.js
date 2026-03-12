/**
 * Seed the poll_responses table with 10 realistic responses.
 * Run: node scripts/seed.js
 */

const { Pool } = require('pg');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const SEED_DATA = [
  {
    name: 'Sarah Mitchell',
    email: 'sarah.m@advicefirst.co.nz',
    company: 'AdviceFirst',
    q1_answer: 'Client Growth',
    q1_other: '',
    q2_answers: ['Business Development Tools', 'Compliance Guidance'],
    q2_other: '',
    q3_answer: 'Business Development Tools',
    q3_other: '',
  },
  {
    name: 'James Thompson',
    email: 'james.t@nzwealth.co.nz',
    company: 'NZ Wealth Partners',
    q1_answer: 'Regulation & Compliance',
    q1_other: '',
    q2_answers: ['Compliance Guidance', 'Training & Development'],
    q2_other: '',
    q3_answer: 'Compliance Guidance',
    q3_other: '',
  },
  {
    name: 'Maria Chen',
    email: 'maria@futureplanners.nz',
    company: 'Future Planners',
    q1_answer: 'Tech & Automation',
    q1_other: '',
    q2_answers: ['Business Development Tools', 'Peer Networks & Mentoring'],
    q2_other: '',
    q3_answer: 'Training & Development',
    q3_other: '',
  },
  {
    name: 'David Wilson',
    email: 'david.w@southernadvisory.co.nz',
    company: 'Southern Advisory Group',
    q1_answer: 'Client Growth',
    q1_other: '',
    q2_answers: ['Business Development Tools', 'Recruitment Support'],
    q2_other: '',
    q3_answer: 'Peer Networks & Mentoring',
    q3_other: '',
  },
  {
    name: 'Emma Richards',
    email: 'emma@clearpath.co.nz',
    company: 'ClearPath Financial',
    q1_answer: 'Regulation & Compliance',
    q1_other: '',
    q2_answers: ['Compliance Guidance', 'Peer Networks & Mentoring'],
    q2_other: '',
    q3_answer: 'Compliance Guidance',
    q3_other: '',
  },
  {
    name: 'Tom Anderson',
    email: 'tom.a@peakadvice.nz',
    company: 'Peak Advice',
    q1_answer: 'Recruitment & Development',
    q1_other: '',
    q2_answers: ['Recruitment Support', 'Training & Development'],
    q2_other: '',
    q3_answer: 'Recruitment Support',
    q3_other: '',
  },
  {
    name: 'Lisa Wang',
    email: 'lisa@harbourwealth.co.nz',
    company: 'Harbour Wealth',
    q1_answer: 'Client Growth',
    q1_other: '',
    q2_answers: ['Business Development Tools', 'Training & Development'],
    q2_other: '',
    q3_answer: 'Business Development Tools',
    q3_other: '',
  },
  {
    name: 'Andrew McPherson',
    email: 'andrew@capitalfp.co.nz',
    company: 'Capital Financial Planning',
    q1_answer: 'Tech & Automation',
    q1_other: '',
    q2_answers: ['Compliance Guidance', 'Business Development Tools'],
    q2_other: '',
    q3_answer: 'Training & Development',
    q3_other: '',
  },
  {
    name: 'Rachel O\'Brien',
    email: 'rachel@northstaradvice.nz',
    company: 'North Star Advice',
    q1_answer: 'Regulation & Compliance',
    q1_other: '',
    q2_answers: ['Peer Networks & Mentoring', 'Compliance Guidance'],
    q2_other: '',
    q3_answer: 'Peer Networks & Mentoring',
    q3_other: '',
  },
  {
    name: 'Mike Stewart',
    email: 'mike@stewartfs.co.nz',
    company: 'Stewart Financial Services',
    q1_answer: 'Other',
    q1_other: 'Work-life balance and wellbeing',
    q2_answers: ['Training & Development', 'Peer Networks & Mentoring'],
    q2_other: '',
    q3_answer: 'Other',
    q3_other: 'Holistic wellbeing advice',
  },
];

async function seed() {
  console.log('Creating table if not exists...');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS poll_responses (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      company TEXT,
      q1_answer TEXT,
      q1_other TEXT,
      q2_answers TEXT[],
      q2_other TEXT,
      q3_answer TEXT,
      q3_other TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  console.log('Table ready.');

  // Check if already seeded
  const existing = await pool.query('SELECT COUNT(*) AS count FROM poll_responses');
  if (parseInt(existing.rows[0].count, 10) > 0) {
    console.log(`Table already has ${existing.rows[0].count} rows. Skipping seed.`);
    console.log('To re-seed, run: DELETE FROM poll_responses; then run this script again.');
    await pool.end();
    return;
  }

  console.log('Seeding 10 responses...');

  for (let i = 0; i < SEED_DATA.length; i++) {
    const d = SEED_DATA[i];
    // Stagger created_at times across the past 2 hours
    const minutesAgo = (SEED_DATA.length - i) * 12;
    const createdAt = new Date(Date.now() - minutesAgo * 60 * 1000);

    await pool.query(
      `INSERT INTO poll_responses (name, email, company, q1_answer, q1_other, q2_answers, q2_other, q3_answer, q3_other, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [d.name, d.email, d.company, d.q1_answer, d.q1_other, d.q2_answers, d.q2_other, d.q3_answer, d.q3_other, createdAt]
    );
    console.log(`  ✓ ${d.name} (${d.company})`);
  }

  console.log('\nDone! 10 seed responses inserted.');
  await pool.end();
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
