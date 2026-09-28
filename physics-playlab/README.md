# Physics PlayLab

Physics PlayLab is a bilingual (Thai/English) interactive physics learning web app. It is designed to help learners move from memorising formulas to understanding them through short lessons, worked examples, experiments, and immediate feedback.

## Problem

Physics formulas are often taught as something to memorise, without enough opportunity to connect them to motion, forces, or observable results. Physics PlayLab turns each topic into a small learning journey: learn the concept, experiment with it, answer questions, and see progress build on a visual map.

## Core learning loop

**Learn → Experiment/Lab → Quiz & Feedback → Progress → Unlock**

- **Learn:** read a concept, worked example, and the related formulas.
- **Experiment/Lab:** adjust parameters and observe a physics simulation with telemetry and graphs.
- **Quiz & Feedback:** answer topic questions, see explanations, and earn stars/flags.
- **Progress:** track completed learning, labs, quiz scores, and island status.
- **Unlock:** complete prerequisite topics to open the next island on the progression map.

## Main features

- Learn pages with bilingual explanations, worked examples, and a **Formula Bank**.
- Interactive labs for motion and Newton-law topics, including start, pause/resume, reset, telemetry, and charts.
- **60 quiz questions** across six sub-islands, with Thai/English questions, choices, explanations, and formula hints.
- Stars, flags, quiz scores, and map-based progression with prerequisite unlocks.
- Thai/English language toggle with browser-language detection and saved language preference.
- Persistent progress in the browser, with Firebase/Firestore sync for authenticated users.
- Optional hand tracking in the 3D sandbox using MediaPipe Hands; mouse/touch interaction remains available when a camera is not used.

## Production

Open the deployed app at [physics-playlab.vercel.app](https://physics-playlab.vercel.app/).

## Tech stack

- Next.js App Router, React, and TypeScript
- Firebase Authentication and Firestore
- MediaPipe Hands for optional camera-based interaction
- Three.js for the 3D hand-tracking sandbox
- Vercel-hosted production deployment

## Architecture

```text
src/app/       App Router pages: landing, login, lobby, learn, lab, quiz, sandbox
src/components Shared UI and visual components
src/data/      Island, lesson, quiz, and translation data
src/hooks/     Language, hand-tracking, and physics-world hooks
src/lib/       Firebase, Firestore, progress, i18n, and physics helpers
public/        Images and locally served MediaPipe assets
```

## Run locally

Requirements: Node.js and npm.

```bash
npm install
npm run dev
```

Create `.env.local` in the project root for Firebase configuration. Use your own project values locally; do not commit them.

```dotenv
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

Then open [http://localhost:3000](http://localhost:3000).

The repository ignores `.env*` files, including `.env.local`.

## Validation and QA notes

- 60-question consistency validation completed.
- `hm-2` validates to **56 m** using `s = ut + ½at²`.
- `vm-6` validates to **approximately 1.73 s** using `h = ½gt²`.
- Thai/English core journey smoke-tested.
- Lab Pause/Resume behavior fixed and validated.

## Business and scalability

### Current

- A focused physics learning product covering straight motion and Newton-law content.
- A single web application with client-side learning progress and Firebase-backed authenticated progress sync.
- A production deployment suitable for demonstration and public review.

### Planned

- Expand the curriculum beyond the current islands and add more experiment types.
- Strengthen learning analytics and assessment reporting after a verified study design and dataset are available.
- Improve cross-device progress reliability, observability, and content-management workflows as usage grows.
- Add more scalable backend controls for larger cohorts, classroom use, and educator reporting.

## Known limitations

- Camera-based hand tracking depends on browser camera permission and device capability; the sandbox provides mouse/touch fallback.
- The current content scope is limited to the implemented motion and Newton-law islands.
- Firebase features require valid project configuration in local environment variables.
- No user-count or learning-outcome claims are included here because final verified numbers are not available.
