# HelmRx Brand Execution Playbook

**Everything you need to go from brand guide to physical product in hand.**

This document covers what's already built, what you do yourself, and exact prompts for every external provider. Tasks are in execution order — do them top to bottom.

---

## WHAT'S ALREADY DONE (In Your Deliverables)

| File | What It Is |
|------|-----------|
| `brand-guide.html` | Complete visual brand guide — open in browser. Covers logo, colors, typography, sub-brand lockups, packaging front/back panel mockups, insert card designs, brand don'ts |
| `logo-primary.svg` | HELMRx wordmark — navy HELM + teal Rx, for light backgrounds |
| `logo-white.svg` | HELMRx wordmark — white HELM + light teal Rx, for dark backgrounds |
| `icon-mark.svg` | "H" in navy rounded square — primary app icon / favicon |
| `icon-mark-teal.svg` | "H" in teal rounded square — accent variant |
| `lockup-strand.svg` | HELM Strand product lockup with green accent |
| `lockup-drive.svg` | HELM Drive product lockup with plum accent |
| `lockup-peak.svg` | HELM Peak product lockup with plum accent |
| `lockup-endure.svg` | HELM Endure product lockup with plum accent |
| `lockup-lean.svg` | HELM Lean product lockup with slate accent |
| `lockup-foundation.svg` | HELM Foundation product lockup with teal accent |
| `favicon-*.png` | Favicon set: 16, 32, 48, 64, 180, 192, 512px |
| `favicon.ico` | Multi-resolution ICO file for browsers |
| `apple-touch-icon.png` | iOS home screen icon |
| `og-image.png` | Open Graph social share image (1200×630) |

---

## TASK 1: FINALIZE THE LOGO IN FIGMA

**Who does it:** You, in Figma (free account)
**Time:** 30 minutes
**Why Figma over a designer:** This is a pure typographic wordmark. Setting type in Figma is faster than briefing a designer and waiting for revisions.

### Step-by-step:

1. Go to figma.com → create free account → new file
2. Install the font "Plus Jakarta Sans" from Google Fonts (Figma has it built in — search in the text panel)
3. Create a frame 1200×400px

**Primary Wordmark:**
- Type "HELM" → Plus Jakarta Sans, ExtraBold (800 weight), 120px, color #0F1B2D, letter-spacing -2
- Type "Rx" → Plus Jakarta Sans, Medium (500 weight), 84px, color #2A7C6F
- Position Rx baseline-aligned with HELM, 4px gap after the M
- Group these → name "Logo / Primary"

**White Variant:**
- Duplicate the group
- Change HELM fill to #FFFFFF, Rx fill to #35997A
- Name "Logo / White"

**Mono Variant:**
- Duplicate again
- Both HELM and Rx in #0F1B2D
- Name "Logo / Mono"

**Icon Mark:**
- Rectangle 128×128px, corner radius 28px, fill #0F1B2D
- Type "H" → Plus Jakarta Sans, ExtraBold, 84px, color #FFFFFF, centered
- Group → name "Icon / Primary"
- Duplicate with fill #2A7C6F → "Icon / Teal"
- Duplicate with fill #FFFFFF, stroke #E5E7EB 2px, H in #0F1B2D → "Icon / Outline"

**Export from Figma:**
- Select each group → Export panel → add SVG export + PNG @2x export
- For icon mark, also export at 16px, 32px, 64px, 180px, 512px as PNG

**Convert HELM and Rx text to outlines:**
- Select both text layers → right click → "Outline Stroke" (this converts to paths so the logo renders without needing the font installed)
- Export the outlined version as your production SVGs

### What you now have:
- Production-ready SVG logos that work without font dependencies
- PNG variants for every context
- Figma source file you can share with any future designer

---

## TASK 2: UPDATE THE WEBSITE WITH REAL LOGO

**Who does it:** You
**Time:** 10 minutes

Replace the text-based logo in your website `index.html` nav with the actual SVG:

1. Export "Logo / Primary" from Figma as SVG, save as `logo.svg`
2. Export "Logo / White" as `logo-white.svg`
3. Export "Icon / Primary" as `icon.svg`
4. Add favicon references to `<head>`:

```html
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<meta property="og:image" content="https://helmrx.in/og-image.png">
```

5. Replace the text logo in the nav with: `<img src="/logo.svg" alt="HelmRx" height="32">`
6. Replace the footer logo similarly with the white variant

---

## TASK 3: PACKAGING MOCKUPS VIA MIDJOURNEY

**Who does it:** You, via Midjourney ($10/month)
**Time:** 1–2 hours
**Why Midjourney over Canva:** Canva AI generates flat illustrations. Midjourney generates photorealistic product mockups that look like professional studio photography. These mockups are for your website, pitch deck, and investor materials — not for print production.

### Prompt 1: HELM Strand (Hair Loss) Product Box

```
Product packaging mockup, premium pharmaceutical box on white marble surface. Matte white cardboard box, minimal design. Top left has "HELM" in bold navy blue sans-serif, small "Rx" in teal next to it. Center of box reads "Strand" in medium weight navy type. Below it reads "Finasteride 1mg · Daily Tablet" in small gray text. Thin forest green accent strip along bottom edge. Small navy ℞ symbol. Clean, pharmaceutical, premium like Aesop or Hims packaging. Studio lighting, soft shadows. No text other than what is specified. --ar 4:3 --v 6.1 --style raw
```

### Prompt 2: HELM Drive (ED) Product Box

```
Product packaging mockup, premium pharmaceutical box on dark slate surface. Matte white cardboard box, minimal design. Top left has "HELM" in bold navy blue sans-serif, small "Rx" in teal. Center reads "Drive" in medium weight navy type. Below reads "Tadalafil 5mg · Daily Tablet" in small gray text. Thin deep plum/burgundy accent strip along bottom edge. Small navy ℞ symbol. Clean, pharmaceutical aesthetic. Studio lighting, dramatic but minimal. --ar 4:3 --v 6.1 --style raw
```

### Prompt 3: Complete Protocol Box Set

```
Flat lay product photography, three premium pharmaceutical boxes arranged on white linen surface with soft morning light. All boxes are matte white with minimal navy blue typography reading "HELM" with teal "Rx". The three boxes have different names: "Strand", "Drive", "Peak". Each has a different thin color accent strip at bottom: green, plum, plum. Clean, clinical, premium. No pills visible. Architectural composition. --ar 16:9 --v 6.1 --style raw
```

### Prompt 4: Supplement Bottle

```
Product photography, premium supplement bottle on white background. Matte navy blue cylindrical bottle with white minimal label. Label shows "HELM" in white bold type, "Rx" in teal, "Foundation" below in lighter weight. "D3 + B12 + Zinc + Magnesium" in small text. Clean pharmaceutical aesthetic, not wellness-brand-colorful. Studio lighting. --ar 3:4 --v 6.1 --style raw
```

### Prompt 5: Shipping Box (Discreet)

```
Overhead product photography, plain matte white shipping box on concrete surface. Only marking is a subtle embossed "H" monogram in navy blue in center of box. No other text, no brand name, no product information. Minimal, discreet, premium. Soft natural lighting. --ar 1:1 --v 6.1 --style raw
```

### Prompt 6: Unboxing Moment

```
Top-down unboxing photography, opened white shipping box revealing premium pharmaceutical product box inside. White tissue paper partially folded back. Product box visible with "HELM" and "Rx" branding in navy and teal. Small printed cards visible alongside. Clean, organized, premium unboxing experience. Soft studio lighting. --ar 4:5 --v 6.1 --style raw
```

### After Midjourney:

- Pick the best 2–3 from each prompt
- Use these on the website hero, product pages, and About page
- Use in pitch deck for investor presentations
- Use on social media launch posts

### Midjourney tips:
- If text renders wrong (it often does), use the `--no text letters words` flag and add the text later in Canva
- Run 4 variations of each prompt, pick the best composition
- Use `--v 6.1 --style raw` for most photorealistic results
- Upscale your winners to full resolution before using

---

## TASK 4: PACKAGING PRINT FILES — FIVERR DESIGNER

**Who does it:** Fiverr designer
**Cost:** ₹5,000–12,000 depending on number of SKUs
**Time:** 5–7 days with revisions

This is for actual print-ready packaging artwork — the files your packaging manufacturer needs to produce physical boxes.

### How to find the right designer:

1. Go to fiverr.com
2. Search: "product packaging design pharmaceutical" or "medicine box packaging design"
3. Filter: 4.8+ stars, 200+ reviews, "packaging design" category
4. Look for portfolios showing clean, minimal pharmaceutical/supplement packaging (not candy-colored supplement jars)

### Brief to send the designer:

```
PROJECT: Packaging design for HelmRx, a men's telehealth platform in India

WHAT I NEED:
- Print-ready packaging artwork for product boxes
- Starting with 2 SKUs (we'll add more later):
  1. HELM Strand — Finasteride 1mg — 30 tablets
  2. HELM Drive — Tadalafil 5mg — 30 tablets

BOX DIMENSIONS:
- [Get from your packaging manufacturer — typically ~12cm × 8cm × 3cm for 30-tablet blister boxes]
- I'll provide exact dieline template from manufacturer

DESIGN DIRECTION:
- Pharmaceutical-grade, NOT wellness/supplement aesthetic
- Reference brands: Hims (US), Aesop, Pfizer modern packaging
- Matte white cardboard, minimal design
- Maximum 3 colors per package

BRAND ELEMENTS (I'll provide files):
- Logo: "HELM" bold navy + "Rx" teal (SVG provided)
- Font: Plus Jakarta Sans (Google Font, free)
- Primary color: Navy #0F1B2D
- Accent color: Teal #2A7C6F
- Category accent: Forest green #1B5E3B (Strand), Deep plum #5B2D5E (Drive)

FRONT PANEL HIERARCHY (top to bottom):
1. HELM logo (top left, small)
2. Sub-brand name in large type: "Strand" or "Drive"
3. Active ingredient + format: "Finasteride 1mg · Daily Tablet"
4. ℞ badge: "℞ Prescription · 30 tablets · 1-month supply"
5. Thin category color strip along bottom edge (4-5mm)

BACK PANEL CONTENT (I'll provide exact text):
- Active ingredient disclosure box (monospace font)
- Schedule H warning in red/pink box
- Manufacturer details, batch code placeholders, MRP
- Storage instructions
- Doctor/WhatsApp contact line
- Must comply with Indian Drugs & Cosmetics Act labeling requirements

WHAT I DON'T WANT:
- No glossy finish (matte only)
- No gradients or shadows on the design
- No before/after imagery
- No percentage claims or efficacy stats
- No more than 3 colors per package
- No decorative elements — the typography IS the design

DELIVERABLES:
- Print-ready AI/PDF files with bleed and crop marks
- Dieline with artwork
- Separate layers for each color (for spot color printing if needed)
- Front, back, and all side panels
- Source files (Adobe Illustrator .ai)

I'm attaching: brand guide (HTML file), logo SVGs, sub-brand lockup examples, and mockup photos for reference.
```

### Files to attach:
- `brand-guide.html` (save as PDF or screenshots)
- `logo-primary.svg`
- `lockup-strand.svg` and `lockup-drive.svg`
- Midjourney mockup photos as reference
- Back panel text (copy from brand-guide.html packaging section)

---

## TASK 5: PACKAGING MANUFACTURER — GET QUOTES

**Who does it:** You, with Wallace Pharma guidance
**Time:** 1 week for samples
**When:** After designer delivers print files (Task 4)

### Recommended approach:

**Option A: Ask Wallace Pharma**
Your existing relationship. Ask: "Can you connect me with the packaging supplier your pharma clients use for secondary packaging (outer cartons)? I need matte white 300+ GSM boxes with 1–3 spot color printing."

**Option B: IndiaMART / TradeIndia**

Search: "pharmaceutical carton box manufacturer" or "medicine packaging box printer"

Major packaging hubs: Baddi (Himachal Pradesh), Daman, Ahmedabad, Mumbai

### Specification sheet to send manufacturer:

```
PACKAGING SPECIFICATION — HelmRx Product Boxes

Material: 300 GSM SBS (Solid Bleached Sulfate) board or equivalent
Finish: Matte lamination on exterior
Printing: 3-color offset (Navy Pantone 289 C, Teal Pantone 7722 C, Black)
         OR 4-color CMYK process if more cost-effective
Box style: Tuck-end carton (standard pharmaceutical)
Size: [Confirm with manufacturer based on blister strip dimensions]

QUANTITY (Initial order):
- HELM Strand box: 500–1,000 units
- HELM Drive box: 500–1,000 units

ARTWORK: Print-ready PDF/AI files provided with crop marks and bleed

ADDITIONAL REQUIREMENTS:
- Batch number and expiry date area must be blank (we'll stamp or sticker)
- MRP area should have placeholder for sticker application
- Schedule H warning text must be legible at regulatory minimum size

PLEASE PROVIDE:
1. Unit cost at 500, 1000, 2500, 5000 quantity
2. Setup/plate charges
3. Lead time for first order
4. Sample turnaround time with our artwork
5. Minimum reorder quantity
```

---

## TASK 6: SHIPPING BOXES

**Who does it:** You, via local packaging supplier or Amazon/IndiaMART
**Cost:** ₹15–30 per box at 500+ quantity
**Time:** 1–2 weeks

### Specification:

```
SHIPPING BOX SPECIFICATION — HelmRx

Type: 3-ply corrugated box
Material: White outer liner (NOT brown kraft)
Printing: Single-color stamp or screen print
  - Design: Letter "H" centered, 4cm × 4cm, in navy (#0F1B2D / Pantone 289 C)
  - That's it. No other text, no brand name, no website.
Inside: Unprinted

Sizes needed (measure your product boxes first):
- Small (single product): ~15cm × 10cm × 5cm
- Medium (protocol bundle, 2-3 products): ~20cm × 15cm × 8cm

QUANTITY: 500 each size to start

Return address printed small on bottom flap:
"HelmRx Health Pvt. Ltd.
[Your registered address]"
```

### Where to order:
- IndiaMART search: "custom white corrugated box small quantity"
- PackMyRide.com (custom packaging, reasonable MOQs)
- Brown Box Company (browncorrugatedbox.com)
- Any local corrugated box manufacturer in your city

---

## TASK 7: INSERT CARDS — PRINTING

**Who does it:** You design in Canva, local printer produces
**Cost:** ₹3–5 per set of 4 cards at 500+ quantity
**Time:** 3–5 days from print-ready files

### Card specifications:

All cards: 12cm × 8cm (fits inside product box), 300 GSM art card, matte lamination one side, full color one side + B/W on reverse.

### Canva design instructions:

1. Open Canva → Custom size → 120mm × 80mm
2. Use font: Plus Jakarta Sans (available in Canva)
3. Create 4 designs using the content from brand-guide.html (Section 5, Layer 3):

**Card 1 — Doctor Card**
- Background: White
- Top: HelmRx logo small
- "Your Physician" heading in navy, 14pt bold
- Teal box with doctor name and MCI registration (leave as placeholder)
- Doctor's personalized message in quotes
- Bottom: "Questions? WhatsApp: [number]"

**Card 2 — Protocol Card**
- Background: White
- "The Regrowth Protocol" heading (or leave protocol name as placeholder)
- Three rows showing product name + dosage instruction
- Bottom note about consistency and timeline

**Card 3 — Timeline Card (What to Expect)**
- Background: White
- Four time milestones: Week 1-2, Month 1-2, Month 3-4, Month 6+
- Each with bold heading + 1-line description
- Tone: honest, reassuring, not overpromising

**Card 4 — Safety Card**
- Background: White with subtle cream tint
- "Side Effects & Safety" heading
- Three sections: Most common, Reported in 1-2%, Contact your doctor if
- Non-alarming, factual, empowering

### Printing:
- Export from Canva as PDF (Print), with crop marks
- Take to any local offset printer or use PrintStop.co.in, PrintLand.in, or VistaPrint India
- Order 500 sets to start (2,000 total cards)

---

## TASK 8: SUPPLEMENT BOTTLE/JAR LABELS

**Who does it:** Same Fiverr designer from Task 4 (add to scope), or separate label designer
**Cost:** ₹2,000–5,000 per label design
**When:** After packaging boxes are designed (consistent visual system)

For supplements you own the full packaging, so you need:
- Bottle label design (wrap-around or front+back)
- Matches the box design language exactly

### Brief:

```
SUPPLEMENT LABEL DESIGN — HelmRx Foundation

BOTTLE TYPE: [Confirm with manufacturer — likely HDPE white bottle, 60-count capsule size]

LABEL DESIGN:
- Same visual language as the product box designs
- "HELM" bold + "Rx" teal at top
- "Foundation" as sub-brand name
- "D3 + B12 + Zinc + Magnesium" ingredient highlight
- "Daily Supplement Pack · 30 servings" descriptor
- Teal accent elements (matching brand)

REQUIRED REGULATORY (back of label):
- FSSAI logo and license number: [Number]
- Full nutrition facts / supplement facts panel
- Ingredients list with quantities per serving
- Allergen information
- Manufacturing and marketing details with address
- Best before date area (blank for stamping)
- Batch code area
- MRP with inclusive tax
- "Not for medicinal use" disclaimer
- Storage instructions
- Country of origin

DELIVERABLES:
- Print-ready AI/PDF with exact bottle dimensions
- Die-cut template
- Source files
```

---

## TASK 9: SOCIAL MEDIA TEMPLATES — CANVA

**Who does it:** You, in Canva
**Time:** 2–3 hours
**Cost:** Free (Canva free tier) or ₹500/month (Canva Pro)

### Template set to create:

**Instagram Post (1080×1080)**
- Background: Navy (#0F1B2D)
- HELM logo white variant top-left
- Large stat or headline centered in white
- Teal accent line below headline
- Regulatory-safe claim as body text in light gray
- Example: "87% of men on Finasteride stopped further hair loss in clinical trials."

**Instagram Story (1080×1920)**
- Same color system
- Product mockup photo (from Midjourney) fills top 60%
- Bottom 40%: navy background with white text overlay
- CTA: "Free doctor consultation → helmrx.in"

**LinkedIn/Twitter Banner (1584×396)**
- Navy background
- White HELM logo left side
- "Doctor-Led Men's Health, Delivered" in white, right-aligned
- Thin teal accent line

**WhatsApp Product Catalog Images (600×600)**
- White background
- Product lockup centered (Strand, Drive, etc.)
- Price at bottom
- "Includes free doctor consultation"

### Canva setup:
1. Create a Brand Kit in Canva (Pro feature, or just save colors manually)
2. Colors: #0F1B2D, #1A2942, #2A7C6F, #FAFAF7, #C4943C
3. Font: Plus Jakarta Sans (available in Canva)
4. Upload logo SVGs as brand assets
5. Create one template per format, then duplicate and swap content for each post

---

## TASK 10: BUSINESS CARDS

**Who does it:** You design in Canva, print via VistaPrint India or local printer
**Cost:** ₹500–1,000 for 250 cards
**Time:** 3–5 days

### Design:

**Front:**
- Matte white background
- HELM logo primary (navy + teal) top-left, small
- Your name: Plus Jakarta Sans Bold, 11pt, navy
- Title: "Founder & CEO" in Regular, 9pt, gray
- Phone and email in 8pt gray

**Back:**
- Navy background full bleed
- "H" icon mark centered in white, subtle
- helmrx.in in small white text below
- "Doctor-Led Men's Health" in 8pt, teal

### Specs:
- 350 GSM art card
- Matte lamination both sides
- Standard business card size: 89mm × 51mm
- If you want premium: soft-touch matte lamination + spot UV on the "H" icon on the back

---

## TASK 11: OG IMAGE + SOCIAL SHARING

**Who does it:** You
**Time:** 10 minutes

The `og-image.png` in your deliverables is a starter. For a polished version:

1. Open Canva → Custom size 1200×630px
2. Navy background
3. Teal accent line at top (full width, 4px)
4. HELM logo white variant centered
5. "Doctor-Led Men's Health, Delivered" below in gray
6. Export as PNG
7. Upload to your hosting, update `<meta property="og:image">` tag

---

## EXECUTION TIMELINE

| Week | Tasks | Cost |
|------|-------|------|
| **Week 1** | Task 1 (Figma logo, 30min) + Task 2 (website update, 10min) + Task 3 (Midjourney mockups, 2hrs) | ₹800 (Midjourney month) |
| **Week 1** | Task 9 (Canva social templates, 2hrs) + Task 11 (OG image, 10min) | Free |
| **Week 1** | Task 4 (Brief Fiverr designer for packaging) | ₹5,000–12,000 |
| **Week 2** | Task 10 (Business cards — design + order) | ₹1,000 |
| **Week 2** | Review Fiverr designer's first draft, provide feedback | — |
| **Week 2** | Task 5 (Get packaging manufacturer quotes while waiting for final artwork) | — |
| **Week 3** | Finalize packaging artwork + Task 8 (Supplement labels) | ₹2,000–5,000 |
| **Week 3** | Task 6 (Order shipping boxes) | ₹8,000–15,000 (500 boxes) |
| **Week 3** | Task 7 (Print insert cards) | ₹2,000–3,000 |
| **Week 4** | Receive packaging samples, approve, place production order | ₹15,000–30,000 (1000 boxes) |

**Total estimated cost: ₹35,000–65,000** for complete brand identity + packaging for 2 launch SKUs

---

## COLOR REFERENCE (For Copy-Paste)

| Name | Hex | Pantone (nearest) | Use |
|------|-----|-------------------|-----|
| Navy | #0F1B2D | 289 C | Primary: logo, text, packaging |
| Navy Light | #1A2942 | 303 C | Secondary headings |
| Teal | #2A7C6F | 7722 C | "Rx", CTAs, accents |
| Teal Light | #35997A | 339 C | Reversed Rx on dark |
| Teal Pale | #E8F5F1 | 7485 C (10%) | Info banners, light fills |
| Gold | #C4943C | 7510 C | Premium details, sparingly |
| Cream | #FAFAF7 | — | Page backgrounds |
| Cat: Hair | #1B5E3B | 3425 C | Strand accent strip |
| Cat: Sexual | #5B2D5E | 7657 C | Drive/Peak/Endure accent |
| Cat: Weight | #374151 | 432 C | Lean accent strip |
| Cat: Supplements | #2A7C6F | 7722 C | Foundation (= brand teal) |

---

## FONT REFERENCE

| Context | Font | Weight | Size |
|---------|------|--------|------|
| Logo "HELM" | Plus Jakarta Sans | 800 (ExtraBold) | Variable |
| Logo "Rx" | Plus Jakarta Sans | 500 (Medium) | ~70% of HELM |
| Package sub-brand | Plus Jakarta Sans | 600 (SemiBold) | ~60% of HELM |
| Package descriptor | Plus Jakarta Sans | 400 (Regular) | Small |
| Regulatory/data text | JetBrains Mono | 400 (Regular) | Small |
| Website body | DM Sans | 400 | 16px |
| Website headings | DM Sans | 700 | Variable |

Note: Website uses DM Sans (already set up). Print/packaging uses Plus Jakarta Sans. Both are free Google Fonts.

---

## WHAT TO SKIP FOR NOW

- **Branded merchandise** (t-shirts, tote bags) — unnecessary until you have 1000+ subscribers
- **Video production** — use Midjourney stills and screen recordings for now
- **Custom website photography** — Midjourney mockups are indistinguishable from studio shots for web use
- **Brand anthem / audio identity** — not relevant for a telehealth platform
- **AR/VR packaging** — focus on getting the basic packaging right first
- **Multiple packaging variants** per SKU — start with one box design per product, add premium/gift variants later

---

*End of Playbook*
