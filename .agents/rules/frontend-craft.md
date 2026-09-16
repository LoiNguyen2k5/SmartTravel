# Frontend Design & Craftsmanship Rules (Impeccable Standards)

When writing, modifying, or reviewing any frontend code (HTML, CSS, React/TSX, Vue, etc.), strictly follow these craftsmanship guidelines:

## 1. Eliminate Generic AI Tropes ("AI Slop")
- **No Default Inter / Roboto everywhere**: Choose deliberate, characterful typography tailored to the brand domain (editorial serif, geometric humanist sans, mono accents).
- **No Purple-to-Blue Cliché Gradients**: Use refined, cohesive palettes with tailored HSL/OKLCH color ramps and subtle luminous accents.
- **No Card Obsession**: Do not wrap every feature or list item inside border-boxed cards. Prefer typography hierarchy, generous whitespace, subtle dividers, and surface tone shifts.
- **No Nested Cards**: Never put a card inside another card.
- **No Meaningless Eyebrows**: Avoid useless pill badges like `[ FEATURE ]` or `[ OVERVIEW ]` right above headers unless serving a strict navigation purpose.

## 2. Color & Atmosphere
- **Never Dead Grays**: Never use pure neutral `#808080`, `#333333`, or `#000000`. Always tint grays with a subtle bias from the primary hue or canvas warmth.
- **Tinted Secondary Text**: On colored or dark backgrounds, secondary text must be tinted with the background hue rather than rendered as washed-out gray.
- **Natural Depth**: Use soft, multi-layered shadows with directional Y-offset (`box-shadow: 0 4px 20px -2px rgba(..., 0.08)`). Avoid zero-offset colored blur halos.

## 3. Typography & Spacing
- **Measure**: Keep body text reading width comfortable at 60–75 characters (`max-w-prose` or `max-width: 65ch`).
- **Hierarchy Steps**: Maintain distinct optical scale and font-weight jumps between H1, H2, H3, and body text.
- **Asymmetric Spacing**: Always provide significantly more whitespace *above* a section heading than *below* it to ensure strong visual grouping with its subsequent content.

## 4. Motion & Micro-interactions
- **Exponential Ease-Out**: Use natural decelerating curves (e.g. `cubic-bezier(0.16, 1, 0.3, 1)`). Never use spring bounce or elastic overshoot.
- **Purposeful Transitions**: Transitions should clarify state changes (hover, press, expanded, dialogs). Limit durations to 150ms–300ms.
- **Respect Reduced Motion**: Always respect `@media (prefers-reduced-motion: reduce)`.

## 5. Completeness & Edge Cases
- **Full States**: Every interactive element must have distinct `:hover`, `:focus-visible`, `:active`, and `[disabled]` styling.
- **Zero Raw Defaults**: Style `:focus-visible` rings with custom brand outlines. Theme `::selection` and custom scrollbars when appropriate.
- **Robust Overflow**: Anticipate long strings, multilingual text (i18n), and mobile viewport constraints with proper ellipsis or wrapping rules.
