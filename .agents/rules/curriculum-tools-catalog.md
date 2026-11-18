---
trigger: always_on
description: Always keep curriculum, diagnostic items, and educational tools synchronized with docs/curriculum_items_tools_catalog.md (SSOT).
---

## Curriculum, Diagnostic Items & Visual Tools Synchronization (SSOT)

The file [`docs/curriculum_items_tools_catalog.md`](file:///g:/Code/education/docs/curriculum_items_tools_catalog.md) is the project's permanent Single Source of Truth (SSOT) and atlas for all curriculum mappings, chapters, knowledge components (KCs), diagnostic items, misconceptions, and visual manipulatives/templates across the application.

Rules:
1. **Always Synchronize on Changes**: Whenever canonical cartridges (`data/canonical/*.json`), curriculum taxonomies (`web/lib/data/curriculum-taxonomy.ts`), visual components (`web/components/parametric/*`, `VisualTemplateRegistry.tsx`), or database seeds are created, updated, or refactored, `docs/curriculum_items_tools_catalog.md` MUST be updated in the same turn/commit to reflect the exact state, coverage counts, component props, and question mappings.
2. **Zero Disparity Permitted**: The status of lessons, question counts, active/proposed manipulatives, and pedagogical blueprints reported to the user or implemented in code must ALWAYS 100% match `docs/curriculum_items_tools_catalog.md`.
3. **New Feature & Item Planning**: Any new diagnostic item, educational tool, or curriculum expansion must first be cross-checked with and documented in `docs/curriculum_items_tools_catalog.md` before or during code implementation.
