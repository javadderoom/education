---
name: flutter-architect
description: Master Flutter 3.47+ clean architecture, Riverpod state management, responsive multi-cohort UI, KaTeX math rendering, and tactile educational micro-interactions. Use PROACTIVELY when building or enhancing Flutter components for the Diagnostic EdTech platform.
---

# Flutter Architecture & Best Practices for Diagnostic EdTech Platform

This skill guides the design and implementation of the **Diagnostic EdTech Flutter Client** with clean architecture, robust state management, and ergonomic, multi-cohort UX.

## 1. Core Architecture (Feature-First)

Organize features cleanly:
```
lib/
├── core/
│   ├── theme/          # Adaptive Themes (Kids Playful, Teen Minimal, Academic Dark/Light)
│   ├── typography/     # Vazirmatn (Fa) / Inter & Merriweather (En)
│   ├── math/           # KaTeX BiDi & Persian digit rendering engine
│   ├── audio/          # Offline Piper TTS & haptic pronunciation audio
│   ├── local_db/       # SQLite / Hive offline diagnostic packs & sync engine
│   └── network/        # Dio / REST client with offline retry queues
└── features/
    ├── assessment/     # Single-item micro-card carousel, elimination swipe, progress
    ├── interactions/   # Drag-and-drop, hotspot taps, snap numberline, fraction strips
    ├── diagnosis/      # Skill Galaxy, cognitive mastery graph, heatmaps
    ├── remediation/    # Counter-example interactive capsules, micro-review
    ├── scratchpad/     # Overlay drawing canvas for math calculations
    └── parent_portal/  # Plain-language developmental summaries
```

## 2. State Management (Riverpod)
- Use `@riverpod` code generation / `Notifier` / `AsyncNotifier`.
- Keep business logic strictly inside Notifiers; UI widgets must remain purely declarative.
- For diagnostic assessment sessions, encapsulate the session state machine (`AssessmentSessionNotifier`) with immutable session states (`unanswered`, `submitted`, `revealed`).
- Offline-first cache sync must occur asynchronously via repository providers without blocking the UI isolate.

## 3. Educational Typography & UX Principles
- **Age-Adaptive Layouts**:
  - *Elementary (Ages 6-10)*: Giant touch targets (≥64dp), audio read-aloud buttons, tactile cards.
  - *Secondary / Academic (Ages 11+)*: Dense high-resolution layout, side-by-side KaTeX rendering, scratchpad toggle.
- **Bilingual Bidirectional Support**: Seamless RTL (Persian) and LTR (English/Math formulas) text directionality.
- **Zero-Friction Answering**: Avoid virtual keyboards. Favor single-tap choices, drag-and-drop buckets, and interactive sliders.

## 4. Modern Dart & Widget Construction Idioms

### Null-Aware Collection Elements (Dart 3.8+)
When building widget trees with optional/nullable children in `Column`, `Row`, or `Stack`, use null-aware collection elements (`?element`) instead of pattern-matching or explicit null checks:

```dart
// ✅ Recommended (Clean, idiomatic Dart 3.8+)
Stack(
  children: [
    _buildBackground(),
    if (showOverlay) _buildOverlay(),
    ?overlayChild, // Automatically omitted if null; non-null if present
  ],
)

// ❌ Avoid (Triggers 'use_null_aware_elements' lint)
Stack(
  children: [
    _buildBackground(),
    if (overlayChild case final child?) child,
    if (overlayChild != null) overlayChild!,
  ],
)
```

## 5. KaTeX and RTL Mathematical Formatting
- Always isolate math formulas in explicit LTR directionality containers (`Directionality(textDirection: TextDirection.ltr, child: ...)`).
- Ensure Persian diacritics (تَـ ، تِـ ، تُـ) in early grade reading prompts are rendered using fonts with complete open-type diacritic positioning (e.g. `Vazirmatn`).
