const REFERENCE_ITEMS = __REFERENCE_ITEMS__;
const EMBEDDED_REGISTRY_ITEMS = __EMBEDDED_REGISTRY_ITEMS__;
const DEFAULT_RECIPE = __SAMPLE_PAYLOAD__;
const CODEX_LINK_PAYLOAD = __CODEX_LINK_PAYLOAD__;
const BUILD_LABEL = "copy-diagnostics-v1";

const registryItems = EMBEDDED_REGISTRY_ITEMS;
const referencesByCategory = groupReferencesByCategory(REFERENCE_ITEMS);

figma.showUI(__html__, { width: 560, height: 520 });

figma.ui.onmessage = (message) => {
  if (!message || typeof message !== "object") return;

  if (message.type === "ready") {
    figma.ui.postMessage({
      type: "ready",
      recipe: DEFAULT_RECIPE,
      registryCount: registryItems.length,
      referenceCount: REFERENCE_ITEMS.length,
      buildLabel: BUILD_LABEL,
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
  const copyResults = [];

  for (let index = 0; index < resolvedSections.length; index += 1) {
    const section = resolvedSections[index];
    const instance = await createInstanceForRegistryItem(section.registryItem, importedByKey);
    instance.name = `${String(index + 1).padStart(2, "0")} ${section.ref}`;
    wrapper.appendChild(instance);
    trySet(instance, "layoutAlign", "STRETCH");
    trySet(instance, "layoutSizingHorizontal", "FILL");
    const copyResult = await applySectionCopy(instance, section.source.copy);
    sectionNames.push(instance.name);
    copyResults.push(copyResult);
  }

  figma.currentPage.selection = [wrapper];
  figma.viewport.scrollAndZoomIntoView([wrapper]);
  const copyOverrideCount = copyResults.reduce((total, result) => total + result.applied, 0);
  const copyWarningCount = copyResults.reduce((total, result) => total + result.warnings.length, 0);
  const copySummary = copyOverrideCount ? ` with ${copyOverrideCount} copy override${copyOverrideCount === 1 ? "" : "s"}` : "";
  const warningSummary = copyWarningCount ? ` (${copyWarningCount} copy diagnostic${copyWarningCount === 1 ? "" : "s"})` : "";
  figma.notify(`Assembled ${sectionNames.length} sections${copySummary}${warningSummary}.`);

  return {
    pageName: wrapper.name,
    sectionCount: sectionNames.length,
    sections: sectionNames,
    copyOverrideCount,
    copyDiagnostics: copyResults.flatMap((result) => result.warnings),
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
    const directRegistryItem = resolveRegistryItem(section);
    const ref = directRegistryItem ? directRegistryItem.ref : resolveSectionRef(section);
    return {
      order: index,
      ref,
      registryItem: directRegistryItem || findRegistryItem(ref),
      source: typeof section === "object" && section ? section : {},
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

async function applySectionCopy(root, copy) {
  const assignments = normalizeCopyAssignments(copy);
  if (!assignments.length) return { applied: 0, warnings: [] };

  const targets = collectCopyTargets(root);
  const usedTargets = new Set();
  const warnings = [];
  let applied = 0;

  warnings.push(
    `Copy target scan for ${root.name}: ${targets.filter((target) => target.kind === "textNode").length} text node(s), ${targets.filter((target) => target.kind === "componentProperty").length} text component propert${targets.filter((target) => target.kind === "componentProperty").length === 1 ? "y" : "ies"}. First targets: ${targets.slice(0, 6).map((target) => `${target.kind}:${target.name || target.path}`).join(" | ") || "none"}.`,
  );

  for (const assignment of assignments) {
    const target = findTextTarget(targets, assignment, usedTargets);
    if (!target) {
      warnings.push(`No text target matched ${assignment.label}.`);
      continue;
    }

    try {
      await setCopyTarget(root, target, assignment.text);
      usedTargets.add(target.id);
      applied += 1;
    } catch (error) {
      warnings.push(`Could not set ${target.path}: ${readError(error)}`);
    }
  }

  return { applied, warnings };
}

async function setCopyTarget(root, target, text) {
  if (target.kind === "componentProperty") {
    root.setProperties({ [target.propertyName]: text });
    return;
  }

  await loadFontsForTextNode(target.node);
  target.node.characters = text;
}

function normalizeCopyAssignments(copy) {
  if (!copy) return [];

  if (Array.isArray(copy)) {
    return copy
      .map((entry, index) => normalizeCopyAssignment(entry, index))
      .filter(Boolean);
  }

  if (typeof copy === "object") {
    return Object.entries(copy)
      .map(([slot, text], index) => normalizeCopyAssignment({ slot, text }, index))
      .filter(Boolean);
  }

  return [];
}

function normalizeCopyAssignment(entry, index) {
  if (!entry || typeof entry !== "object") return null;

  const rawText = entry.text === undefined ? entry.value : entry.text;
  if (rawText === undefined || rawText === null) return null;

  const slot = cleanString(entry.slot) || cleanString(entry.role) || cleanString(entry.name) || cleanString(entry.path);
  const role = canonicalCopyRole(cleanString(entry.role) || cleanString(entry.slot));

  return {
    text: String(rawText),
    role,
    slot,
    name: cleanString(entry.name),
    path: cleanString(entry.path),
    contains: cleanString(entry.contains),
    index: readPositiveInteger(entry.index),
    label: slot || role || entry.index || `copy item ${index + 1}`,
  };
}

function collectCopyTargets(root) {
  return collectTextComponentProperties(root).concat(collectTextNodes(root));
}

function collectTextComponentProperties(root) {
  if (root.type !== "INSTANCE" || !root.componentProperties) return [];

  return Object.entries(root.componentProperties)
    .filter((entry) => entry[1] && entry[1].type === "TEXT")
    .map(([propertyName, property], index) => ({
      id: `componentProperty:${propertyName}`,
      kind: "componentProperty",
      propertyName,
      name: stripComponentPropertyId(propertyName),
      path: `Component property > ${propertyName}`,
      content: String(property.value || ""),
      role: inferTextRole({ name: stripComponentPropertyId(propertyName), characters: String(property.value || "") }, propertyName),
      position: index + 1,
    }));
}

function collectTextNodes(root) {
  const nodes = findTextNodes(root);
  const textNodes = [];
  let ctaCount = 0;

  for (const node of nodes) {
    const path = nodePath(node, root);
    const inferredRole = inferTextRole(node, path);
    const role = inferredRole === "cta" ? (ctaCount++ === 0 ? "primaryCta" : "secondaryCta") : inferredRole;
    textNodes.push({
      id: `textNode:${node.id}`,
      kind: "textNode",
      node,
      name: node.name,
      path,
      content: node.characters,
      role,
      position: textNodes.length + 1,
    });
  }

  return textNodes;
}

function findTextNodes(root) {
  if (typeof root.findAllWithCriteria === "function") {
    return root.findAllWithCriteria({ types: ["TEXT"] });
  }

  if (typeof root.findAll === "function") {
    return root.findAll((node) => node.type === "TEXT");
  }

  return collectTextNodesByChildren(root);
}

function collectTextNodesByChildren(root) {
  const found = [];
  walkNode(root, (node) => {
    if (node.type === "TEXT") found.push(node);
  });
  return found;
}

function walkNode(node, visit) {
  visit(node);
  if (!("children" in node)) return;
  for (const child of node.children) walkNode(child, visit);
}

function findTextTarget(targets, assignment, usedTargets) {
  if (assignment.index) return availableByIndex(targets, usedTargets, assignment.index);

  if (assignment.path) {
    const pathKey = normalizeKey(assignment.path);
    const exactPath = targets.find((item) => !usedTargets.has(item.id) && normalizeKey(item.path) === pathKey);
    if (exactPath) return exactPath;
    const partialPath = targets.find((item) => !usedTargets.has(item.id) && normalizeKey(item.path).includes(pathKey));
    if (partialPath) return partialPath;
  }

  if (assignment.name) {
    const nameKey = normalizeKey(assignment.name);
    const exactName = targets.find((item) => !usedTargets.has(item.id) && normalizeKey(item.name) === nameKey);
    if (exactName) return exactName;
  }

  if (assignment.contains) {
    const containsKey = normalizeKey(assignment.contains);
    const contentMatch = targets.find((item) => !usedTargets.has(item.id) && normalizeKey(item.content).includes(containsKey));
    if (contentMatch) return contentMatch;
  }

  if (assignment.role) {
    const roleMatch = targets.find((item) => !usedTargets.has(item.id) && item.role === assignment.role);
    if (roleMatch) return roleMatch;
  }

  if (assignment.slot) {
    const slotKey = normalizeKey(assignment.slot);
    const slotMatch = targets.find(
      (item) =>
        !usedTargets.has(item.id) &&
        (normalizeKey(item.name) === slotKey || normalizeKey(item.path).includes(slotKey) || item.role === canonicalCopyRole(slotKey)),
    );
    if (slotMatch) return slotMatch;
  }

  return null;
}

function availableByIndex(targets, usedTargets, index) {
  const available = targets.filter((item) => !usedTargets.has(item.id));
  return available[index - 1] || null;
}

function nodePath(node, stopNode) {
  const parts = [];
  let current = node;

  while (current && current !== stopNode) {
    parts.unshift(current.name);
    current = current.parent;
  }

  if (stopNode) parts.unshift(stopNode.name);
  return parts.join(" > ");
}

async function loadFontsForTextNode(node) {
  if (node.fontName && node.fontName !== figma.mixed) {
    await figma.loadFontAsync(node.fontName);
    return;
  }

  if (typeof node.getRangeAllFontNames === "function") {
    const fonts = node.getRangeAllFontNames(0, node.characters.length);
    const seen = new Set();
    for (const font of fonts) {
      const key = `${font.family}\n${font.style}`;
      if (seen.has(key)) continue;
      seen.add(key);
      await figma.loadFontAsync(font);
    }
  }
}

function inferTextRole(node, path) {
  const key = normalizeKey(`${node.name} ${path} ${node.characters}`);
  if (/eyebrow|subheading|subhead|tagline|overline|label/u.test(key)) return "eyebrow";
  if (/button|cta|action|link/u.test(key)) return "cta";
  if (/heading|headline|title|mediumlengthsectionheading/u.test(key)) return "heading";
  if (/paragraph|description|body|text|lorem|supporting/u.test(key)) return "body";
  return "";
}

function canonicalCopyRole(value) {
  const key = normalizeKey(value);
  const aliases = {
    eyebrow: "eyebrow",
    kicker: "eyebrow",
    label: "eyebrow",
    overline: "eyebrow",
    heading: "heading",
    headline: "heading",
    title: "heading",
    h1: "heading",
    h2: "heading",
    body: "body",
    text: "body",
    copy: "body",
    description: "body",
    paragraph: "body",
    primarycta: "primaryCta",
    primarybutton: "primaryCta",
    cta: "primaryCta",
    button: "primaryCta",
    secondarycta: "secondaryCta",
    secondarybutton: "secondaryCta",
  };
  return aliases[key] || "";
}

function stripComponentPropertyId(value) {
  return String(value || "").replace(/#.+$/u, "").trim();
}

function findRegistryItem(ref) {
  const key = normalizeKey(ref);
  const item = registryItems.find((candidate) => normalizeKey(candidate.ref) === key);
  return item || null;
}

function resolveRegistryItem(section) {
  if (!section || typeof section !== "object" || Array.isArray(section)) return null;
  const componentKey = cleanString(section.key);
  if (!componentKey) return null;
  return registryItems.find((candidate) => candidate.key === componentKey) || null;
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
