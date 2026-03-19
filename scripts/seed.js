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
    role_type: 'financial_adviser',
    adviser_specialisation: 'Investments',
    gender: 'Female',
    age: '42',
    q1_answer: 'Client Growth',
    q1_other: '',
    q2_answers: ['Business Development Tools', 'Compliance Guidance'],
    q2_other: '',
    q3_answer: 'Cost of living pressures are driving clients to seek advice on budgeting and debt management',
  },
  {
    name: 'James Thompson',
    email: 'james.t@nzwealth.co.nz',
    company: 'NZ Wealth Partners',
    role_type: 'financial_adviser',
    adviser_specialisation: 'Life and Health Insurance',
    gender: 'Male',
    age: '55',
    q1_answer: 'Regulation & Compliance',
    q1_other: '',
    q2_answers: ['Compliance Guidance', 'Training & Development'],
    q2_other: '',
    q3_answer: 'Regulatory reform and the new conduct licensing regime will reshape how we engage clients',
  },
  {
    name: 'Maria Chen',
    email: 'maria@futureplanners.nz',
    company: 'Future Planners',
    role_type: 'financial_adviser',
    adviser_specialisation: 'KiwiSaver',
    gender: 'Female',
    age: '36',
    q1_answer: 'Tech & Automation',
    q1_other: '',
    q2_answers: ['Business Development Tools', 'Peer Networks & Mentoring'],
    q2_other: '',
    q3_answer: 'Younger clients expect digital-first engagement — mobile apps, online portals, instant access',
  },
  {
    name: 'David Wilson',
    email: 'david.w@southernadvisory.co.nz',
    company: 'Southern Advisory Group',
    role_type: 'financial_adviser',
    adviser_specialisation: 'General Insurance',
    gender: 'Male',
    age: '48',
    q1_answer: 'Client Growth',
    q1_other: '',
    q2_answers: ['Business Development Tools', 'Recruitment Support'],
    q2_other: '',
    q3_answer: 'Fee sensitivity and transparency expectations are changing how clients choose advisers',
  },
  {
    name: 'Emma Richards',
    email: 'emma@clearpath.co.nz',
    company: 'ClearPath Financial',
    role_type: 'financial_adviser',
    adviser_specialisation: 'Mortgages',
    gender: 'Female',
    age: '39',
    q1_answer: 'Regulation & Compliance',
    q1_other: '',
    q2_answers: ['Compliance Guidance', 'Peer Networks & Mentoring'],
    q2_other: '',
    q3_answer: 'Retirement planning shifts as boomers exit workforce and need drawdown strategies',
  },
  {
    name: 'Tom Anderson',
    email: 'tom.a@peakadvice.nz',
    company: 'Peak Advice',
    role_type: 'financial_adviser',
    adviser_specialisation: 'Investments',
    gender: 'Male',
    age: '52',
    q1_answer: 'Recruitment & Development',
    q1_other: '',
    q2_answers: ['Recruitment Support', 'Training & Development'],
    q2_other: '',
    q3_answer: 'Intergenerational wealth transfer creating demand for estate and succession planning',
  },
  {
    name: 'Lisa Wang',
    email: 'lisa@harbourwealth.co.nz',
    company: 'Harbour Wealth',
    role_type: 'product_supplier',
    adviser_specialisation: null,
    gender: 'Female',
    age: '44',
    q1_answer: 'Client Growth',
    q1_other: '',
    q2_answers: ['Business Development Tools', 'Training & Development'],
    q2_other: '',
    q3_answer: 'ESG and ethical investment demand continues to grow among younger demographics',
  },
  {
    name: 'Andrew McPherson',
    email: 'andrew@capitalfp.co.nz',
    company: 'Capital Financial Planning',
    role_type: 'financial_adviser',
    adviser_specialisation: 'Life and Health Insurance',
    gender: 'Male',
    age: '61',
    q1_answer: 'Tech & Automation',
    q1_other: '',
    q2_answers: ['Compliance Guidance', 'Business Development Tools'],
    q2_other: '',
    q3_answer: 'AI-driven financial tools are changing client expectations of speed and personalisation',
  },
  {
    name: "Rachel O'Brien",
    email: 'rachel@northstaradvice.nz',
    company: 'North Star Advice',
    role_type: 'financial_adviser',
    adviser_specialisation: 'KiwiSaver',
    gender: 'Female',
    age: '33',
    q1_answer: 'Regulation & Compliance',
    q1_other: '',
    q2_answers: ['Peer Networks & Mentoring', 'Compliance Guidance'],
    q2_other: '',
    q3_answer: 'Mental health and financial wellbeing linkage driving holistic advice demand',
  },
  {
    name: 'Mike Stewart',
    email: 'mike@stewartfs.co.nz',
    company: 'Stewart Financial Services',
    role_type: 'other',
    adviser_specialisation: null,
    gender: 'Male',
    age: '45',
    q1_answer: 'Other',
    q1_other: 'Work-life balance and wellbeing',
    q2_answers: ['Training & Development', 'Peer Networks & Mentoring'],
    q2_other: '',
    q3_answer: 'Climate-related risk awareness pushing insurance and investment conversations',
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
      role_type TEXT,
      adviser_specialisation TEXT,
      gender TEXT,
      age TEXT,
      q1_answer TEXT,
      q1_other TEXT,
      q2_answers TEXT[],
      q2_other TEXT,
      q3_answer TEXT,
      q3_other TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // Ensure new columns exist (for existing tables)
  await pool.query(`ALTER TABLE poll_responses ADD COLUMN IF NOT EXISTS role_type TEXT`);
  await pool.query(`ALTER TABLE poll_responses ADD COLUMN IF NOT EXISTS adviser_specialisation TEXT`);
  await pool.query(`ALTER TABLE poll_responses ADD COLUMN IF NOT EXISTS gender TEXT`);
  await pool.query(`ALTER TABLE poll_responses ADD COLUMN IF NOT EXISTS age TEXT`);

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
    const minutesAgo = (SEED_DATA.length - i) * 12;
    const createdAt = new Date(Date.now() - minutesAgo * 60 * 1000);

    await pool.query(
      `INSERT INTO poll_responses (name, email, company, role_type, adviser_specialisation, gender, age, q1_answer, q1_other, q2_answers, q2_other, q3_answer, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [d.name, d.email, d.company, d.role_type, d.adviser_specialisation, d.gender, d.age, d.q1_answer, d.q1_other, d.q2_answers, d.q2_other, d.q3_answer, createdAt]
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
