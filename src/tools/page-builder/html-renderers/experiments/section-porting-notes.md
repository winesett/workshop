# Section Porting Notes

These notes are for the HTML renderer sandbox only. They describe what we are learning while manually porting Relume screenshot sections into normal HTML/CSS.

## Current Baseline

- Treat each desktop section as a 1440 by 864 frame unless the source proves otherwise.
- Use a 1280 wide container for desktop sections.
- Keep global Relume facts in `relume-style-facts.ts`.
- Keep reusable renderer CSS in `relume-renderer.css`.
- Keep per-section geometry in each renderer's `layoutXTuning` object.
- Do not let this experiment leak styles into Workshop app UI.

## Porting Flow

1. Confirm the exact catalog reference exists.
2. Add the screenshot reference to the sandbox registry.
3. Create one isolated renderer file for the layout.
4. Start from the closest already-good renderer.
5. Match the outer frame first: section width, height, padding, container width, and component height.
6. Match the main structure second: columns, gaps, media size, and vertical alignment.
7. Match content wrappers third: section title, tagline wrapper, text content, logos, feature list, and actions.
8. Use `aria-label` names that mirror the Figma layer names where useful.
9. Move repeated text, heading, button, and icon styles into shared tokens/classes.
10. Leave section-specific measurements in the section tuning object.

## Token Candidates

- Heading text styles.
- Body text styles.
- Tagline style.
- Button group gap.
- Primary button dimensions and border.
- Link button gap.
- Chevron icon path and slot size.
- Placeholder image and lightbox assets.
- Common desktop frame and container dimensions.

## Per-Section Values

These should stay local until we see repetition across enough layouts:

- Media block type and exact dimensions.
- Column count and order.
- Content stack gaps.
- Feature card/list structure.
- Whether the section uses a tagline.
- Whether the section uses actions.
- Whether the media is image or lightbox.

## Watch Outs

- Screenshot thumbnails are not the source size. Use the intended desktop frame, not thumbnail pixel dimensions.
- Figma may show nested wrapper gaps that differ from the visible total gap. Match the layer hierarchy before tweaking single values.
- Inline geometry is acceptable while measuring, but typography and common controls should move to tokens/classes quickly.
- Do not tune against the Workshop shell. Tune the section inside its fixed comparison frame.
- When a layout is sloppy, delete it instead of letting bad examples become the template.

## Extracted Example: Features / Layout 5

Reference site facts from `https://hem-vivid-26639759.figma.site/layout`, section 5:

- Section: 1440 by 864, padding `112px 64px`.
- Container/component: 1280 by 640 at x80 y112.
- Component: row flex, centered, gap 80.
- Left content column: 600 wide, height 504.2, y179.9, column gap 32.
- Section title group: gap 32.
- Section title wrapper: gap 16.
- Title content wrapper: gap 24.
- Heading: 600 wide, 48px, 700, line-height 57.6.
- Main body: 600 wide, 18px, 400, line-height 27.
- Feature list: row, gap 24, padding `8px 0`.
- Feature items: 288 wide, gap 16.
- Actions: gap 24, y636.1.
- Media/lightbox: 600 by 640, x760 y112.

## Extracted Batch: Features / Layouts 6-8

- Layout 6: `1440x864` section, `112px 64px` padding, `1280x640` component, `80px` column gap, `600x640` image media. Left content uses `H3` (`40px/48px`) and `18px/27px` body copy, then a two-column text feature list.
- Layout 7: same outer geometry. Left content starts at `y=179.9`, uses tagline, `H2` (`48px/57.6px`), `18px/27px` body copy, two icon feature items, and the shared action row. Media is the light image placeholder.
- Layout 8: same as Layout 7, but the media is the dark `600x640` lightbox/video placeholder.
- Workflow note: when a new layout is a variant, copy the nearest renderer shape and replace only the extracted facts: heading token, body token, feature item structure, action presence, and media placeholder type.
