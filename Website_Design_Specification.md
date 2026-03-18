# AI Commercialization Infrastructure — Website Design Specification

## For: Claude Code HTML Build

This document is a complete visual design specification for building a single-page scrolling website (with internal anchor navigation) in HTML/CSS/JS. The design language draws from QuantumBlack (McKinsey's AI practice), Palantir, and premium dark-theme enterprise sites. It should feel institutional, not startup. Authoritative, not flashy.

---

## DESIGN PHILOSOPHY

**One sentence:** A dark, minimal, high-contrast site that communicates category authority through restraint — not through animation excess or visual noise.

**Key principles:**
- Dark backgrounds with surgical use of a single accent color (teal)
- Typography does the heavy lifting — large, confident headlines with generous whitespace
- Data and structure over decoration — no stock photos, no gradients, no glassmorphism
- Every element earns its place — if it doesn't communicate, remove it
- Scroll-triggered reveals, not constant animation — motion is earned, not ambient

**What this is NOT:**
- Not a SaaS landing page (no floating dashboards, no "try free" energy)
- Not a startup studio site (no playful colors, no illustration)
- Not a digital agency portfolio (no case study carousels, no video backgrounds)
- Not Accenture/Deloitte (no stock photography of people shaking hands)

---

## GLOBAL DESIGN SYSTEM

### Color Palette

```
--bg-primary:       #0A0A0A     /* Near-black. Main page background */
--bg-secondary:     #111111     /* Slightly lighter. Alternate section backgrounds */
--bg-card:          #161616     /* Card/panel backgrounds */
--bg-elevated:      #1C1C1C     /* Hover states, elevated surfaces */
--bg-footer:        #080808     /* Footer background */

--text-primary:     #F2F2F2     /* Headlines, primary body text */
--text-secondary:   #A0A0A0     /* Body copy, descriptions */
--text-muted:       #555555     /* Captions, labels, metadata */
--text-on-teal:     #0A0A0A     /* Text on teal backgrounds */

--accent-teal:      #1F8A8A     /* Primary accent — section labels, accents */
--accent-bright:    #28B5B5     /* Hover states, highlighted text, CTAs */
--accent-dark:      #164D4D     /* Teal at low intensity — borders, subtle fills */

--divider:          #222222     /* Section dividers, card borders */
--divider-light:    #2A2A2A     /* Lighter dividers */

--amber:            #D4A017     /* Secondary accent — sparingly, for warning/regulation */
--red:              #C0392B     /* Tertiary accent — sparingly, for risk/geopolitical */
```

### Typography

```
--font-heading:     'Inter', sans-serif
--font-body:        'Inter', sans-serif
--font-mono:        'JetBrains Mono', monospace   /* For code-like elements, PCI formula */

/* Alternative if Inter is not available: */
/* 'Helvetica Neue', 'Arial', sans-serif */
```

**Type Scale:**

| Element | Size (desktop) | Weight | Line Height | Letter Spacing | Color |
|---------|---------------|--------|-------------|----------------|-------|
| Hero headline | 72px → 80px | 700 | 1.05 | -0.02em | --text-primary |
| Hero subheadline | 20px | 400 | 1.6 | 0 | --text-secondary |
| Section headline | 44px → 48px | 700 | 1.15 | -0.015em | --text-primary |
| Section subheadline | 18px | 400 | 1.6 | 0 | --text-secondary |
| Section label | 12px | 700 | 1.0 | 0.15em | --accent-teal |
| Card title | 20px → 22px | 600 | 1.3 | -0.01em | --text-primary |
| Body text | 16px | 400 | 1.7 | 0 | --text-secondary |
| Small body / caption | 14px | 400 | 1.6 | 0 | --text-muted |
| Stat number (large) | 56px → 64px | 700 | 1.0 | -0.02em | --text-primary |
| Stat number (medium) | 36px → 40px | 700 | 1.0 | -0.02em | --text-primary |
| Nav links | 14px | 500 | 1.0 | 0.05em | --text-secondary |
| Button text | 14px | 600 | 1.0 | 0.05em | varies |

### Spacing System

Use an 8px base grid. All spacing is multiples of 8.

```
--space-xs:   8px
--space-sm:   16px
--space-md:   24px
--space-lg:   32px
--space-xl:   48px
--space-2xl:  64px
--space-3xl:  96px
--space-4xl:  128px
--space-5xl:  160px
```

**Section vertical padding:** 120px–160px top and bottom (--space-4xl to --space-5xl)
**Content max-width:** 1200px, centered
**Side padding (desktop):** 64px minimum from viewport edge
**Side padding (mobile):** 24px

### Grid System

12-column grid at 1200px max-width. Gutter: 24px.

Common layouts:
- Full width: 12 cols
- Two-column split: 5 + 7 or 6 + 6
- Three-column: 4 + 4 + 4
- Four-column: 3 + 3 + 3 + 3
- Narrow content: 8 cols centered

---

## NAVIGATION

### Desktop (sticky top)

**Background:** transparent on load, transitions to `rgba(10, 10, 10, 0.95)` with `backdrop-filter: blur(12px)` on scroll.

**Height:** 72px

**Layout:**
```
[Logo/Wordmark]                                    [Nav Links]  [CTA Button]
```

**Logo:** "AI Commercialization Infrastructure" as a wordmark in Inter 600, 15px, --text-primary. No icon. If too long, abbreviate to "ACI" with a small teal dot after it.

**Nav links:** Home | The Model | Capabilities | Ventures | Sectors | Team | Contact
- Style: 14px, Inter 500, --text-secondary
- Hover: --text-primary, with a 2px teal underline that slides in from left (transition 0.3s ease)
- Active section: --text-primary + teal underline visible

**CTA button (nav):** "Book a session"
- Style: Outlined — 1px border --accent-teal, text --accent-bright, 14px Inter 600
- Padding: 10px 24px
- Border-radius: 0 (sharp corners — consulting, not SaaS)
- Hover: fill --accent-teal, text --text-on-teal, transition 0.3s ease

### Mobile

Hamburger menu, right-aligned. Menu opens as full-screen overlay:
- Background: --bg-primary at 98% opacity with blur
- Links stacked vertically, 24px font, 48px spacing
- CTA button at bottom of menu, full-width

---

## SECTION-BY-SECTION DESIGN

---

### SECTION 1: HERO

**Height:** 100vh (full viewport)

**Background:** --bg-primary

**Visual element:** A subtle grid/mesh pattern in the background — very low opacity (3-5%). Think Palantir's geometric backgrounds. Use CSS: a repeating grid of thin lines (1px, rgba(255,255,255,0.03)) at 60px intervals creating a perspective grid effect. The grid should have a slight fade — more visible in the center, fading to edges.

**Layout:**
```
                    [centered content block, max-width 800px]

                    SECTION LABEL (teal, uppercase, tracked)
                    ─── (short teal line, 48px wide, 2px)

                    HEADLINE (72-80px, bold, white)
                    2-3 lines max

                    SUBHEADLINE (20px, secondary text)
                    2 lines max

                    [CTA Button Primary]    [CTA Button Secondary]
```

**Section label:** "AI COMMERCIALIZATION INFRASTRUCTURE" — 12px, Inter 700, --accent-teal, letter-spacing 0.15em, uppercase

**Headline:**
```
The operating architecture
that converts AI investment
into defensible revenue.
```
(Each line on its own line. Let the natural line breaks create rhythm.)

**Subheadline:**
"Operating model design, production conversion systems, and sovereign deployment architecture for enterprises where AI must work — not just exist."

**Primary CTA:** "Book a working session"
- Solid teal fill: --accent-teal
- Text: --text-on-teal (dark), 14px Inter 600
- Padding: 14px 32px
- Sharp corners (border-radius: 0)
- Hover: --accent-bright, slight translateY(-1px), box-shadow 0 4px 20px rgba(31,138,138,0.3)

**Secondary CTA:** "See the model →"
- No background, no border
- Text: --text-secondary, 14px Inter 500
- Hover: --accent-bright, arrow shifts right 4px (transition 0.3s)

**Scroll indicator:** A thin teal line (1px) animating downward at the bottom-center of the viewport, pulsing subtly. Or a small "↓" chevron.

**Animation on load:**
- Section label fades in + slides up 20px (0.6s ease, 0.2s delay)
- Headline fades in + slides up 20px (0.6s ease, 0.4s delay)
- Subheadline fades in + slides up 20px (0.6s ease, 0.6s delay)
- CTAs fade in (0.6s ease, 0.8s delay)
- Grid background fades in over 2s

---

### SECTION 2: THE PROBLEM IN NUMBERS

**Background:** --bg-secondary (#111111) — creates visual separation from hero

**Section label:** "THE MARKET REALITY" — teal, uppercase, tracked, with 2px teal line beneath (48px wide)

**Headline:** "AI investment is accelerating. Value creation is not."
- 44px, Inter 700, --text-primary

**Subheadline:** "The market does not have an AI capability problem. It has a conversion problem."
- 18px, Inter 400, --text-secondary

**Stats row:** Three stat blocks in a row (3-col grid on desktop, stacked on mobile)

Each stat block:
```
┌─────────────────────────────┐
│                             │
│   $660B                     │  ← 56px, Inter 700, white
│   ──── (teal line, 32px)    │
│   combined AI CapEx by      │  ← 14px, Inter 400, --text-secondary
│   tech giants in a single   │
│   quarter                   │
│                             │
└─────────────────────────────┘
```

- No visible card border. Just generous padding (48px).
- Between each stat: a thin vertical divider line (1px, --divider) on desktop. Hidden on mobile.
- The teal line beneath each number: 32px wide, 2px thick, --accent-teal
- Stat numbers: $660B, 74%, <0.20

**Scroll animation:** Each stat block fades in + slides up 30px, staggered by 0.15s. Numbers count up from 0 to final value over 1.5s (use easeOutExpo curve). This is the ONE place where count-up animation is appropriate.

---

### SECTION 3: WHAT WE DO (Category Definition)

**Background:** --bg-primary

**Layout:** Two columns (5 + 7 grid split)

**Left column:**
- Section label: "WHAT WE DO" (teal, uppercase, tracked)
- Headline: "We build the layer between AI activity and measurable economic value."
  - 44px, Inter 700, --text-primary
- Body text (2 short paragraphs):
  - 16px, Inter 400, --text-secondary, max-width 480px

**Right column:**
- The four-part architecture diagram.
- Build this as an SVG or CSS-drawn diagram:

```
        ┌───────────────────┐
        │   Monetization    │
        │   Architecture    │
        └────────┬──────────┘
                 │
    ┌────────────┼────────────┐
    │            │            │
    │   ┌───────────────┐    │
    │   │  AI-Native    │    │
    │   │  Operating    │────┤
    │   │  Model        │    │
    │   └───────────────┘    │
    │            │            │
    └────────────┼────────────┘
                 │
┌────────────────┼───────────────────┐
│                │                   │
│  Production    │    Sovereign      │
│  Conversion    │    Deployment     │
│  System        │    Architecture   │
└────────────────┴───────────────────┘
```

- Boxes: --bg-card background, 1px --accent-dark border
- Text inside boxes: 14px Inter 600, --text-primary
- Connecting lines: 1px --accent-teal
- Corner accents: small teal squares (4px) at connection points
- The center box (AI-Native Operating Model) is slightly larger and has a subtle teal glow/border

**Scroll animation:** Left column content fades in first. Diagram elements draw in sequentially (lines extend, boxes fade in, center box last with subtle pulse).

---

### SECTION 4: FOUR CAPABILITY PILLARS

**Background:** --bg-secondary

**Section label:** "THE ARCHITECTURE"

**Headline:** "Four systems. One infrastructure."
- 44px, Inter 700

**Four cards in a row (4-col grid, 2x2 on tablet, stacked on mobile)**

Each card:
```
┌──────────────────────────────────────┐
│ ── (teal top accent line, 2px)       │
│                                      │
│  01                                  │  ← 14px, Inter 700, --accent-teal
│                                      │
│  Commercialization                   │  ← 20px, Inter 600, --text-primary
│  Architecture                        │
│                                      │
│  Value capture, monetization logic,  │  ← 14px, Inter 400, --text-secondary
│  and commercial conversion design    │
│  for AI-driven capability.           │
│                                      │
│  Learn more →                        │  ← 13px, Inter 500, --accent-bright
│                                      │
└──────────────────────────────────────┘
```

- Card background: --bg-card
- Border: 1px --divider (subtle, not prominent)
- Top accent: 2px line, full width of card, --accent-teal for card 1+2, --accent-teal for card 3, --accent-teal for card 4. (All teal — keep consistent, unlike the deck's multi-color forces)
- Padding: 32px
- Border-radius: 0 (sharp corners)
- Number: "01", "02", "03", "04"

**Hover behavior:**
- Background shifts to --bg-elevated
- Top accent line thickens to 3px
- "Learn more →" text shifts right 6px
- Subtle box-shadow: 0 8px 32px rgba(0,0,0,0.3)
- Transition: all 0.3s ease

**Scroll animation:** Cards fade in + slide up 40px, staggered 0.1s each (left to right).

---

### SECTION 5: WHY FIRMS FAIL

**Background:** --bg-primary

**Section label:** "WHY CONVERSION STAYS LOW"

**Headline:** "AI failure is not hypothetical. It is already showing up in losses, liability, and stalled conversion."

**Layout:** Three content blocks, stacked vertically (NOT cards — editorial style, like a McKinsey report)

Each block:
```
──────────────────── (full-width divider, 1px --divider)

THE FINANCIAL EXPOSURE IS ALREADY REAL            ← 12px label, --accent-teal, uppercase
                                                     tracked, with teal left accent pipe

99% of organizations reported AI-related          ← 16px body, --text-secondary
financial losses. The average annual loss per
firm is $4.4M. This is not a future risk —
it is a current operating condition.
```

- Left accent pipe: 3px wide, 20px tall, --accent-teal, positioned left of the label
- Body text: max-width 720px
- Spacing between blocks: 48px
- The stat numbers within text ("99%", "$4.4M") should be styled: --text-primary, Inter 600 (bold, white — standing out from the gray body text)

**Scroll animation:** Each block fades in as it enters viewport. Minimal — just opacity 0→1 + translateY 20px→0.

---

### SECTION 6: SIGNATURE FRAMEWORKS

**Background:** --bg-secondary

**Section label:** "HOW WE MEASURE IT"

**Headline:** "Proprietary diagnostic and conversion systems."

**Three framework cards (3-col grid, stacked on mobile)**

Each framework card is MORE substantial than the capability cards. They need to feel like real tools, not marketing bullets.

**PCI Card (primary — larger or featured):**
```
┌──────────────────────────────────────────────────┐
│                                                  │
│  PRODUCTION CONVERSION INDEX (PCI)               │  ← 12px label, teal, tracked
│                                                  │
│  PCI = Shipped ÷ Started                         │  ← 18px, JetBrains Mono, --text-primary
│                                                  │
│  A single ratio that shows how much of your AI   │  ← 14px, --text-secondary
│  investment is actually reaching revenue-bearing  │
│  production.                                     │
│                                                  │
│  ┌──────┐  ┌──────────┐  ┌──────────────────┐   │
│  │<0.20 │  │0.20-0.50 │  │     >0.50        │   │
│  │Pilot │  │Selective  │  │ Operationalized  │   │
│  │      │  │Deployment │  │ Production       │   │
│  └──────┘  └──────────┘  └──────────────────┘   │
│   red         amber          teal                │
│                                                  │
└──────────────────────────────────────────────────┘
```

- The three maturity zones: small horizontal band inside the card
  - Pilot Theatre: thin bar with red (#C0392B) top accent
  - Selective Deployment: thin bar with amber (#D4A017) top accent
  - Operationalized Production: thin bar with teal top accent
- Formula line: use JetBrains Mono font, monospace feel

**Other two cards (Exposure Assessment, Aegir):**
Same card treatment but without the maturity band. Instead:
- A subtle icon or number
- Title
- 2-line description
- "Learn more →" link

**Scroll animation:** Cards scale from 0.97 to 1.0 + fade in. Staggered.

---

### SECTION 7: SECTORS

**Background:** --bg-primary

**Section label:** "WHERE WE WORK"

**Headline:** "Sector-specific architecture for environments where AI deployment is non-trivial."

**Five sector tiles in a horizontal scrolling row on mobile, 5-col grid on desktop:**

Each tile:
```
┌─────────────────────────────┐
│                             │
│  Defence &                  │  ← 16px, Inter 600, --text-primary
│  Sovereign Systems          │
│                             │
│  Capability conversion,     │  ← 13px, Inter 400, --text-muted
│  sovereign industrialization│
│                             │
│  ── (teal bottom line, 24px)│
│                             │
└─────────────────────────────┘
```

- Background: transparent (no card background)
- Bottom accent line: 2px, 24px wide, --accent-teal — visible on hover, hidden by default
- Hover: text brightens to --text-primary, bottom accent line extends to full width (transition 0.4s ease)
- Dividers between tiles: 1px vertical --divider

**Scroll animation:** Tiles slide in from right, staggered.

---

### SECTION 8: TEAM

**Background:** --bg-secondary

**Section label:** "LEADERSHIP"

**Headline:** "Principal-led. Every engagement designed and delivered by the team that built the category."

**Three team cards (3-col grid, stacked on mobile)**

Each card:
```
┌──────────────────────────────────────┐
│                                      │
│         ┌──────────────┐             │
│         │              │             │
│         │  [PHOTO]     │             │  ← Square, grayscale by default
│         │  200x200     │             │     Color on hover
│         │              │             │
│         └──────────────┘             │
│                                      │
│         Saad Qazi                    │  ← 20px, Inter 600, --text-primary
│         Founder & Principal          │  ← 14px, Inter 400, --accent-teal
│                                      │
│         AI commercialization         │  ← 14px, Inter 400, --text-secondary
│         architecture. Operating      │
│         model design for regulated   │
│         and sovereign environments.  │
│                                      │
│         [LinkedIn icon]              │  ← 16px, --text-muted, hover: --accent-bright
│                                      │
└──────────────────────────────────────┘
```

- Photo: Square crop, 200x200px. **Grayscale filter by default.** On hover: color fades in (transition 0.5s). This is a QuantumBlack signature move.
- Card: No visible border or background. Just the content.
- Photo border: none. Or optionally a very subtle 1px --divider border.
- Alignment: center-aligned within each card.

**If photos are not available yet:** Use solid --bg-card squares with the person's initials in 48px Inter 700 --accent-dark, centered.

---

### SECTION 9: ENGAGEMENT MODELS

**Background:** --bg-primary

**Section label:** "HOW WE ENGAGE"

**Headline:** "From diagnostic to embedded architecture."

**Four engagement types as a horizontal progression:**

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│             │    │             │    │             │    │             │
│  Diagnostic │───▶│  Operating  │───▶│  Architecture│───▶│  Fractional │
│  Working    │    │  Model      │    │  Design     │    │  Embedded   │
│  Session    │    │  Reset      │    │             │    │  Advisory   │
│             │    │             │    │             │    │             │
│  1-2 days   │    │  4-8 weeks  │    │  8-16 weeks │    │  Ongoing    │
│             │    │             │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

- Cards connected by thin lines with arrow indicators (→)
- The line between cards: 1px --divider, with a small teal arrow/chevron at the midpoint
- Each card: --bg-card background, no border
- Duration tag: small pill at bottom of card — --bg-elevated background, 12px Inter 500, --text-muted
- Hover: top accent line appears (2px teal), background shifts to --bg-elevated

**On mobile:** Stack vertically with connecting line on the left side (timeline-style).

---

### SECTION 10: FINAL CTA

**Background:** Full-width dark band, --bg-card, with a very subtle teal gradient at the top edge (2px, --accent-dark → transparent)

**Layout:** Centered, max-width 640px

**Headline:** "If AI is active in your business but not yet converting into durable value, the missing layer is usually not more tooling."
- 28px, Inter 700, --text-primary

**Subheadline:** "It is operating architecture."
- 28px, Inter 700, --accent-bright (teal — the teal on this one line creates emphasis)

**CTA button:** "Schedule a working session"
- Same style as hero primary CTA (solid teal)
- Centered

**Secondary:** "contact@[domain].com" — small, --text-muted, below the button

**Scroll animation:** Text fades in. Button fades in with 0.3s delay.

---

## FOOTER

**Background:** --bg-footer (#080808)

**Height:** Compact — not a mega-footer. ~200px.

**Layout:**
```
Left:                                              Right:
AI Commercialization Infrastructure                Home
© 2026. All rights reserved.                       The Model
                                                   Capabilities
                                                   Ventures
                                                   Sectors
                                                   Contact

─────────────────────────────────────────────────────────
Built by [name] — London / [City]                  [LinkedIn]
```

- Text: 13px, Inter 400, --text-muted
- Links: hover to --text-secondary
- Divider: 1px --divider
- Bottom row: very small, 12px

---

## GLOBAL INTERACTION PATTERNS

### Scroll Animations (Intersection Observer)

Every section uses scroll-triggered animations. The pattern is consistent:

**Default (before visible):**
```css
opacity: 0;
transform: translateY(30px);
```

**Visible (when entering viewport):**
```css
opacity: 1;
transform: translateY(0);
transition: opacity 0.6s ease, transform 0.6s ease;
```

**Stagger rule:** When multiple elements animate in a group (cards, stats), each subsequent element gets +0.1s delay.

**Trigger point:** Element enters viewport at 20% from bottom.

### Hover Effects

**Links:** Color transition 0.2s, underline slides in from left 0.3s
**Cards:** Background color transition 0.3s, subtle shadow transition 0.3s
**Buttons:** Background + shadow transition 0.3s, translateY(-1px) on hover
**Images/photos:** Grayscale to color 0.5s

### Cursor

Default cursor. No custom cursors.

### Page Transitions

None. Single page, no route changes. Smooth scroll to sections on nav click.

```css
html { scroll-behavior: smooth; }
```

### Active Section Highlighting

As the user scrolls, the nav link for the current section gets:
- Color: --text-primary
- Teal underline (2px)
- Use Intersection Observer to update

---

## RESPONSIVE BREAKPOINTS

```css
/* Desktop */
@media (min-width: 1200px) { /* Default styles */ }

/* Tablet */
@media (max-width: 1199px) and (min-width: 768px) {
  /* 2-col grids where 4-col on desktop */
  /* Reduce section padding to 80px */
  /* Reduce headline sizes by ~15% */
}

/* Mobile */
@media (max-width: 767px) {
  /* Single column everything */
  /* Hamburger menu */
  /* Section padding: 64px top/bottom */
  /* Hero headline: 40px */
  /* Section headline: 28px */
  /* Stack all cards vertically */
  /* Horizontal scroll for sector tiles */
}
```

---

## SVG / VISUAL ASSETS TO BUILD

These should be built as inline SVG or CSS — no image files needed:

1. **Architecture diagram** (Section 3) — Four connected boxes with lines
2. **PCI maturity band** (Section 6) — Three colored segments
3. **Engagement progression arrows** (Section 9) — Connecting line with chevrons
4. **Background grid** (Hero) — CSS repeating linear gradient
5. **Teal accent pipes** — CSS pseudo-elements (::before on section labels)

---

## FONTS TO LOAD

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

---

## SPECIFIC CSS PATTERNS

### Section Label Pattern
```css
.section-label {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--accent-teal);
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}
.section-label::before {
  content: '';
  width: 3px;
  height: 18px;
  background: var(--accent-teal);
  display: inline-block;
}
```

### Card Pattern
```css
.card {
  background: var(--bg-card);
  border: 1px solid var(--divider);
  padding: 32px;
  position: relative;
  transition: background 0.3s ease, box-shadow 0.3s ease;
}
.card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: var(--accent-teal);
}
.card:hover {
  background: var(--bg-elevated);
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
}
```

### Stat Number Count-Up Animation
```css
.stat-number {
  font-size: 56px;
  font-weight: 700;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
}
```
Use a lightweight JS counter that animates from 0 to target over 1.5s with easeOutExpo.

### Scroll Reveal
```css
.reveal {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}
```

---

## PERFORMANCE NOTES

- No external images required. All visuals are CSS/SVG.
- Total page weight should be under 500KB (fonts are the heaviest asset).
- Lazy-load nothing — the page is light enough to load everything.
- Use `will-change: transform, opacity` on animated elements for GPU acceleration.
- Preload Inter font for fastest text rendering.

---

## CONTENT REFERENCE

For all section copy, headlines, and body text, refer to the companion document: `Website_Structure_and_Content.md` in the same folder. The content document has the exact text for every section. This design document specifies how that content should be presented visually.

---

## SUMMARY: THE 10-SECOND TEST

When someone lands on this site, in 10 seconds they should understand:
1. **What the category is** — AI Commercialization Infrastructure (hero headline)
2. **What the problem is** — AI investment is not converting to value (stat section)
3. **What these people do about it** — Build the operating architecture layer (category definition)

Everything after that — capabilities, frameworks, sectors, team, engagement models — is depth for people who are already interested. The first three sections close the sale on attention. The rest closes the sale on credibility and conversion.
