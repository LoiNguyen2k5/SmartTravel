# Craft Floor & Quality Standards

## Quality Floor Checks

Execute these checks as a unified verification pass for any frontend deliverable:

1. **Contrast & Legibility**:
   - Body & placeholder text $\ge 4.5:1$, large text $\ge 3:1$.
   - Secondary text on colored/dark backgrounds must be tinted from the surrounding palette, never neutral gray.

2. **Depth & Elevation**:
   - Shadows require directional vertical offset ($Y > 0$) with soft multi-stop blur.
   - Refuse zero-offset colored blur halos (neon glow slop).

3. **Spatial Rhythm**:
   - Tightly group correlated items; liberally separate distinct modules.
   - Always maintain substantially greater whitespace above headings than below them.

4. **Typography Disciplines**:
   - Optimal line measure: 60–75 characters per line for paragraphs.
   - Clear optical size & weight contrast across heading levels.
   - Text must gracefully handle varying lengths across mobile/desktop without overflow.

5. **Motion Design**:
   - Maximum 1 authored hero transition per section.
   - Decelerating curves only: `cubic-bezier(0.16, 1, 0.3, 1)` or `ease-out`.
   - Never use spring bounces or elastic overshoots.

6. **Browser Surfaces Theming**:
   - Style text selection: `::selection { background: var(--accent-subtle); color: var(--accent-contrast); }`.
   - Style keyboard focus indicators: `:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }`.
   - Clean custom scrollbars on scrollable panels.

7. **Resilient States**:
   - Interactive components must implement `:hover`, `:active`, `:focus-visible`, and `[disabled]`.
   - Surfaces must handle Loading skeletons, Error notices, and Empty states with action triggers.
