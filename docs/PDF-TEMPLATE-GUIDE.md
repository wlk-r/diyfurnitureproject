# PDF Template Best Practices

Guide for creating furniture plan PDF templates that work well with automated watermarking.

## Template Layout Guidelines

### Reserve Space for Watermarks

**Footer (every page):**
- Leave 0.5" margin at bottom of each page
- Text will be added: `Order #12345 • customer@email.com • 2026-01-12`
- Font size: 7pt
- Color: Gray (#808080)

**Diagonal Watermark:**
- Faint text across center of page
- Customer email in large font (36pt)
- 45° rotation
- Very low opacity (30%)
- Won't obstruct important content if placed thoughtfully

### Page Layout Recommendations

```
┌─────────────────────────────────────┐
│ TITLE / HEADER                      │ ← Safe zone, no watermark
│                                     │
│                                     │
│   Main Content Area                 │ ← Diagonal watermark here
│   (Plans, diagrams, instructions)   │    (faint, low opacity)
│                                     │
│                                     │
├─────────────────────────────────────┤
│ Order #XXX • email • date           │ ← Footer watermark
└─────────────────────────────────────┘
```

## Content to Include

### Essential Information

1. **Cover Page**
   - Project name
   - Designer attribution (Walker Nosworthy)
   - Brief description
   - Safety warnings
   - Copyright notice (template, not customer-specific)

2. **Materials List**
   - Wood type and dimensions
   - Hardware (screws, brackets, etc.)
   - Finish/adhesive recommendations
   - Quantity needed

3. **Tools Required**
   - Basic tools
   - Optional specialized tools
   - Safety equipment

4. **Cutting Diagrams**
   - Optimized cutting layouts
   - Dimensions labeled clearly
   - Grain direction indicators
   - Waste minimization tips

5. **Assembly Steps**
   - Numbered steps with illustrations
   - Joinery details (close-ups)
   - Recommended assembly order
   - Tips and tricks

6. **Finishing Instructions**
   - Surface preparation
   - Recommended finishes
   - Application methods
   - Drying times

### Optional Enhancements

- Exploded view diagrams
- 3D renderings of specific joints
- Alternative design variations
- Troubleshooting guide
- Modification suggestions

## Design Best Practices

### Typography

- **Body text:** 10-12pt minimum (readability)
- **Dimensions:** 8-10pt, bold for clarity
- **Labels:** 8pt minimum
- **Use monospace fonts** for measurements (easier to read numbers)

### Diagrams

- **High contrast:** Dark lines on white background
- **Clear dimensioning:** Use proper dimension lines with arrows
- **Scale indicators:** Show scale on each drawing
- **Multiple views:** Top, side, front where needed
- **Detail callouts:** Circle and enlarge complex joinery

### Color Usage

- **Print-friendly:** Assume black & white printing
- **Use grayscale** for shading/emphasis
- **Avoid pure black** for backgrounds (hard to print)
- **Line weights:** Vary thickness to show depth/importance

## File Specifications

### Format
- **PDF version:** 1.4 or higher
- **Compression:** Moderate (balance file size vs. quality)
- **Embedded fonts:** Yes (ensures consistency)
- **Color space:** RGB (for screen viewing) or CMYK (for printing)

### File Size
- **Target:** Under 20 MB per PDF
- **Images:** Compress to 150-300 DPI (not higher, wastes space)
- **Vector graphics:** Preferred for diagrams (smaller, scalable)

### Page Size
- **US customers:** Letter (8.5" × 11") or Tabloid (11" × 17")
- **International:** A4 (210mm × 297mm) or A3
- **Large format optional:** For full-size cutting templates

## Template Checklist

Before uploading your template:

- [ ] All pages have 0.5" bottom margin for footer watermark
- [ ] Important content won't be obscured by diagonal watermark
- [ ] All measurements are clearly labeled
- [ ] Diagrams are high resolution (300 DPI for images)
- [ ] Text is readable at print size
- [ ] No customer-specific information included
- [ ] Copyright notice is generic (not personalized)
- [ ] File size is reasonable (< 20 MB)
- [ ] Tested printing on actual paper
- [ ] Page numbers included
- [ ] Table of contents (if multi-page)

## Watermark-Friendly Layouts

### Good Layout Examples

**Full-page diagram:**
```
┌─────────────────────────────────┐
│                                 │
│        DIAGRAM WITH             │
│        LIGHT BACKGROUND         │ ← Diagonal watermark visible
│        (white/cream)            │    but not distracting
│                                 │
└─────────────────────────────────┘
```

**Text-heavy page:**
```
┌─────────────────────────────────┐
│  Instructions here              │
│  1. Step one...                 │
│  2. Step two...                 │ ← Watermark in margins
│                                 │    or light background areas
│  [Diagram]                      │
└─────────────────────────────────┘
```

### Avoid

❌ **Dense dark backgrounds** (watermark won't show)
❌ **Wall-to-wall images** (no space for footer)
❌ **Critical text at page center** (conflicts with diagonal watermark)
❌ **Very light text** (hard to read with watermark overlay)

## Testing Your Template

### Before Going Live

1. **Upload test template to R2**
   ```bash
   wrangler r2 object put furniture-plans-pdfs/templates/test-template.pdf --file=./template.pdf
   ```

2. **Trigger test order** in Lemon Squeezy (test mode)

3. **Download watermarked PDF**

4. **Check:**
   - Footer watermark is readable
   - Diagonal watermark is visible but not obtrusive
   - No important content is obscured
   - Print quality is acceptable
   - File size is reasonable

5. **Iterate** watermark positioning if needed (edit worker code)

## Multiple Template Versions

Consider creating variations:

### By Detail Level
- **Quick Start:** Simplified, 5-10 pages
- **Complete Plans:** Full detail, 20+ pages
- **Master Edition:** Includes variations, advanced techniques

### By Skill Level
- **Beginner:** More detailed instructions, simpler joinery
- **Intermediate:** Standard plans
- **Advanced:** Assumes knowledge, focuses on complex details

### By Format
- **Digital-optimized:** Hyperlinks, layers, zoom-friendly
- **Print-optimized:** Large text, high contrast, printer-friendly
- **Large Format:** Full-size cutting templates for direct use

## Updating Templates

When you need to update a template:

1. Create new version with version number in filename: `chair-plans-v2.pdf`
2. Upload to R2: `wrangler r2 object put ...`
3. Update product mapping in worker (or keep same filename)
4. Keep old version for existing customers (don't delete)
5. Note version changes in product description

## Examples by Project Type

### Chair Plans Should Include:
- Seat dimensions and angle
- Leg joinery (mortise/tenon, dowels, etc.)
- Backrest attachment method
- Weight capacity specifications
- Ergonomic considerations

### Table Plans Should Include:
- Top construction (solid, veneer, breadboard ends)
- Apron dimensions and attachment
- Leg placement and stability
- Expansion options (leaves, extensions)
- Leveling/adjustment methods

### Storage Plans Should Include:
- Interior dimensions
- Shelf spacing options
- Door/drawer construction
- Hardware specifications
- Assembly sequence (important for fitted pieces)

## Legal Considerations

### Include in Template:

**Copyright Notice:**
```
© 2026 Walker Nosworthy. All rights reserved.
Licensed for personal use only. Commercial reproduction prohibited.
```

**Usage Rights:**
```
LICENSE: This document is licensed for personal, non-commercial use.
You may build furniture for personal use or as gifts.
Commercial production requires separate licensing.
```

**Liability Disclaimer:**
```
DISCLAIMER: Follow all safety guidelines when using power tools.
Build at your own risk. Designer assumes no liability for injuries or damages.
```

### Don't Include:
- Customer name (added automatically)
- Order ID (added automatically)
- Purchase date (added automatically)
- Customer email (added automatically)

## Resources

**Dimensioning Standards:**
- ISO 129 (technical drawings)
- ANSI Y14.5 (geometric dimensioning)

**CAD Software for Diagrams:**
- SketchUp (3D modeling, then screenshot)
- Fusion 360 (parametric, export views)
- Inkscape (vector diagrams)
- Adobe Illustrator (professional vector)

**PDF Creation:**
- Adobe InDesign (professional layout)
- Affinity Publisher (affordable alternative)
- Scribus (free, open-source)
- Microsoft Word → PDF (basic option)

---

Your templates are the core value proposition. Invest time in making them clear, comprehensive, and beautiful!
