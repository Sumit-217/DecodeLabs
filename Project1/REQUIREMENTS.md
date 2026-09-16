# DecodeLabs Project 1 - Mandatory Requirements & Specifications

> **Program**: DecodeLabs Industrial Training Kit (Batch 2026)  
> **Track**: Full Stack Development — Project 1: Responsive Frontend Interface  
> **Status**: Compulsory Qualification Landmark (Required to unlock subsequent program milestones)

---

## 🛑 1. Non-Negotiable Technical Constraints

These technical constraints are **strict requirements** specified by the DecodeLabs architecture standard and **cannot be modified or substituted**:

| Category | Mandate & Strict Constraint |
| :--- | :--- |
| **Technology Stack** | Pure **HTML5**, **CSS3**, and **Vanilla JavaScript (ES6+)**. <br>**STRICT RULE**: Absolute zero frameworks allowed (No TailwindCSS, Bootstrap, React, Vue, Angular, jQuery, etc.). |
| **Responsive Strategy** | **Mobile-First Paradigm**: <br>1. Base styles must target mobile viewports single-column first. <br>2. Media queries MUST use `min-width` scaling (`min-width: 768px` for Tablet, `min-width: 1024px` for Desktop). <br>3. Fluid typography using CSS `clamp()`. |
| **Layout Architecture** | **Macro Layout**: CSS Grid (2D page structure for `<header>`, `<main>`, `<aside>`, `<footer>`). <br>**Micro Layout**: Flexbox (Component alignment for navigation, buttons, badges, card items). |
| **Semantic HTML5** | **Landmark Standard**: Strict usage of standard HTML5 landmarks: `<header>`, `<nav>`, `<main>`, `<article>`, `<aside>`, `<footer>`. Generic `<div>` overuse is explicitly banned. |
| **Visual Aesthetics** | **2025 "Warmth & Grounding" Aesthetics**: Shift away from sterile cold tech into warm, refined UI. |
| **Color System** | Must strictly implement the 2025 palette tokens: <br>• **Mocha Mousse**: `#AB9B8F` / `#A8866F` (Stability & Grounding) <br>• **Ethereal Blue**: `#A0B4E0` / `#4A709C` (Trust & Clarity) <br>• **Moonlit Grey**: `#F2F0EA` (Refinement & Backgrounds) |
| **Typography System** | Maximum of **2 font families** and **3 font weights**: <br>• **Headlines**: Montserrat or Inter (Geometric) <br>• **Body Text**: Roboto or Open Sans (Readable) |
| **Accessibility & Performance** | Strict **WCAG Universal Access compliance**, clean ARIA attributes, semantic structure for screen readers & AI, and performance optimization (LCP / CLS). |

---

## 📋 2. Compulsory UI Structure & Components

The interface **MUST** include the following structural sections and components:

### A. Header & Navigation (`<header>`, `<nav>`)
- DecodeLabs branding & logo element.
- Desktop navigation links (Flexbox layout).
- Responsive Hamburger Toggle for Mobile viewports (`<button>` with keyboard & ARIA support).
- Theme/Mode Selector (Warm Light / Grounded Dark).

### B. Hero Section (`<main>` header unit)
- Subtitle Badge Tag: *"Digital Craftsmanship"*.
- Primary Heading (`<h1>`): *"Project 1: The Responsive Layout — Architecting for the Mobile Web"*.
- Narrative Overview: Explaining adaptability over fixed dimensions.
- Primary CTA (`Explore Blueprint`) & Secondary CTA (`View Guidelines`).

### C. Core Content Grid (`<main>` -> `<article>` units)
Three mandatory pillar articles structured inside a CSS Grid layout:
1. **Pillar 1: Strategy & The Blueprint**
   - User Empathy Mapping (*Says, Thinks, Does, Feels*).
   - Low-Fidelity Wireframing principles (*Grayscale validation rule*).
2. **Pillar 2: Visual Design & 2025 Aesthetics**
   - Palette Tokens (Mocha Mousse, Ethereal Blue, Moonlit Grey).
   - Typography System & Rules.
3. **Pillar 3: Implementation — The Foundation & Framework**
   - Semantic HTML5 landmark table of contents.
   - CSS Grid (2D Macro Layouts) & Flexbox (1D Micro Components).

### D. Execution Roadmap Section
Structured multi-step workflow sequence:
1. `01. Discovery` (Define "How Might We")
2. `02. Wireframe` (Grayscale, Mobile-First)
3. `03. Semantics` (HTML Landmarks)
4. `04. CSS Grid/Flex` (2025 Palette & Layouts)
5. `05. Logic` (State & Interactivity)
6. `06. Audit` (LCP/CLS & Accessibility)

### E. Interactive Side Panel (`<aside>`)
- Live **Viewport Breakpoint Inspector**: Real-time resolution display & active layout mode indicator (`Mobile < 768px`, `Tablet 768px - 1023px`, `Desktop ≥ 1024px`).
- **WCAG Accessibility & Semantics Checklist** interactive widget.

### F. Terminal Footer (`<footer>`)
- Metadata & DecodeLabs Internship Program branding.
- Contact Details (Must include exact details from PDF):
  - 📞 `+91 89330 06408`
  - ✉ `decodelabs.tech@gmail.com`
  - 🌎 `www.decodelabs.tech`
  - 📍 `Greater Lucknow, India`

---

## ⚡ 3. Compulsory JavaScript Interactivity

The frontend MUST feature functional native ES6 JavaScript logic for:
1. **Mobile Drawer Navigation**: Toggling slide-out menu on smaller viewports with backdrop overlay and proper `aria-expanded` attributes.
2. **Real-time Breakpoint Inspector**: Listening to window resize events to update the layout state widget in the `<aside>` panel dynamically.
3. **Roadmap Step Switcher**: Interactive filter/tab logic allowing users to click through the 6 execution roadmap steps.
4. **Theme Switcher**: Toggling between Warm Light Mode and Grounded Mocha Dark Mode with state persisted in `localStorage`.

---

## 📁 4. Project File Architecture

All project code must be maintained cleanly in the following directory structure:

```
c:\Users\SUMIT\AntiGraviti_Workspace\DecodeLabs\
├── REQUIREMENTS.md          # Compulsory Project Requirements Document
├── index.html               # Main Semantic HTML5 Entry Point
├── css/
│   ├── variables.css        # Color Palette, Typography Tokens, Spacing
│   ├── reset.css            # Base Modern CSS Reset & Accessibility rules
│   ├── macro-grid.css       # CSS Grid Page-Level Layout System
│   ├── components.css       # Flexbox UI Micro-Components (Buttons, Cards, Badges)
│   └── responsive.css       # Mobile-First Media Queries & Fluid clamp() rules
└── js/
    ├── app.js               # Main Application Orchestrator
    ├── nav.js               # Responsive Mobile Navigation Controller
    └── breakpoint-widget.js  # Live Breakpoint Monitor & Roadmap Interactivity
```
