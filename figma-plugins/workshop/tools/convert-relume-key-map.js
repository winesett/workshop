const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const inputPath = process.argv[2] || "/Users/codywinesett/Documents/Handoff/relume-component-set-name-to-key.json";
const outputPath =
  process.argv[3] || path.join(root, "data", "relume-page-builder-registry.json");
const referencePath = "/Users/codywinesett/Downloads/page-builder-reference-library.txt";

const keyMap = JSON.parse(fs.readFileSync(inputPath, "utf8"));
const referenceItems = readReferenceItems(referencePath);
const registry = buildRegistry(keyMap, referenceItems);

fs.writeFileSync(outputPath, `${JSON.stringify(registry, null, 2)}\n`);

console.log(`Read ${Object.keys(keyMap).length} key-map entries.`);
console.log(`Wrote ${registry.items.length} registry items to ${outputPath}.`);
console.log(`Mapped ${registry.stats.mappedToReference} items to the Page Builder reference list.`);
console.log(`Left ${registry.stats.unmapped} items as raw refs.`);

function readReferenceItems(filePath) {
  const items = [];
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/u)) {
    const match = line.match(/^\s*-\s*(.+?)\s*\/\s*(.+?)\s*$/u);
    if (!match) continue;
    const category = match[1].trim();
    const name = match[2].trim();
    items.push({ category, name, ref: `${category} / ${name}` });
  }
  return items;
}

function buildRegistry(map, referenceItems) {
  const items = [];
  for (const [sourceName, key] of Object.entries(map)) {
    if (typeof key !== "string" || !key.trim()) continue;
    const refInfo = parseReferenceName(sourceName, referenceItems);
    items.push({
      ref: refInfo ? refInfo.ref : sourceName,
      category: refInfo ? refInfo.category : "",
      name: refInfo ? refInfo.name : sourceName,
      kind: "componentSet",
      key: key.trim(),
      sourceNodeName: sourceName,
      remote: true,
      mappedToReference: Boolean(refInfo && refInfo.mappedToReference),
    });
  }

  const deduped = new Map();
  for (const item of items) {
    deduped.set(normalizeKey(item.ref), item);
  }

  const outputItems = [...deduped.values()].sort((a, b) => a.ref.localeCompare(b.ref));

  return {
    schemaVersion: "workshop.pageBuilder.libraryRegistry.v1",
    createdAt: new Date().toISOString(),
    source: {
      input: inputPath,
      reference: referencePath,
    },
    stats: {
      inputEntries: Object.keys(map).length,
      itemCount: outputItems.length,
      mappedToReference: outputItems.filter((item) => item.mappedToReference).length,
      unmapped: outputItems.filter((item) => !item.mappedToReference).length,
    },
    items: outputItems,
  };
}

function parseReferenceName(value, referenceItems) {
  const raw = stripLayerPrefix(String(value || "").trim());
  const canonical = canonicalReference(raw, referenceItems);
  if (canonical) return canonical;

  const match = raw.match(/^\s*(.+?)\s*\/\s*(.+?)\s*$/u);
  if (!match) return null;
  return {
    category: match[1].trim(),
    name: match[2].trim(),
    ref: `${match[1].trim()} / ${match[2].trim()}`,
    mappedToReference: false,
  };
}

function canonicalReference(raw, referenceItems) {
  const cleaned = stripLayerPrefix(String(raw || ""))
    .trim()
    .replace(/\s*\/\s*$/u, "");
  const direct = referenceItems.find((item) => normalizeKey(item.ref) === normalizeKey(cleaned));
  if (direct) return referenceInfo(direct);

  const parts = cleaned.split("/").map((part) => part.trim()).filter(Boolean);
  if (parts.length < 2) return null;

  const categoryAlias = canonicalReferenceCategory(parts[0], referenceItems);
  const numberMatch = parts[1].match(/\d+/u);
  if (!categoryAlias || !numberMatch) return null;

  const number = numberMatch[0];
  const sectionBase = titleCaseWords(parts[0]);
  const candidates = [
    `${categoryAlias} / Header ${number}`,
    `${categoryAlias} / Layout ${number}`,
    `${categoryAlias} / CTA ${number}`,
    `${categoryAlias} / Footer ${number}`,
    `${categoryAlias} / Logo ${number}`,
    `${categoryAlias} / ${sectionBase} ${number}`,
    `${categoryAlias} / ${parts[1].replace(/\s*\/\s*$/u, "")}`,
  ];

  for (const candidate of candidates) {
    const item = referenceItems.find((entry) => normalizeKey(entry.ref) === normalizeKey(candidate));
    if (item) return referenceInfo(item);
  }

  return null;
}

function referenceInfo(item) {
  return {
    category: item.category,
    name: item.name,
    ref: item.ref,
    mappedToReference: true,
  };
}

function canonicalReferenceCategory(value, referenceItems) {
  const key = normalizeKey(value);
  const aliases = {
    header: "Hero-Headers",
    headers: "Hero-Headers",
    hero: "Hero-Headers",
    navbar: "Navbars",
    nav: "Navbars",
    footer: "Footers",
    footers: "Footers",
    cta: "CTA",
    feature: "Features",
    features: "Features",
    layout: "Features",
    layouts: "Features",
    logo: "Logos",
    logos: "Logos",
    testimonial: "Testimonials",
    testimonials: "Testimonials",
  };

  const direct = referenceItems.find((item) => normalizeKey(item.category) === key);
  return direct ? direct.category : aliases[key] || "";
}

function normalizeKey(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/gu, "and")
    .replace(/[^a-z0-9]+/gu, "");
}

function stripLayerPrefix(value) {
  return String(value || "").replace(/^\s*\d{1,3}\s+/u, "").trim();
}

function titleCaseWords(value) {
  return String(value || "")
    .replace(/[-_]+/gu, " ")
    .trim()
    .split(/\s+/u)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}
