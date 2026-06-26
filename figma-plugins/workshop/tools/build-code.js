const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const referencePath = "/Users/codywinesett/Downloads/page-builder-reference-library.txt";
const registryPath = path.join(root, "data", "relume-page-builder-registry.json");
const samplePayloadPath = path.join(root, "sample-page-builder-payload.json");
const codexLinkPayloadPath = path.join(root, "codex-link-payload.json");
const templatePath = path.join(root, "src", "code.template.js");
const outputPath = path.join(root, "code.js");

const referenceText = fs.readFileSync(referencePath, "utf8");
const referenceItems = [];

for (const line of referenceText.split(/\r?\n/u)) {
  const match = line.match(/^\s*-\s*(.+?)\s*\/\s*(.+?)\s*$/u);
  if (!match) continue;
  const category = match[1].trim();
  const name = match[2].trim();
  referenceItems.push({
    category,
    name,
    ref: `${category} / ${name}`,
  });
}

const categories = new Set(referenceItems.map((item) => item.category));
const embeddedRegistryItems = readEmbeddedRegistryItems(registryPath);
const samplePayload = JSON.parse(fs.readFileSync(samplePayloadPath, "utf8"));
const codexLinkPayload = JSON.parse(fs.readFileSync(codexLinkPayloadPath, "utf8"));

if (referenceItems.length !== 1597 || categories.size !== 34) {
  throw new Error(`Reference parse mismatch: ${referenceItems.length} sections, ${categories.size} categories.`);
}

const generated = fs
  .readFileSync(templatePath, "utf8")
  .replace("__REFERENCE_ITEMS__", JSON.stringify(referenceItems, null, 2))
  .replace("__EMBEDDED_REGISTRY_ITEMS__", JSON.stringify(embeddedRegistryItems, null, 2))
  .replace("__SAMPLE_PAYLOAD__", JSON.stringify(samplePayload, null, 2))
  .replace("__CODEX_LINK_PAYLOAD__", JSON.stringify(codexLinkPayload, null, 2));

if (process.argv.includes("--check")) {
  const existing = fs.existsSync(outputPath) ? fs.readFileSync(outputPath, "utf8") : "";
  if (existing !== generated) {
    throw new Error("code.js is out of date. Run npm run build.");
  }
  console.log(`Validated ${referenceItems.length} section references in ${categories.size} categories.`);
  process.exit(0);
}

fs.writeFileSync(outputPath, generated);
console.log(`Wrote code.js with ${referenceItems.length} section references in ${categories.size} categories.`);
console.log(`Embedded ${embeddedRegistryItems.length} registry items.`);
console.log(`Embedded sample payload from ${path.relative(root, samplePayloadPath)}.`);
console.log(`Embedded Codex Link payload from ${path.relative(root, codexLinkPayloadPath)}.`);

function readEmbeddedRegistryItems(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const registry = JSON.parse(fs.readFileSync(filePath, "utf8"));
  return Array.isArray(registry.items) ? registry.items : [];
}
