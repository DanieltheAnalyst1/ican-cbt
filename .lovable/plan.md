

# ICAN CBT Platform — Homepage, Auth, Color Redesign & Enhanced Results

## Overview
Three major updates: (1) a professional homepage with authentication flow, (2) a complete color system overhaul to Deep Teal + Soft Gold, and (3) an enriched results page with correct answers, feedback, and study hints.

---

## 1. Global Color System Redesign

Replace all current vibrant gradient colors with the new professional palette across every file.

**New CSS variables in `index.css`:**
- Primary: Deep Teal `#0F4C5C` (hsl ~191 72% 21%)
- Accent/Secondary: Soft Gold `#E8C547` (hsl ~45 78% 59%)
- Background: `#F7F9FB`, Cards: `#FFFFFF`
- Text primary: `#1F2933`, Text secondary: `#6B7280`
- Borders: `#E5E7EB`
- Success: Emerald green, Warning: Amber, Destructive: Red (kept but softened)
- Hover states: teal darkened 8-12%

**Updated gradient utilities:**
- `gradient-primary` becomes a subtle teal-to-darker-teal gradient
- `gradient-accent` uses gold tones
- Remove harsh neon/vibrant gradients; replace with refined, muted versions
- Keep gradient utility classes but remap their colors

**Files affected:** `src/index.css`, `tailwind.config.ts`, and every component referencing `gradient-*` classes or hardcoded colors.

---

## 2. Homepage (Landing Page)

Create `src/pages/HomePage.tsx` as the new `/` route (move Dashboard to `/dashboard`).

**Sections:**
- **Sticky Header Nav**: Logo ("ICAN CBT") on left; "Log In" (outline button) and "Sign Up" (primary teal button) on right
- **Hero Section**: Clear headline (e.g., "Master Your ICAN Exams with Confidence"), supporting paragraph, two CTAs (Create Account primary, Log In secondary), subtle abstract pattern or gradient mesh background
- **Features Grid**: 3-4 cards — Practice Exams, Progress Tracking, Performance Insights, AI-Assisted Learning — with icons, hover elevation
- **Trust Strip**: Stats bar — "500+ Practice Questions", "6 Exam Papers", "AI-Powered Feedback"
- **Footer**: Privacy, Terms, Support links, copyright

---

## 3. Authentication Flow

Create `src/pages/AuthPage.tsx` with tabbed or toggled Sign Up / Log In forms. No real backend — use local state and localStorage to simulate auth.

**Sign Up form:** Name, Email, Password, Confirm Password with Zod validation, inline error messages, loading state simulation, redirects to `/dashboard`.

**Log In form:** Email, Password, "Remember me" checkbox, "Forgot password?" link (shows toast), validation, redirects to `/dashboard`.

**Auth context:** Create `src/contexts/AuthContext.tsx` with a simple provider storing user in localStorage. Wrap app in provider. Protected route wrapper redirects unauthenticated users to `/`.

---

## 4. Enhanced Results Page

Overhaul `src/components/exam/ResultsPage.tsx` to include:

**Correct Answers Section:**
- Add a `modelAnswer` field to `SubQuestion` in `examData.ts` with sample correct answers for each sub-question
- Each question card becomes expandable: shows student answer vs. model answer side-by-side

**Feedback & Evaluation:**
- Per-question feedback generated from mock logic (based on answer length, keywords, and score):
  - "Strengths" — what the student did well
  - "Areas for Improvement" — specific gaps
  - "Hint" — a tip on how to approach the question more efficiently
- Overall summary section at the top with:
  - Performance band (Distinction / Credit / Pass / Fail)
  - Key strengths across the exam
  - Priority topics to review
  - Suggested study approach

**Visual treatment:**
- Expandable/collapsible question cards (using Accordion or Collapsible)
- Color-coded score indicators using the new teal/gold palette
- Progress bars for each question
- "View Model Answer" toggle per sub-question

---

## 5. Routing Updates

Update `src/App.tsx`:
- `/` renders `HomePage`
- `/auth` renders `AuthPage`
- `/dashboard` renders `Dashboard` (protected)
- `/exam/:examId` renders `ExamPage` (protected)

---

## 6. Data Updates

Add to each `SubQuestion` in `examData.ts`:
- `modelAnswer: string` — the correct/ideal answer text
- `hints: string[]` — 1-2 tips for solving faster
- `keyPoints: string[]` — key concepts the answer should cover

---

## Technical Details

**New files:**
- `src/pages/HomePage.tsx`
- `src/pages/AuthPage.tsx`
- `src/contexts/AuthContext.tsx`
- `src/components/ProtectedRoute.tsx`

**Modified files:**
- `src/index.css` — full color variable overhaul
- `tailwind.config.ts` — updated color tokens
- `src/App.tsx` — new routes, auth provider wrapping
- `src/data/examData.ts` — add modelAnswer, hints, keyPoints to SubQuestion
- `src/components/exam/ResultsPage.tsx` — complete rebuild with feedback sections
- `src/pages/Dashboard.tsx` — updated color classes
- `src/pages/Index.tsx` — redirect logic
- `src/components/exam/ExamNavBar.tsx` — new palette
- `src/components/exam/ExamTimer.tsx` — new gradient colors
- `src/components/exam/QuestionSidebar.tsx` — new status colors
- `src/components/exam/QuestionContent.tsx` — new palette
- `src/components/exam/AnswerArea.tsx` — new palette
- `src/components/exam/Calculator.tsx` — new palette
- `src/components/exam/ExamInstructions.tsx` — new palette
- `src/components/exam/SubmitConfirmation.tsx` — new palette

