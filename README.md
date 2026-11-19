# SoundForge — Simplified Music Production Web Application (DAW)

SoundForge is a production-ready, BandLab-style web music production workstation (DAW) built for solo musicians, beatmakers, and audio producers. It focuses on zero-latency recording, multi-track timeline editing, clip manipulation, and stereo master audio export.

---

## 🚀 Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Audio Processing**: Web Audio API, Wavesurfer.js
- **State Management**: Zustand
- **Database & ORM**: PostgreSQL, Prisma ORM (with local fallback layer)
- **Authentication**: NextAuth.js (Credentials, email/password, session management)
- **Audio Storage**: Supabase Storage (with automatic built-in `/api/upload` fallback)
- **Deployment**: Vercel-ready monolithic architecture

---

## 🎨 Design System

- **Background**: `#09090B` (DAW Charcoal Dark)
- **Card**: `#18181B` (Zinc Dark)
- **Primary Accent**: `#22C55E` (Emerald Green)
- **Text**: `#FFFFFF`
- **Inspiration**: BandLab, Ableton Live, Spotify Dark Mode

---

## 🎹 Complete Feature Breakdown

### Phase 1: User Authentication
- Register new producer accounts with secure bcrypt-hashed passwords.
- Login with credentials, persistent JWT session management.
- 1-click instant demo studio access.
- Forgot password workflow.

### Phase 2: Project Management
- **Dashboard**: Track count, recently edited sessions, and live storage meter.
- Create new projects with custom title and tempo (BPM).
- Duplicate projects (deep clones tracks and timeline items).
- Rename and delete projects with instant UI revalidation.

### Phase 3: Audio Recording
- Direct microphone access via browser `getUserMedia`.
- Real-time RMS volume audio visualizer meters.
- Start, pause, resume, and stop recording.
- Saves audio directly as uncompressed 16-bit linear PCM `.wav` files.
- Automatically uploads to Supabase Storage bucket `audio-clips` (or fallback `/api/upload`).
- Adds the recorded take as a new clip to the target track.

### Phase 4: Tracks & Mixing
- Create new audio tracks with custom colors.
- Delete tracks.
- Per-track controls:
  - **Mute (M)**: Silences the track.
  - **Solo (S)**: Isolates the track; mutes all non-soloed tracks.
  - **Volume Gain**: 0% to 100% linear slider.
  - **Stereo Pan**: Full Left (-100) to Full Right (+100) spatial panning.
  - **REC**: Direct arm button to record to that specific track.

### Phase 5: Waveform Viewer
- Interactive canvas waveform rendering powered by Wavesurfer.js.
- Zoom-responsive rendering synchronized with project timeline zoom.
- Track color coding with interactive audio scrub and seek.

### Phase 6: Timeline Editor
- Seconds ruler with seconds / sub-second ticks.
- Dynamic playhead running across all tracks.
- Drag clips across timeline to adjust start and end times.
- Dual-sided trim handles: Left trim (adjust start) and Right trim (adjust end).
- Built-in synthetic audio generator (Lead Synth, 808 Bass, Drums) for instant previewing.

### Phase 7: Playback Engine
- Web Audio API hardware clock synchronization (`audioContext.currentTime`).
- Zero audio drift across simultaneous tracks.
- Play, Pause, Stop, Seek to position.
- Real-time master output spectrum & VU meter.
- Keyboard shortcuts: `Space` for Play/Pause, `Enter` to return to start (0:00).

### Phase 8: Master Mixdown Export
- Browser-side `OfflineAudioContext` multi-track mixdown.
- Mixes all audible tracks with their precise volume, panning, clip offsets, and durations.
- Exports to standard 16-bit WAV or high-quality MP3.
- Automatically triggers direct browser file download.

---

## 🛠️ Project Structure

```
soundforge/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts  # NextAuth API route
│   │   └── upload/route.ts              # Audio file upload endpoint
│   ├── dashboard/page.tsx               # Projects dashboard
│   ├── forgot-password/page.tsx         # Password recovery
│   ├── login/page.tsx                   # User login & 1-click demo
│   ├── register/page.tsx                # User registration
│   ├── studio/[projectId]/page.tsx      # Main DAW studio route
│   ├── globals.css                      # Tailwind & DAW styles
│   ├── layout.tsx                       # Root layout & providers
│   └── page.tsx                         # Landing page
├── components/
│   ├── dashboard/dashboard-view.tsx     # Dashboard cards & project actions
│   ├── providers/auth-provider.tsx      # NextAuth SessionProvider
│   └── studio/
│       ├── audio-clip.tsx               # Drag & trim timeline clips
│       ├── playback-controls.tsx        # Transport bar (Play/Stop/BPM/Meter)
│       ├── playhead.tsx                 # Playhead tracking cursor
│       ├── recording-modal.tsx          # Microphone HUD & WAV recorder
│       ├── seconds-ruler.tsx            # Zoomable time ruler
│       ├── studio-sidebar.tsx           # Sidebar (Tracks, Settings, Export)
│       ├── studio-workspace.tsx         # Studio canvas container
│       ├── track-header.tsx             # Track mixer controls (Vol/Pan/M/S/Rec)
│       ├── track-lane.tsx               # Track timeline lane
│       └── waveform-viewer.tsx          # Wavesurfer waveform component
├── hooks/
│   └── use-audio-recorder.ts            # Web Audio mic recording hook
├── lib/
│   ├── audio-encoder.ts                 # 16-bit PCM WAV encoder & synth generators
│   ├── audio-engine.ts                  # Web Audio API multi-track engine & exporter
│   ├── auth.ts                          # NextAuth configuration & credentials provider
│   ├── db-store.ts                      # Resilient Prisma + Local fallback store
│   ├── prisma.ts                        # Prisma client singleton
│   ├── studio-store.ts                  # Zustand studio state store
│   ├── supabase.ts                      # Supabase Storage client & upload handler
│   └── utils.ts                         # Class merging & time formatters
├── prisma/
│   └── schema.prisma                    # PostgreSQL User, Project, Track, TimelineItem
├── public/
│   └── uploads/                         # Local audio storage directory
├── types/
│   └── index.ts                         # Core TypeScript interfaces
├── .env.example                         # Environment configuration template
├── package.json                         # Dependencies & scripts
└── tailwind.config.js                   # DAW color palette & theme
```

---

## ⚙️ Setup & Installation Instructions

### 1. Prerequisites
- Node.js 18+ (tested on Node.js 22 & 24)
- npm or pnpm
- (Optional) PostgreSQL database (Supabase, Neon, or local PostgreSQL)

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Set your values in `.env`:
```env
# PostgreSQL Database (e.g. Supabase, Neon, or localhost)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/soundforge?schema=public"

# NextAuth Secret & URL
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="soundforge-production-master-secret-key-32chars"

# Supabase Storage (Optional - falls back to /api/upload if empty)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"
```

### 4. Initialize Database
```bash
npx prisma generate
npx prisma db push
```
*(Note: If a PostgreSQL database is not connected, SoundForge seamlessly falls back to its local persistent JSON storage layer, ensuring 100% of features work out of the box).*

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Build for Production
```bash
npm run build
npm run start
```
