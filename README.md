# Physics PlayLab

> **Learn physics by seeing it, experimenting with it, and applying it.**

Physics PlayLab is a bilingual interactive physics learning platform that connects lessons, simulations, quizzes, feedback, and learning progression into one continuous experience.

Instead of learning physics only through formulas, students can build the concept, experiment with variables, observe how the system changes, apply what they learned, and receive immediate feedback.

---

## Links

- **Source Code:** https://github.com/NoppakornZen/PhysicLabz
- **Learning Evaluation:** https://script.google.com/macros/s/AKfycbzkuFmDLoYzNtajaFxxFZXGEsykl9xAqN15G0uNg5uVetumxLphWDuWbfSO8xhB7X3IcQ/exec
- **Live Demo:** Coming soon

---

## The Problem

Physics is often taught through formulas and worked examples, but students may still struggle to connect equations with what the motion actually looks like.

The challenge is not only remembering which formula to use. Students also need to understand:

- why a result changes
- what each variable represents
- how changing velocity, acceleration, angle, or gravity affects motion
- how equations connect to observable physical behavior

Physics PlayLab was built to make that connection more visible, interactive, and easier to follow.

---

## The Idea

Many learning tools separate lessons, simulations, and quizzes into different experiences.

Physics PlayLab brings them together into one guided learning journey.

Instead of only reading a formula or watching a simulation, students first build the concept, experiment with it, apply what they understood, receive feedback, and then progress to the next learning stage.

---

## Learning Loop

**Learn → Experiment → Apply → Feedback → Progress → Unlock**

This loop is the core of Physics PlayLab.

Each stage is designed to support the next:

- **Learn** the concept, variables, formulas, and examples
- **Experiment** with the same concept in an interactive physics lab
- **Apply** the idea through quizzes and problem solving
- **Feedback** explains why an answer is correct or incorrect
- **Progress** is represented through stars, flags, and completed learning units
- **Unlock** gives students a clear path toward the next topic

---

## Features

### Interactive Learning Units

Each learning unit can include:

- concept explanations
- Formula Bank
- variable and unit explanations
- worked examples
- interactive experiments
- quizzes with immediate feedback
- answer explanations

The goal is to help students connect the equation they see on the page with the motion they observe in the lab.

### Interactive Physics Labs

Students can adjust physical variables and immediately observe the result through:

- real-time simulations
- live numerical measurements
- graphs
- physics equations
- adjustable parameters

Instead of treating an equation as something to memorize, students can change the inputs and see how the physical behavior responds.

### Quiz & Feedback System

Quizzes are designed to be part of the learning process, not only an assessment.

Students receive:

- immediate answer feedback
- explanations after answering
- score results
- stars
- completion flags
- progression toward the next learning unit

Mistakes are used as another opportunity to learn.

### Learning Progression

Physics PlayLab uses a world-map-style progression system.

Students can:

- complete learning islands
- earn stars
- collect completion flags
- unlock new topics
- continue their saved learning progress

This gives each learning unit a clear sense of completion and direction.

### Thai & English

The core learning experience supports both:

- Thai
- English

Language preferences are persisted across sessions so students can continue in the language they selected.

### User Accounts & Progress

Physics PlayLab includes user authentication and persistent learning progress.

The current platform supports:

- account authentication
- saved learning progress
- completed learning units
- stars and flags
- unlocked content
- session persistence

---

## Learning Evaluation

Physics PlayLab also includes an anonymous pre-test and post-test system designed to measure learning change before and after the learning experience.

The same learner can be matched anonymously across both assessments, allowing learning progress to be evaluated without requiring personally identifiable information.

**Learning Check:**  
https://script.google.com/macros/s/AKfycbzkuFmDLoYzNtajaFxxFZXGEsykl9xAqN15G0uNg5uVetumxLphWDuWbfSO8xhB7X3IcQ/exec

The evaluation system is designed to support evidence-based learning measurement.

> We do not claim learning improvement unless it is supported by verified paired pre-test and post-test data.

---

## Current Physics Topics

Physics PlayLab currently includes interactive learning experiences such as:

### Horizontal Motion

Explore velocity, acceleration, displacement, and motion over time.

### Vertical Motion

Experiment with gravity, initial velocity, height, and free-fall behavior.

### Projectile Motion

Explore the relationship between launch velocity, angle, horizontal motion, and vertical motion.

The platform is designed so additional physics units can follow the same learning structure.

---

## Technology

Physics PlayLab is built as a modern browser-based web application.

### Frontend

- Next.js
- React
- TypeScript
- HTML / CSS
- Interactive simulation components

### Backend & Data

- Firebase Authentication
- Cloud Firestore
- Persistent user progress

### Deployment

The project is designed for browser-based deployment so students can access the learning experience without installing specialized physics software.

---

## Architecture

Physics PlayLab is structured around reusable learning modules.

```text
User
 │
 ▼
Authentication
 │
 ▼
Physics World Map
 │
 ├── Learn
 │     ├── Concept
 │     ├── Formula Bank
 │     └── Worked Example
 │
 ├── Lab
 │     ├── Simulation
 │     ├── Parameters
 │     ├── Live Measurements
 │     └── Graphs
 │
 ├── Quiz
 │     ├── Questions
 │     ├── Immediate Feedback
 │     └── Explanations
 │
 ▼
Result
 │
 ▼
Stars / Flags / Progress
 │
 ▼
Unlock Next Learning Unit
```

This modular structure allows new topics to be added without rebuilding the entire learning system.

---

## Why Physics PlayLab?

There are many physics simulations available online.

Physics PlayLab focuses on something slightly different:

**the guided learning journey around the simulation.**

A simulation alone can show what happens.

Physics PlayLab is designed to help students understand:

1. what they are learning
2. which physics concepts are involved
3. what happens when variables change
4. how those observations connect back to equations
5. whether they understood the concept well enough to apply it

That is why the simulation is only one part of the platform.

---

## AI Usage

We used AI tools such as ChatGPT and coding assistants to support:

- brainstorming
- debugging
- code review
- localization support
- documentation
- development assistance

AI was used as a development assistant rather than as a replacement for understanding the project.

The team reviewed, tested, and integrated the final implementation and can explain how the system works, how the learning flow is structured, and what role AI tools played during development.

---

## Challenges

One of the biggest challenges was making Physics PlayLab feel like one learning experience instead of several unrelated features.

A technically impressive simulation is not enough if students do not understand what they are observing.

We therefore focused on connecting:

**Concept → Formula → Experiment → Question → Explanation → Progress**

Other challenges included:

- keeping quiz answers and explanations mathematically consistent
- preserving simulation state during Pause and Resume
- saving learning progress between sessions
- supporting Thai and English across the same learning journey
- keeping the physics simulations understandable without overwhelming students
- making the progression system feel connected to learning rather than separate from it

We repeatedly tested the primary learning flow and added validation checks to reduce inconsistencies.

---

## What We Learned

Physics PlayLab taught us that educational technology is not only about adding more features.

The lesson, simulation, feedback, progression, and measurement systems all need to support the same learning goal.

We also learned that educational content must be tested just as carefully as software.

A technically working application can still teach the wrong thing if an answer key, formula, unit, or explanation is inconsistent.

Most importantly, the project evolved from a collection of physics experiments into a more complete learning product.

---

## What's Next

Future directions for Physics PlayLab include:

- more physics learning units
- teacher assignments
- classroom analytics
- concept mastery tracking
- curriculum-based learning packs
- additional classroom tools

These are **planned directions** and are not all part of the current release.

The current priority is to keep improving the reliability, learning design, and expandability of the core platform.

---

## Development Status

The current build includes the core Physics PlayLab learning experience and has been tested across its primary learning flow.

Current areas of focus include:

- reliability
- bilingual learning
- simulation accuracy
- quiz consistency
- learning progression
- persistent user progress
- learning evaluation

Physics PlayLab continues to evolve as we improve both the student experience and the underlying platform.

---

## Vision

Physics should not feel like a page full of equations that students simply have to memorize.

We want students to be able to:

**see it, change it, test it, and understand it.**

> **Learn it. Experiment with it. Apply it.**

**Physics PlayLab**
