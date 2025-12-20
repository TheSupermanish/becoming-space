# Athena - Anonymous Mental Health Forum

A safe, anonymous space for mental health support, powered by AI wisdom and community care.

## Features

- **Anonymous Identity**: WebAuthn passkey authentication - no passwords, just biometrics (Face ID, Touch ID, Windows Hello)
- **AI Therapist**: Athena provides supportive, actionable guidance on every post
- **AI Moderation**: Content is automatically moderated to blur potentially triggering material
- **Community Support**: Like and comment on posts to support others
- **Warm, Organic Design**: Earth tones and natural textures create a calming environment

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: MongoDB Atlas with Mongoose
- **Auth**: WebAuthn Passkeys (SimpleWebAuthn)
- **AI**: Google Gemini
- **Styling**: Tailwind CSS with custom design tokens

## Setup

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (free tier works)
- Google Gemini API key

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/athena?retryWrites=true&w=majority

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# WebAuthn Configuration
WEBAUTHN_RP_NAME="Athena Forum"
WEBAUTHN_RP_ID=localhost
WEBAUTHN_ORIGIN=http://localhost:3000

# Session Secret (generate a random 32+ character string)
SESSION_SECRET=your_super_secret_session_key_here_at_least_32_chars
```

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
/app
  /api
    /auth         - WebAuthn registration & login
    /posts        - CRUD for posts
    /chat         - Chat with Athena
  /login          - Login/Register page
  /feed           - Main feed
  /create         - Create post
  /chat           - Chat with Athena
/components
  /ui             - Reusable UI components
  /features       - Feature-specific components
/lib
  /models         - Mongoose models
  db.ts           - Database connection
  gemini.ts       - AI service
  session.ts      - Session management
  webauthn.ts     - WebAuthn helpers
```

## How It Works

### Authentication Flow

1. User chooses a username
2. System generates a unique discriminator (e.g., `wanderer#1234`)
3. User registers with device biometrics (WebAuthn)
4. Session is stored in an encrypted cookie

### Post Flow

1. User writes a post with optional tags
2. AI moderates content for potentially harmful material
3. Post is saved with moderation results
4. Athena generates a supportive response asynchronously
5. Community can like and comment

### Moderation

- AI analyzes content for triggering material
- Sensitive content is blurred with a warning
- Users can click to reveal if they choose
- Athena still provides support regardless of moderation

## License

MIT
