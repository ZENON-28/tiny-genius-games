# Tiny Genius Games 🎮✨

**Play • Learn • Smile**

An educational game platform for kids ages 5–10. One screen (TV, projector,
laptop) becomes the **Game Screen** and a phone becomes the **Controller** —
similar to Kahoot or Jackbox, but built for young kids.

Includes two games:
- 🎨 **Color Memory Challenge** — watch a color sequence on the TV, repeat it on your phone.
- 🔎 **Find the Odd One Out** — spot the different emoji among 4 shown on the TV (100+ generated question combinations across 12 categories).

---

## 1. Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. The app works immediately in **offline demo
mode** — no Firebase needed — using localStorage + BroadcastChannel to sync
between two browser tabs on the same computer (great for testing the host +
player flow yourself before you have two real devices).

## 2. Set up Firebase (for real multi-device play)

To let a TV and a phone sync over the actual internet, you need a free
Firebase project:

1. Go to https://console.firebase.google.com and create a new project.
2. In the project, click **Build → Firestore Database → Create database**
   (start in test mode for development).
3. Click **Build → Authentication → Get started**, enable the
   **Anonymous** sign-in provider.
4. Click the gear icon → **Project settings → General**, scroll to
   "Your apps", click the **Web** icon (`</>`) to register a new web app.
5. Copy the config values shown into a `.env.local` file in this project
   (copy `.env.local.example` as a starting point):

   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
   NEXT_PUBLIC_FIREBASE_APP_ID=...
   ```

6. In **Firestore → Rules**, use rules like this for a simple public demo
   (rooms self-expire in practice since codes are reused/overwritten —
   tighten these before any real production use):

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /rooms/{roomCode} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

7. Restart `npm run dev` (or redeploy) after adding the env vars.

## 3. Deploy to Vercel

1. Push this project to a GitHub repository.
2. Go to https://vercel.com/new and import the repo.
3. In the Vercel project's **Settings → Environment Variables**, add the
   same six `NEXT_PUBLIC_FIREBASE_*` variables from your `.env.local`.
4. Click **Deploy**.
5. Once deployed, open the site on your TV/laptop, click **Host Game**,
   and scan the QR code with a phone to join.

## Project structure

```
app/               Next.js App Router pages (/, /host, /join, /play, /about, /settings)
components/        Reusable UI: Mascot, BigButton, Background, Scoreboard, Confetti
games/             Game logic: ColorMemory.tsx, OddOneOut.tsx (Host + Player views each)
lib/               firebase.ts, room.ts (Firestore + localStorage-fallback sync), sounds.ts
types/             Shared TypeScript types
data/               Odd-One-Out question bank generator (100+ questions, 12 categories)
public/            manifest.json, PWA icons
```

## Notes

- If Firebase env vars are missing, the app automatically falls back to an
  offline demo mode (see `lib/room.ts` / `lib/firebase.ts`) so it never
  crashes and is always testable locally.
- Sound effects are generated with the Web Audio API (no audio files to
  manage).
- The player screen intentionally never displays the question/sequence —
  only the TV/host screen does, matching the Kahoot-style "phone is a
  controller" design.
