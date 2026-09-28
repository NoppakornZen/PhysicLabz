# Physics PlayLab — Master Blueprint (v1.0)

## 1. Overview
Physics PlayLab is a web-based interactive learning platform for physics using:
- Isometric island map navigation
- Physics simulation lab (deterministic formula-based)
- Quiz-based progression system
- Mascot-driven learning assistant

## 2. Core System Flow
Login → Isometric Lobby Map → Island Selection → Learn / Lab / Quiz → Progress Tracking (Flag System)

## 3. Mascot System
Mascot is a core AI guide, not decoration.

### Roles:
- Teach concepts in Learn mode
- Assist setup in Lab mode
- Provide hints in Quiz mode
- React to user success/failure

### States:
- Idle
- Teaching
- Explaining
- Hinting
- Celebration / Failure reaction

## 4. World Structure (Isometric Map)

Main Islands:
1. Straight Motion
   - Horizontal Motion
   - Vertical Motion
   - Projectile Motion

2. Forces & Newton Laws
   - Newton 1
   - Newton 2
   - Newton 3

Each sub-island has states:
- Locked
- Available
- In Progress
- Completed (Flag Planted)

## 5. Learn Mode
- Simple explanation
- Key formulas (1–3 per topic)
- Example problem
- Mascot explanation panel

## 6. Lab System (Core Feature)

### Architecture:
Object System → Parameter Control → Physics Engine → Animation Renderer → Visualization

### Features:
- Object selection (car, ball, block, projectile)
- Parameter sliders (mass, force, velocity, time, angle)
- Play / Reset / Step simulation

### Physics Engine:
Deterministic formula-based simulation

Example:
F = ma
v = u + at
s = ut + 1/2 at²

Fixed timestep simulation (1/60s)

## 7. Quiz System
- 10 questions per sub-island
- MCQ / calculation based
- Score system:
  - 0–4 Fail
  - 5–7 Pass
  - 8–10 Perfect → Unlock Flag

### Output:
- Mascot explanation after each answer
- Formula reference shown

## 8. Progress System
User data tracks:
- Completed sub-islands
- Quiz scores
- Flag placement status

## 9. UI/UX Design
- Isometric game-style map
- Minimal text UI
- Animation-driven feedback
- Mascot always visible

## 10. Technical Architecture
Frontend:
- React / Next.js
- Canvas / PixiJS for rendering
- GSAP for animation

Backend:
- Firebase / Supabase
- Authentication + Progress storage

Physics:
- Pure JavaScript deterministic simulation engine

## 11. Key Differentiator
- Real-time physics simulation based on real formulas
- Game-based island learning system
- Mascot-driven adaptive teaching
- No physical lab required

## 12. System Principle
"Learn by seeing physics happen, not by memorizing formulas"
