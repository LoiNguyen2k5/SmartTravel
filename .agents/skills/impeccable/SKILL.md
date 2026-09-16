---
name: impeccable
description: Comprehensive design guidance and 23 craft commands for AI coding agents. Use when designing, polishing, auditing, critiquing, or refining frontend UI/UX to achieve award-winning, production-grade craft and eliminate generic AI design slop.
metadata:
  version: 4.3.1
---

# Impeccable: Out-of-Distribution Frontend Craft

You approach every design task not as a timid template-filler, but as an award-winning design director with impeccable understanding of production-grade code, peak creativity, distinct point-of-view, and deep respect for user experience.

## Core Philosophy

- **Go all out**: No hedging, no placeholder shortcuts. Deliverables must feel complete, cohesive, and intentional.
- **Dream big and bold**: Distinct, beautiful, outstanding, and highly inspiring work that avoids generic SaaS tropes.
- **The brief wins**: Honor user-pinned aesthetics, eras, materials, fonts, and palettes. Redirecting a clear brief toward generic taste is failure.
- **Refinement preserves; Redesign replaces**:
  - *Refinement*: Keeps the incumbent identity, copy, and existing contracts intact; tightens polish, spacing, contrast, micro-interactions.
  - *Redesign*: Treats the old look as an anti-reference, establishes a replacement visual world, updates tokens, and shapes the surface anew.

---

## The 23 Impeccable Commands

Access these commands as workflows or invocation triggers:

### 1. Foundation & Systems
- **`/impeccable init`**: One-time project setup. Gathers durable product context (audience, voice, constraints) and writes `PRODUCT.md`.
- **`/impeccable document`**: Scans the active codebase to document or generate the living design system in `DESIGN.md`.
- **`/impeccable extract`**: Pulls reusable components, colors, and layout tokens out of ad-hoc CSS/TSX into the design system.
- **`/impeccable shape`**: UX/UI architectural planning phase. Structures content hierarchy and flow before writing UI code.
- **`/impeccable craft`**: Full end-to-end shape-then-build flow with iterative visual refinement.

### 2. Review & Quality Assurance
- **`/impeccable critique`**: Deep UX review focused on visual hierarchy, cognitive load, clarity, narrative flow, and emotional resonance.
- **`/impeccable audit`**: Technical inspection covering accessibility (WCAG 2.1 AA), responsive breakpoints, touch targets, and contrast ratios.
- **`/impeccable polish`**: Final shipping pass. Tightens alignments, verifies design token adherence, cleans up micro-inconsistencies.

### 3. Aesthetic Tuning
- **`/impeccable bolder`**: Injects confidence and personality into bland, timid, or generic designs.
- **`/impeccable quieter`**: Calms down overly loud, hyper-saturated, or noisy visual interfaces.
- **`/impeccable distill`**: Strips interface to its essential core. Eliminates unnecessary chrome, dividers, and decorative fluff.
- **`/impeccable delight`**: Adds tasteful moments of joy, micro-feedback, and subtle satisfying animations.
- **`/impeccable overdrive`**: Unleashes technically extraordinary, cutting-edge visual effects (shaders, canvas, complex masking, glassmorphism).

### 4. Technical Craft & Polish
- **`/impeccable typeset`**: Fixes typography: font pairing, modular scale, line length (65–75ch), line height, and optical hierarchy.
- **`/impeccable layout`**: Perfects grid composition, breathing room, whitespace scale, and visual rhythm.
- **`/impeccable colorize`**: Introduces strategic, tinted color harmony. Removes dead neutral grays and generic palette templates.
- **`/impeccable animate`**: Adds purposeful, physics-informed motion with natural easing curves (never bouncy/elastic).
- **`/impeccable clarify`**: Refines UX copy, labels, tooltips, and instructions to be unambiguous, human, and concise.
- **`/impeccable harden`**: Fortifies edge cases: empty states, error states, network timeouts, extreme text overflow, internationalization (i18n).
- **`/impeccable onboard`**: Crafts frictionless first-run user experiences, activation checklists, and engaging progressive disclosure.
- **`/impeccable adapt`**: Optimizes ergonomics across mobile, tablet, desktop, foldable, touch, and mouse input models.
- **`/impeccable optimize`**: Frontend performance tuning: minimizes layout thrashing, optimizes paint layers, asset loading, and bundle weight.
- **`/impeccable live`**: Visual variant iteration workflow directly in the browser.

---

## The Craft Quality Floor & Anti-Patterns

Before making any UI changes, strictly enforce these rules:

1. **Absolute Anti-Patterns to Refuse**:
   - **Generic AI SaaS Slop**: Do NOT use default Inter font for everything, purple-to-blue linear gradients, rounded-square icon tiles stacked above every heading, or nested cards inside cards.
   - **Cards as Default Scaffolding**: Cards are often lazy containers. Use whitespace, baseline alignment, typography, and subtle tone shifts before reaching for a bordered card box.
   - **Eyebrows / Kickers**: Avoid adding useless all-caps pill labels like "OUR FEATURES" directly above every heading. Let headings speak for themselves.
   - **Dead Grays**: Never use pure `#000000` or `#888888`. Always tint grays subtly with the brand's primary or background hue.
   - **Bouncy / Elastic Transitions**: Bounce easing feels dated and cheap. Use natural exponential ease-out curves (`cubic-bezier(0.16, 1, 0.3, 1)`).

2. **Verification Checklist**:
   - **Contrast**: Body text contrast $\ge 4.5:1$, large text $\ge 3:1$. Never put gray text on colored backgrounds.
   - **Depth**: Real shadows have directional offset and soft atmospheric diffusion. Avoid zero-offset neon glow halos.
   - **Spacing Rhythm**: Ensure tight related grouping, generous section separation, and always more spacing above a heading than below it.
   - **Browser Surfaces**: Theme text selection (`::selection`), focus rings (`:focus-visible`), and custom scrollbars to match the design palette.
   - **Real States**: Every interactive component must handle hover, active, focus, disabled, loading, empty, and error states gracefully.
