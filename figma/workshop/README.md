# Workshop Figma Connection

Workshop-owned Figma development plugin for deterministic page assembly from a Relume/Page Builder component registry.

The plugin has two actions:

- **Assemble Page**: assembles the JSON currently in the textarea.
- **Codex Link**: assembles the JSON embedded from `codex-link-payload.json` directly.

## Payload Format

Schema: `workshop.pageBuilder.assembly.v1`

```json
{
  "schemaVersion": "workshop.pageBuilder.assembly.v1",
  "pageName": "Homepage Concept 1",
  "spacing": 0,
  "sections": [
    { "category": "header", "selection": 1 },
    { "category": "hero", "selection": 3 },
    { "ref": "CTA / CTA 14" }
  ]
}
```

Section entries can use:

- `ref`: exact canonical reference, such as `Hero-Headers / Header 3`
- `category` + `selection`: deterministic 1-based selection within the reference category
- `category` + `name`: category plus section name

Common aliases:

- `header` -> `Navbars`
- `hero` -> `Hero-Headers`
- `features` -> `Features`
- `logos` -> `Logos`
- `cta` -> `CTA`
- `footer` -> `Footers`

## Codex Link

`codex-link-payload.json` is the fixed handoff file for external workflows. A future repo or Codex run can overwrite that file with a `workshop.pageBuilder.assembly.v1` payload.

Then run:

```sh
npm run build
```

After reloading the development plugin in Figma, **Codex Link** assembles that payload directly without changing the textarea.

## Build

```sh
cd figma/workshop
npm run refresh-registry
npm run build
npm run validate
```

Load `manifest.json` in Figma as a development plugin.

## Key Inputs

- `sample-page-builder-payload.json`: default textarea payload.
- `codex-link-payload.json`: direct Codex Link payload exported from Workshop.
- `/Users/codywinesett/Downloads/page-builder-reference-library.txt`: canonical reference list.
- `/Users/codywinesett/Documents/Handoff/relume-component-set-name-to-key.json`: source Relume component-set key map.
- `/Users/codywinesett/Documents/Handoff/relume-page-builder-registry.json`: generated registry embedded into `code.js`.

## Notes

The Relume key map contains component-set keys, so the plugin imports most sections with `figma.importComponentSetByKeyAsync` and instances the default variant. Imported instances are stacked in a `1440px` vertical auto-layout frame.
