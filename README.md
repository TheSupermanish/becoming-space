# 🌿 Athena - A Safe Place for Your Mind

**Athena** is an anonymous mental health support platform where users can vent their struggles, celebrate their wins, and receive AI-powered therapeutic guidance — all without revealing their identity.

🔗 **Live Demo**: [space.becomingbetter.app](https://space.becomingbetter.app)

![Athena Banner](https://img.shields.io/badge/Mental%20Health-Support-8FA68A?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=for-the-badge&logo=mongodb)

---

## 🎯 Purpose

### The Problem We Solve

Mental health stigma remains a significant barrier worldwide, especially in collectivist cultures where seeking help can be seen as weakness or bringing shame to one's family. Many people suffer in silence because:

- **Fear of judgment** from family, friends, or colleagues
- **Lack of access** to affordable mental health resources
- **Cultural barriers** that discourage open discussions about emotions
- **Privacy concerns** about their struggles being exposed

### Our Solution

**Athena** creates a judgment-free zone where anyone can:
- Share their struggles anonymously using **passkey authentication** (no email, no password, no identity)
- Receive immediate, empathetic responses from **Athena**, our AI therapist powered by Google Gemini
- Connect with a supportive community through comments and reactions
- Access evidence-based mental wellness tools anytime, anywhere

---

## ✨ Features

### 🌧️ Vent Mode
Release what's weighing on you. Share your struggles, frustrations, and difficult emotions in a safe space.
- **Supportive AI responses** with validation and gentle coping strategies
- **🫂 Hugs** - Community members can send virtual hugs to show support
- **Indigo-themed UI** with calming visual design

### ✨ Flex Mode  
Celebrate your wins, no matter how small. Positive moments deserve recognition!
- **Celebratory AI responses** that help you internalize achievements
- **🙌 High-Fives** - Community celebrates with you
- **Amber-themed UI** with energetic, uplifting design

### 🤖 Athena - AI Therapist
Powered by Google Gemini, Athena provides:
- **Personalized therapeutic responses** to every post
- **1-on-1 chat sessions** for deeper conversations
- **Content moderation** to keep the community safe
- **Context-aware tone** (supportive for vents, celebratory for flexes)

### 📊 Daily Mood Check-in
Track your emotional journey:
- 5-point emoji mood scale
- Optional journal notes
- Weekly mood history visualization
- Trend insights and patterns

### 🫁 Breathing & Grounding Tools
Evidence-based exercises for immediate relief:
- **Box Breathing** - Animated 4-4-6 breathing circle
- **5-4-3-2-1 Grounding** - Interactive sensory awareness exercise
- Accessible anytime from the navigation

### 📔 Private Journal
A space just for you:
- AI-generated daily prompts for reflection
- Mood tagging for entries
- Completely private - only you can see
- Edit and delete your entries

### 🔥 Growth Streaks
Gentle encouragement for consistent self-care:
- Track consecutive days of engagement
- Milestone celebrations (7, 30, 100 days)
- No punishment for breaks - "Welcome back!" messaging

### 🔐 Anonymous Authentication
True privacy through WebAuthn passkeys:
- **No email required** - just Face ID, Touch ID, or device PIN
- **Username + random tag** (e.g., `hope#4521`)
- **No password to remember or leak**
- Device-bound security

---

## 🛠️ Technologies Used

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript 5 |
| **Database** | MongoDB Atlas + Mongoose |
| **AI** | Google Gemini 2.0 Flash |
| **Authentication** | WebAuthn (SimpleWebAuthn) |
| **Session Management** | iron-session |
| **Styling** | Tailwind CSS 3.4 |
| **Deployment** | Vercel |

### Architecture Highlights

- **Server Components** for optimal performance
- **API Routes** for secure backend operations
- **Streaming AI responses** for real-time chat
- **Responsive design** with mobile-first approach
- **Accessibility features** including reduced motion support

---

## 🌍 Cultural & Psychological Impact

### Designed for Global Accessibility

**Athena** was built with cultural sensitivity in mind:

#### 🇮🇳 South Asian Communities
- Addresses the stigma around mental health discussions
- Anonymous format respects privacy concerns common in collectivist cultures
- No family/social circle exposure risk

#### 🎓 Students & Young Adults
- Safe space for academic stress, relationship issues, career anxiety
- Peer support through community interactions
- 24/7 availability for crisis moments

#### 🧠 Neurodiverse Users
- Clean, non-overwhelming UI design
- Breathing exercises for sensory regulation
- Flexible interaction patterns (post when ready, no pressure)

#### 🏥 Mental Health Professionals' Perspective
Our features are informed by evidence-based practices:
- **Validation-first responses** (DBT principle)
- **Cognitive reframing** suggestions
- **Grounding exercises** for anxiety/panic
- **Mood tracking** for pattern recognition
- **Journaling** for emotional processing

### Psychological Safety Features

1. **AI Moderation** - Harmful content is blurred with trigger warnings
2. **Crisis Resources** - 988 Lifeline info provided when needed
3. **No Follower Counts** - Removes social comparison anxiety
4. **Anonymous by Default** - Reduces self-censorship

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- MongoDB Atlas account (free tier works)
- Google AI Studio API key (free tier available)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/athena.git
   cd athena
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file:
   ```env
   # MongoDB Connection
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/athena?retryWrites=true&w=majority

   # Google Gemini API
   GEMINI_API_KEY=your_gemini_api_key_here

   # Session Secret (generate a random 32+ character string)
   SESSION_SECRET=your_super_secret_session_key_here_min_32_chars

   # WebAuthn Configuration
   WEBAUTHN_RP_ID=localhost
   WEBAUTHN_RP_NAME=Athena
   WEBAUTHN_ORIGIN=http://localhost:3000
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

### Building for Production

```bash
npm run build
npm start
```

---

## 📁 Project Structure

```
athena/
├── app/                      # Next.js App Router pages
│   ├── api/                  # API routes
│   │   ├── auth/             # WebAuthn authentication
│   │   ├── posts/            # Posts CRUD & reactions
│   │   ├── chat/             # Athena chat endpoint
│   │   ├── mood/             # Mood check-in API
│   │   ├── journal/          # Private journal API
│   │   └── streak/           # Streak tracking API
│   ├── feed/                 # Main feed page
│   ├── create/               # Post creation page
│   ├── chat/                 # Athena chat interface
│   ├── checkin/              # Daily mood check-in
│   ├── journal/              # Private journal
│   ├── breathe/              # Breathing & grounding tools
│   ├── login/                # Authentication page
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   ├── ui/                   # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Avatar.tsx
│   │   ├── TagPill.tsx
│   │   └── BlurredContent.tsx
│   └── features/             # Feature-specific components
│       ├── PostCard.tsx
│       ├── MarkdownView.tsx
│       ├── StreakBadge.tsx
│       └── BottomNav.tsx
├── lib/
│   ├── db.ts                 # MongoDB connection
│   ├── types.ts              # TypeScript definitions
│   ├── session.ts            # Session management
│   ├── webauthn.ts           # WebAuthn helpers
│   ├── gemini.ts             # Google Gemini AI service
│   └── models/               # Mongoose models
│       ├── User.ts
│       ├── Post.ts
│       ├── MoodEntry.ts
│       └── JournalEntry.ts
├── middleware.ts             # Auth middleware
├── tailwind.config.ts        # Tailwind configuration
├── next.config.ts            # Next.js configuration
└── package.json
```

---

## 🔑 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register/options` | POST | Get WebAuthn registration options |
| `/api/auth/register/verify` | POST | Verify registration & create user |
| `/api/auth/login/options` | POST | Get WebAuthn login options |
| `/api/auth/login/verify` | POST | Verify login & create session |
| `/api/auth/logout` | POST | End session |
| `/api/auth/me` | GET | Get current user |
| `/api/posts` | GET/POST | List posts / Create post |
| `/api/posts/[id]` | GET/PATCH/DELETE | Get/Update/Delete post |
| `/api/posts/[id]/comments` | POST/PATCH | Add/Like comment |
| `/api/chat` | POST/DELETE | Chat with Athena / Clear history |
| `/api/mood` | GET/POST | Get mood history / Log mood |
| `/api/journal` | GET/POST | Get entries / Create entry |
| `/api/journal/[id]` | PATCH/DELETE | Update/Delete entry |
| `/api/streak` | GET/POST | Get streak / Update streak |

---

## 🎨 Design System

### Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Earth | `#C67B5C` | Primary actions, buttons |
| Sage | `#8FA68A` | Success, Athena, calming |
| Bark | `#3D3631` | Text, headings |
| Stone | `#6B6259` | Secondary text |
| Cream | `#FAF7F2` | Background |
| Sand | `#E8E2D9` | Cards, borders |
| Indigo | `#6366F1` | Vent mode accent |
| Amber | `#F59E0B` | Flex mode accent |

### Typography

- **Headings**: Fraunces (serif)
- **Body**: DM Sans (sans-serif)

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Google Gemini** for powering Athena's therapeutic responses
- **SimpleWebAuthn** for passwordless authentication
- **Tailwind CSS** for the beautiful, responsive design
- The mental health community for inspiration and feedback

---

## 📞 Crisis Resources

If you or someone you know is in crisis:

- **🇺🇸 USA**: 988 Suicide & Crisis Lifeline (call or text 988)
- **🇮🇳 India**: iCall: 9152987821 | Vandrevala Foundation: 1860-2662-345
- **🇬🇧 UK**: Samaritans: 116 123
- **🌍 International**: [findahelpline.com](https://findahelpline.com)

---

<p align="center">
  <strong>Built with 💚 for mental wellness</strong><br>
  <em>Because everyone deserves a safe space</em>
</p>
