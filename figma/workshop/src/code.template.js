const REFERENCE_ITEMS = __REFERENCE_ITEMS__;
const EMBEDDED_REGISTRY_ITEMS = __EMBEDDED_REGISTRY_ITEMS__;
const DEFAULT_RECIPE = __SAMPLE_PAYLOAD__;
const CODEX_LINK_PAYLOAD = __CODEX_LINK_PAYLOAD__;

const registryItems = EMBEDDED_REGISTRY_ITEMS;
const referencesByCategory = groupReferencesByCategory(REFERENCE_ITEMS);

figma.showUI(__html__, { width: 520, height: 380 });

figma.ui.onmessage = (message) => {
  if (!message || typeof message !== "object") return;

  if (message.type === "ready") {
    figma.ui.postMessage({
      type: "ready",
      recipe: DEFAULT_RECIPE,
      registryCount: registryItems.length,
      referenceCount: REFERENCE_ITEMS.length,
    });
    return;
  }

  if (message.type === "assemble-json") {
    assembleFromJson(String(message.recipeJson || ""))
      .then((result) => {
        figma.ui.postMessage({ type: "assemble-complete", result });
      })
      .catch((error) => {
        figma.ui.postMessage({ type: "assemble-error", message: readError(error) });
      });
    return;
  }

  if (message.type === "external-wire") {
    assembleRecipe(CODEX_LINK_PAYLOAD)
      .then((result) => {
        figma.ui.postMessage({ type: "codex-link-complete", result });
      })
      .catch((error) => {
        figma.ui.postMessage({ type: "codex-link-error", message: readError(error) });
      });
  }
};

async function assembleFromJson(recipeJson) {
  const recipe = parseRecipe(recipeJson);
  return assembleRecipe(recipe);
}

async function assembleRecipe(recipe) {
  const resolvedSections = resolveRecipeSections(recipe);
  const pageTitle = cleanString(recipe.pageName) || cleanString(recipe.title) || "Assembled Page";
  const spacing = readSpacing(recipe.spacing);

  const missing = resolvedSections.filter((section) => !section.registryItem);
  if (missing.length) {
    throw new Error(`Missing registry keys: ${missing.map((section) => section.ref).join(", ")}`);
  }

  const wrapper = figma.createFrame();
  wrapper.name = pageTitle;
  wrapper.layoutMode = "VERTICAL";
  wrapper.itemSpacing = spacing;
  wrapper.paddingTop = 0;
  wrapper.paddingRight = 0;
  wrapper.paddingBottom = 0;
  wrapper.paddingLeft = 0;
  wrapper.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
  wrapper.resize(1440, 100);
  trySet(wrapper, "counterAxisSizingMode", "FIXED");
  trySet(wrapper, "primaryAxisSizingMode", "AUTO");
  wrapper.x = figma.viewport.center.x - 720;
  wrapper.y = figma.viewport.center.y - 360;

  const importedByKey = new Map();
  const sectionNames = [];

  for (let index = 0; index < resolvedSections.length; index += 1) {
    const section = resolvedSections[index];
    const instance = await createInstanceForRegistryItem(section.registryItem, importedByKey);
    instance.name = `${String(index + 1).padStart(2, "0")} ${section.ref}`;
    wrapper.appendChild(instance);
    trySet(instance, "layoutAlign", "STRETCH");
    trySet(instance, "layoutSizingHorizontal", "FILL");
    sectionNames.push(instance.name);
  }

  figma.currentPage.selection = [wrapper];
  figma.viewport.scrollAndZoomIntoView([wrapper]);
  figma.notify(`Assembled ${sectionNames.length} sections.`);

  return {
    pageName: wrapper.name,
    sectionCount: sectionNames.length,
    sections: sectionNames,
    width: wrapper.width,
    height: wrapper.height,
  };
}

function parseRecipe(recipeJson) {
  let recipe;
  try {
    recipe = JSON.parse(recipeJson);
  } catch (error) {
    throw new Error(`Invalid JSON: ${readError(error)}`);
  }

  if (!recipe || typeof recipe !== "object" || Array.isArray(recipe)) {
    throw new Error("Recipe must be a JSON object.");
  }

  if (!Array.isArray(recipe.sections) || recipe.sections.length === 0) {
    throw new Error("Recipe must include a non-empty sections array.");
  }

  return recipe;
}

function resolveRecipeSections(recipe) {
  return recipe.sections.map((section, index) => {
    const ref = resolveSectionRef(section);
    return {
      order: index,
      ref,
      registryItem: findRegistryItem(ref),
    };
  });
}

function resolveSectionRef(section) {
  if (typeof section === "string") {
    const canonical = canonicalReference(section);
    return canonical ? canonical.ref : stripLayerPrefix(section);
  }

  if (!section || typeof section !== "object") {
    throw new Error("Each section must be a string or an object.");
  }

  if (cleanString(section.ref)) {
    const canonical = canonicalReference(section.ref);
    return canonical ? canonical.ref : stripLayerPrefix(section.ref);
  }

  const category = canonicalRecipeCategory(section.category);
  if (!category) {
    throw new Error(`Unknown category: ${String(section.category || "")}`);
  }

  if (cleanString(section.name)) {
    const canonical = canonicalReference(`${category} / ${section.name}`);
    if (!canonical) throw new Error(`Unknown section: ${category} / ${section.name}`);
    return canonical.ref;
  }

  const selection = readPositiveInteger(section.selection);
  if (!selection) {
    throw new Error(`Missing positive selection for category: ${category}`);
  }

  const items = referencesByCategory[category] || [];
  const selected = items[selection - 1];
  if (!selected) {
    throw new Error(`${category} has ${items.length} sections; selection ${selection} is unavailable.`);
  }
  return selected.ref;
}

async function createInstanceForRegistryItem(item, importedByKey) {
  let componentLike = importedByKey.get(item.key);

  if (!componentLike) {
    componentLike =
      item.kind === "componentSet"
        ? await figma.importComponentSetByKeyAsync(item.key)
        : await figma.importComponentByKeyAsync(item.key);
    importedByKey.set(item.key, componentLike);
  }

  return componentLike.type === "COMPONENT_SET"
    ? componentLike.defaultVariant.createInstance()
    : componentLike.createInstance();
}

function findRegistryItem(ref) {
  const key = normalizeKey(ref);
  const item = registryItems.find((candidate) => normalizeKey(candidate.ref) === key);
  return item || null;
}

function groupReferencesByCategory(items) {
  const groups = {};
  for (const item of items) {
    if (!groups[item.category]) groups[item.category] = [];
    groups[item.category].push(item);
  }
  return groups;
}

function canonicalReference(raw) {
  const cleaned = stripLayerPrefix(String(raw || ""))
    .trim()
    .replace(/\s*\/\s*$/u, "");

  const direct = REFERENCE_ITEMS.find((item) => normalizeKey(item.ref) === normalizeKey(cleaned));
  if (direct) return direct;

  const parts = cleaned.split("/").map((part) => part.trim()).filter(Boolean);
  if (parts.length < 2) return null;

  const category = canonicalRecipeCategory(parts[0]);
  const numberMatch = parts[1].match(/\d+/u);
  if (!category || !numberMatch) return null;

  const number = numberMatch[0];
  const sectionBase = titleCaseWords(parts[0]);
  const candidates = [
    `${category} / Header ${number}`,
    `${category} / Navbar ${number}`,
    `${category} / Layout ${number}`,
    `${category} / CTA ${number}`,
    `${category} / Footer ${number}`,
    `${category} / Logo ${number}`,
    `${category} / Testimonial ${number}`,
    `${category} / ${sectionBase} ${number}`,
    `${category} / ${parts[1].replace(/\s*\/\s*$/u, "")}`,
  ];

  for (const candidate of candidates) {
    const item = REFERENCE_ITEMS.find((entry) => normalizeKey(entry.ref) === normalizeKey(candidate));
    if (item) return item;
  }

  return null;
}

function canonicalRecipeCategory(value) {
  const key = normalizeKey(value);
  const aliases = {
    banner: "Banners",
    banners: "Banners",
    blog: "Blog-Sections",
    blogs: "Blog-Sections",
    career: "Careers",
    careers: "Careers",
    contact: "Contact",
    cta: "CTA",
    faq: "FAQ",
    faqs: "FAQ",
    feature: "Features",
    features: "Features",
    layout: "Features",
    layouts: "Features",
    footer: "Footers",
    footers: "Footers",
    gallery: "Gallery",
    galleries: "Gallery",
    header: "Navbars",
    headers: "Hero-Headers",
    hero: "Hero-Headers",
    heroes: "Hero-Headers",
    navbar: "Navbars",
    navbars: "Navbars",
    nav: "Navbars",
    logo: "Logos",
    logos: "Logos",
    pricing: "Pricing",
    stat: "Stat-Sections",
    stats: "Stat-Sections",
    team: "Team",
    testimonial: "Testimonials",
    testimonials: "Testimonials",
    timeline: "Timelines",
    timelines: "Timelines",
  };

  const direct = REFERENCE_ITEMS.find((item) => normalizeKey(item.category) === key);
  return direct ? direct.category : aliases[key] || "";
}

function trySet(node, prop, value) {
  try {
    node[prop] = value;
  } catch (_error) {
    // Some node/layout combinations do not expose every auto-layout property.
  }
}

function cleanString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function readPositiveInteger(value) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : 0;
}

function readSpacing(value) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : 0;
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

function readError(error) {
  return error instanceof Error ? error.message : String(error);
}
