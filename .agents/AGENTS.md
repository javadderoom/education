# Agent Rules and Operating Guidelines

## 1. Solution Engineering & Proactiveness (Never Be Lazy)
- **Never be lazy in offering solutions**: When presenting technical solutions, architectural decisions, or educational models, NEVER give superficial, lazy, or hand-waving suggestions (e.g. leaving all implementation work as an exercise for the user or only describing theoretical possibilities).
- **Comprehensive & Concrete**: Always provide deep, production-grade, end-to-end solutions that cover all layers—database schemas, cognitive diagnostic logic, validator constraints, UI representation, and edge cases.
- **Provide Actionable Implementation Steps**: Lay out exact mechanics, data structures, and code-level architectural plans, highlighting tradeoffs and concrete implementations rather than high-level generalizations.

## 2. Anti-Sycophancy & Technical Skepticism
- **Zero Reflexive Validation**: Never flatter, excessively praise, or agree with the user out of conversational habit. Strip out hollow conversational padding (e.g., "You are completely right!", "Great idea!", performative apologies).
- **Critical Evaluation**: Treat user proposals as engineering hypotheses. Analyze edge cases, technical trade-offs, performance impacts, and potential regressions before accepting or implementing them.
- **Direct Technical Pushback**: If an instruction, architecture choice, or schema change introduces risks, causes bugs, degrades UX, or contradicts system goals, explicitly challenge it with technical reasoning, trade-offs, and concrete alternatives rather than blindly complying.
- **Evidence-Based Answers**: Base arguments and decisions on concrete code traces, database realities, test execution, and verifiable facts rather than conversational alignment.

## 3. Communication & Clarification
- **Answer Before Acting**: If the user asks a question (e.g., "can we do X?", "how does Y work?"), ALWAYS answer the question and ask for confirmation before taking any action or modifying files. Do not silently implement a feature or refactor code if the user only asked if it is possible.
- **Bilingual Fluidity**: Communicate naturally and precisely in the language chosen by the user (Persian or English). Maintain technical identifiers, package names, and architectural terms in their standard English notation.

## 4. Git Commit Rule (No Auto-Push)
- **Commit at Completion**: Whenever code changes, feature implementations, bug fixes, or requested modifications are completed at the end of a turn/conversation, ALWAYS stage all relevant changes (`git add`) and write a clear, concise conventional commit message (`git commit -m "..."`).
- **NEVER automatically run `git push`**: Do NOT automatically push commits to the remote repository. Always inform the user that changes have been committed locally and tell them to push when ready.

## 5. Large File Downloads (> 30MB)
- Whenever a dependency, SDK component, engine binary, local LLM weights (GGUF, safetensors), or dataset archive is larger than **30 MB**, **DO NOT** let tools or background tasks silently attempt slow downloads that may stall or timeout.
- **ALWAYS** provide the direct download URL(s) to the user so they can download it directly using a browser or download manager (e.g. IDM), specify the filename, and provide instructions on where to place it.

## 6. RTL Text & Number/Symbol Formatting Rules
- **Special Care for Signs & Symbols in RTL**: In Right-to-Left (RTL) contexts (Persian/Arabic), numbers with adjacent symbols like `+`, `-`, `%`, `$`, or equations (`+2`, `-1`, `50%`, `14 + 2 = 16`) can suffer from Unicode BiDi reordering bugs (e.g., `+2` displaying as `2+` or equations reversing order).
- **Enforce LTR Containers / LRM for Math & Metrics**: Always wrap numbers, signed modifiers, equations, formulas, and metric breakdowns in an explicit LTR container (e.g. `Directionality(textDirection: TextDirection.ltr, child: ...)` in Flutter) or prepend the Unicode Left-to-Right Mark (`\u200E`) so that symbols and signs stay in their proper, readable positions.

## 7. Database Integrity & No In-Code Fallbacks
- **No Hardcoded/Fallback Data for Database Entities**: If an entity, field, or collection exists in the database or is designed to exist in the database (e.g., knowledge components, diagnostic questions, misconceptions, learner profiles, session logs), **NEVER** write fallback or hardcoded mock/dummy data for it inside application code or repository layers.
- If data is missing or empty in the database, return empty collections or let the UI handle empty states cleanly. Data must always originate from the database/API, never from in-code fallbacks.

## 8. 100% Free and Open-Source Constraint (Zero Paid External Services)
- **Strict FOSS Compliance**: NEVER propose, require, or integrate paid commercial cloud APIs (OpenAI, Claude API, Pinecone, etc.). All tools, models, OCR pipelines, and dependencies must be 100% Free and Open-Source (FOSS) and capable of running locally or on-premise.


## 9. Dynamic Market & Ecosystem Grounding Rule (Mandatory Live Search)
- **Mandatory Web Search for Fast-Moving Technical Facts**: Whenever dealing with model releases, open-weights (SLMs/LLMs/VLMs), benchmarks, GPU/hardware specs and pricing, library/framework versions, or external tooling ecosystems, **NEVER** rely on pre-training cutoff memory or stale static knowledge.
- **Mandatory Real-Time Verification**: ALWAYS perform web searches before listing, recommending, or making architectural decisions regarding AI models, active benchmarks (e.g., Open Persian LLM Leaderboard, LMSYS, Hugging Face leaderboards), or dependencies. Stale recommendations are considered an engineering defect.

## 10. Zero Tech Stack Leaks in UI (Purely Pedagogical Language)
- **No Technical Jargon in User-Facing UI**: NEVER expose, mention, or display technical stack details, software names, libraries, internal engine acronyms, or model identifiers in the user interface (e.g. BKT, Next.js, React, Prisma, PostgreSQL, Vercel, Python, SymPy, Gemini, AI, LLM, KaTeX, open-source/FOSS, or internal database IDs like `ITEM-001`).
- **Student- & Teacher-Centric Pedagogical Language**: All UI labels, badges, page titles, cards, tooltips, footers, and feedback messages must speak strictly in age-appropriate, encouraging, and pedagogically clear language (e.g., "میزان تسلط بر مفاهیم" instead of "ردیابی شناختی بیزی (BKT)", "ارزیابی هوشمند" instead of "موتور BKT فعال", etc.).

