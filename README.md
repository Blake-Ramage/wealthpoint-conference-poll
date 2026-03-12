# Wealthpoint Conference Poll

A real-time polling application designed for the Wealthpoint conference, featuring mobile voting interface and live TV display with instant results.

## 🚀 Live Application

**Poll Interface:** https://wealthpoint-poll.vercel.app  
**TV Display:** https://wealthpoint-poll.vercel.app/display.html

## 📱 Features

### Mobile Polling Interface
- **3-step poll** with progress tracking
- **User details collection** (name, email, company)
- **Interactive questions:**
  - Q1: Business success drivers (single choice)
  - Q2: Support priorities (multi-choice, max 2)
  - Q3: Future trends in advice demand (single choice)
- **Real-time results** shown after each question
- **Responsive design** optimized for mobile devices
- **Thank you screen** with animated confetti

### TV Display
- **Auto-cycling slides** (10 seconds each)
- **Live counter** of total participants
- **Bar charts** for all questions with percentages
- **QR code** for easy access to poll
- **Professional Wealthpoint branding**

### Questions & Options

#### Question 1: What will drive your business success in the next 12 months?
- Regulation & Compliance
- Client Growth
- Tech & Automation
- Recruitment & Development
- Other (with text input)

#### Question 2: What support matters most to your business? (Select up to 2)
- Compliance Guidance
- Business Development Tools
- Training & Development
- Recruitment Support
- Peer Networks & Mentoring
- Other (with text input)

#### Question 3: What trend will shape advice demand in 2026?
- Compliance Guidance
- Business Development Tools
- Training & Development
- Recruitment Support
- Peer Networks & Mentoring
- Other (with text input)

## 🎨 Design Features

- **Montserrat font** throughout the application
- **Navy blue (#162e5a) primary color** with teal (#0099cd) accents
- **Smooth animations** and transitions
- **Mobile-responsive** design
- **Professional branding** with Wealthpoint logo

## 🏗️ Technical Stack

- **Frontend:** Vanilla HTML, CSS, JavaScript
- **Backend:** Node.js with Vercel Functions
- **Database:** PostgreSQL (Neon)
- **Hosting:** Vercel
- **Styling:** Custom CSS with CSS variables

## 📦 Project Structure

```
├── public/
│   ├── index.html          # Main poll interface
│   ├── display.html        # TV display
│   ├── css/
│   │   └── style.css       # All styles
│   ├── js/
│   │   ├── poll.js         # Poll logic
│   │   └── display.js      # Display logic
│   └── qr-code.png        # QR code for poll access
├── api/
│   ├── submit.js          # Submit poll responses
│   ├── results.js         # Get aggregated results
│   └── export.js          # Export responses (admin)
├── scripts/
│   └── seed.js            # Database seeding
├── package.json
├── vercel.json
└── .env                   # Database connection
```

## 🗄️ Database Schema

```sql
CREATE TABLE poll_responses (
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
```

## 🚀 Setup & Deployment

### Prerequisites
- Node.js 18+
- PostgreSQL database (Neon recommended)
- Vercel account

### Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Blake-Ramage/wealthpoint-conference-poll.git
   cd wealthpoint-conference-poll
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your database URL
   ```

4. **Setup database:**
   ```bash
   npm run seed
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

6. **Access the application:**
   - Poll: http://localhost:3000
   - Display: http://localhost:3000/display.html

### Production Deployment

1. **Deploy to Vercel:**
   ```bash
   npx vercel --prod
   ```

2. **Set environment variables in Vercel:**
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `EXPORT_TOKEN`: Secret token for data export

## 📱 QR Code

A high-quality QR code (400x400px) is included in `public/qr-code.png` that links directly to the poll. This can be:
- **Displayed on conference screens**
- **Printed on materials**
- **Shared digitally**

URL encoded: `https://wealthpoint-poll.vercel.app`

## 📊 Usage

### For Participants
1. **Scan QR code** or visit the URL
2. **Enter your details** (name, email, company)
3. **Answer 3 questions** about business priorities and trends
4. **View results** after each question
5. **Collect your phone charger!**

### For Organizers
- **TV Display:** Open `/display.html` on the conference screen
- **Monitor responses:** Check `/api/results` for live data
- **Export data:** Use `/api/export` with the export token

## 🔧 API Endpoints

- **GET `/api/results`** - Live aggregated poll results
- **POST `/api/submit`** - Submit poll response
- **GET `/api/export`** - Export all responses (requires token)

## 📈 Analytics

The application tracks:
- **Total participants**
- **Response patterns** for each question
- **Completion rates**
- **Real-time voting trends**

## 🎯 Conference Integration

Perfect for:
- **Pre-session engagement**
- **Mid-conference pulse checks**
- **Networking conversation starters**
- **Data-driven conference insights**

## 📞 Support

For technical support or customizations, contact the development team.

---

*Built for Wealthpoint Conference 2026*