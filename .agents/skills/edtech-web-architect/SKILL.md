---
name: edtech-web-architect
description: Master Next.js 16+ App Router, React 19.3+ (with React Compiler), TypeScript, TailwindCSS v4.3+, Vercel Serverless, Neon PostgreSQL 18 (Drizzle ORM v0.45+), KaTeX math rendering, PWA offline sync, and the 5 React/SVG parametric visual templates. Use PROACTIVELY when designing or implementing web components for the Diagnostic EdTech platform.
---

# EdTech Web Architecture & Engineering Guide (Next.js 16.4+ & Vercel)

This skill guides the design, implementation, and optimization of the **Diagnostic EdTech Web Platform** using Next.js 16.4+, React 19.3+ (with the React Compiler), TypeScript, TailwindCSS v4.3+, Neon PostgreSQL 18, and Vercel Serverless deployment.

---

## 1. Project Directory Structure (Feature-First)

```
web/
├── app/
│   ├── (auth)/                 # Seamless, low-friction login / student code entry
│   ├── (dashboard)/            # Parent & teacher diagnostic analytics views
│   ├── assessment/[sessionId]/ # The active 5-item micro-card diagnostic session
│   ├── api/                    # Route handlers for telemetry and health checks
│   ├── layout.tsx              # Root layout with Vazirmatn font & RTL direction
│   └── page.tsx                # Landing & diagnostic entry point
├── components/
│   ├── assessment/             # Single-item card carousel, question stem, options
│   ├── parametric/             # The 5 reusable React + SVG visual templates
│   │   ├── FractionStrip.tsx   # Visual fraction strips with interactive coloring
│   │   ├── NumberLine.tsx      # Adaptive number line with snap-to-fraction marks
│   │   ├── AreaGrid.tsx        # Grid area & rectangular multiplication visualizer
│   │   ├── BalanceScale.tsx    # Two-pan balance scale comparing quantities
│   │   └── BucketSort.tsx      # Binary drag-and-drop bucket classifier
│   ├── feedback/               # Empathetic feedback modal, counter-example capsules
│   └── ui/                     # Accessible primitives (Radix UI / Tailwind)
├── lib/
│   ├── bkt/                    # Pure TypeScript Bayesian Knowledge Tracing engine
│   ├── cas/                    # JavaScript symbolic math / fraction validator (mathjs)
│   ├── db/                     # Drizzle ORM schema & Neon serverless pool client
│   ├── math/                   # KaTeX RTL configuration & bidirectional sanitizer
│   └── offline/                # Dexie.js (IndexedDB) client for offline PWA storage
└── public/
    ├── audio/                  # Audio pronunciation assets
    └── manifest.json           # PWA manifest for add-to-homescreen
```

---

## 2. Server vs. Client Component Boundaries

- **Default to React Server Components (RSC):**
  - Session loading, lesson metadata, and student mastery history fetching must occur in RSCs directly against Neon PostgreSQL to achieve zero client-side data waterfalls.
- **Isolate Client Components (`'use client'`):**
  - Only mark the interactive card carousel, audio player, scratchpad canvas, and the 5 SVG parametric templates as client components.
- **Server Actions for Cognitive Telemetry:**
  - When a student answers a question, call a Server Action (`submitAnswerAction`).
  - The Server Action computes the BKT update, checks misconception tags, and records the telemetry record directly within the same database transaction.

---

## 3. Pure TypeScript BKT Engine (`lib/bkt/engine.ts`)

No heavy Python runtime is needed in production. The Bayesian Knowledge Tracing engine runs in pure TypeScript in under 2ms:

```typescript
export interface BKTParameters {
  pL0: number; // Prior knowledge probability (e.g. 0.10)
  pT: number;  // Transition probability (e.g. 0.20)
  pS: number;  // Slip probability (e.g. 0.10)
  pG: number;  // Guess probability (e.g. 0.25)
}

export function updateMasteryBKT(
  currentMastery: number,
  isCorrect: boolean,
  params: BKTParameters = { pL0: 0.1, pT: 0.2, pS: 0.1, pG: 0.25 }
): number {
  const { pS, pG, pT } = params;
  let posterior: number;

  if (isCorrect) {
    const num = currentMastery * (1 - pS);
    const denom = num + (1 - currentMastery) * pG;
    posterior = num / denom;
  } else {
    const num = currentMastery * pS;
    const denom = num + (1 - currentMastery) * (1 - pG);
    posterior = num / denom;
  }

  // Knowledge transition for the next time step
  return posterior + (1 - posterior) * pT;
}
```

---

## 4. The 5 Parametric Visual Templates (React + SVG)

Never write bespoke UI code for each math exercise. Always instantiate one of the 5 parametric components by passing a JSON payload:

1. **`FractionStrip`**: Renders dynamic SVG strips divided into $D$ equal rectangles, highlighting $N$ segments with smooth hover/touch fill transitions.
2. **`NumberLine`**: Renders an SVG horizontal line from $A$ to $B$ with tick marks, fraction labels, and an interactive draggable pointer with magnetic snap points.
3. **`AreaGrid`**: Renders an $R \times C$ grid with dimensions labeled on the borders to visually demonstrate multiplication and fractional areas.
4. **`BalanceScale`**: Animated SVG balance beam that dynamically tilts based on the weight ratio of Left vs. Right pans.
5. **`BucketSort`**: Two drop targets with spring animations (`framer-motion`), accepting cards dragged by the user.

---

## 5. Bidirectional RTL & KaTeX Mathematics Rules

- **Directionality Isolation**:
  - Always render standalone mathematical equations inside an explicit LTR container:
    ```tsx
    <div dir="ltr" className="inline-flex font-mono text-lg">
      <KaTeX math="\frac{3}{4} + \frac{1}{2}" />
    </div>
    ```
- **Persian Digits in Elementary Math**:
  - For Grade 4 & 5 elementary questions, configure KaTeX to render Persian numerals (`۱, ۲, ۳`) or wrap numbers with `\u200E` to prevent Unicode BiDi reordering bugs.
- **Font Pairing**:
  - Use `Vazirmatn` for Persian text and headings.
  - Pair with `KaTeX_Main` and `KaTeX_Math` for mathematical symbols.

---

## 6. Offline-First PWA Guidelines

- Use `@ducanh2912/next-pwa` or Serwist for service worker registration.
- Cache the current 5-item diagnostic session in `IndexedDB` (via `Dexie.js`) before presenting Question 1.
- If the network disconnects during the test:
  - Do NOT interrupt the student.
  - Store responses in local offline queue.
  - Background-sync with Neon PostgreSQL as soon as `navigator.onLine` fires.
