# Workshop Figma Connection Handoff

## Current State

This folder contains Workshop's Figma development plugin for assembling Relume/Page Builder sections into a vertical Figma frame.

Confirmed working:

- Plugin UI opens reliably.
- JSON textarea assembly works.
- `Codex Link` directly assembles `codex-link-payload.json`.
- Relume component-set key imports work with `figma.importComponentSetByKeyAsync`.
- Generated frames stack imported instances at `1440px` width with vertical auto-layout.

## User-Facing Flow

1. Edit the textarea JSON, then click **Assemble Page**.
2. Or overwrite `codex-link-payload.json`, run `npm run build`, reload the plugin, then click **Codex Link**.

## Developer Flow

```sh
cd figma-plugins/workshop
npm run refresh-registry
npm run build
npm run validate
```

Load `manifest.json` in Figma as a development plugin.

## Files

- `manifest.json`: Figma development plugin manifest.
- `ui.html`: compact plugin UI.
- `src/code.template.js`: source template for generated plugin main code.
- `code.js`: generated plugin main code loaded by Figma.
- `tools/build-code.js`: embeds reference list, registry, sample payload, and Codex Link payload.
- `tools/convert-relume-key-map.js`: converts flat Relume component-set key map to Page Builder registry.
- `sample-page-builder-payload.json`: default textarea recipe.
- `codex-link-payload.json`: fixed external handoff file for direct assembly.

## Payload Contract

```json
{
  "schemaVersion": "workshop.pageBuilder.assembly.v1",
  "pageName": "Page name",
  "spacing": 0,
  "sections": [
    { "ref": "Hero-Headers / Header 3" },
    { "category": "features", "selection": 42 }
  ]
}
```

Supported section forms:

- Exact ref string: `"Hero-Headers / Header 3"`
- Object ref: `{ "ref": "Hero-Headers / Header 3" }`
- Category/index: `{ "category": "hero", "selection": 3 }`
- Category/name: `{ "category": "Hero-Headers", "name": "Header 3" }`

## Registry Notes

The source key file is:

`/Users/codywinesett/Documents/Handoff/relume-component-set-name-to-key.json`

It contains component-set keys. The converted registry is committed at:

`figma-plugins/workshop/data/relume-page-builder-registry.json`

The converter canonicalizes Relume source names like:

- `Header / 3 /` -> `Hero-Headers / Header 3`
- `Navbar / 1 /` -> `Navbars / Navbar 1`
- `Footer / 6 /` -> `Footers / Footer 6`

It also strips generated layer prefixes like:

- `01 Navbars / Navbar 1` -> `Navbars / Navbar 1`

## Known Constraints

- Figma plugins cannot read arbitrary local files at runtime. Payload files are embedded at build time.
- After overwriting `codex-link-payload.json`, run `npm run build` and reload the development plugin.
- The plugin currently creates frames on the current page, centered near the viewport.
- It does not yet create separate Figma pages or avoid overlap between repeated assemblies.
- It imports default variants from component sets.

## Next Good Improvements

- Add a small validation preview before assembly.
- Place each new assembled frame to the right of the previous generated frame.
- Support a runtime pasted registry for ad hoc key-map testing again if needed.
- Add richer category aliases for less common Page Builder categories.
