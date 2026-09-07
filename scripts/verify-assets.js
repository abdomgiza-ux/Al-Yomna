#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { readJson } = require("./json-utils");

const root = path.join(__dirname, "..");

function listFilesRecursive(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push.apply(out, listFilesRecursive(full));
    else if (/\.(jpe?g|png|webp|gif|svg)$/i.test(entry.name)) out.push(full);
  }
  return out;
}

function basenameNoExt(p) {
  return path.basename(p, path.extname(p)).toLowerCase();
}

function toAssetPath(file) {
  return file.replace(/\\/g, "/").replace(/^.*?(assets\/)/, "assets/");
}

const diskFiles = listFilesRecursive(path.join(root, "assets"));
const diskByBasename = new Map();
diskFiles.forEach(function (file) {
  const key = basenameNoExt(file);
  if (!diskByBasename.has(key)) diskByBasename.set(key, []);
  diskByBasename.get(key).push(toAssetPath(file));
});

const refs = new Set();
function addRef(ref) {
  refs.add(ref.replace(/^\//, ""));
}

const products = readJson(path.join(root, "data", "products.json"));
products.forEach(function (p) { addRef(p.image); });

const patterns = [
  /assets\/(?:products|hero|brand)\/[A-Za-z0-9._-]+\.(?:jpe?g|png|webp|gif)/g
];
["index.html", "products.html", "product.html", "brands.html", "about.html", "contact.html", "404.html", "product-not-found.html", "css/style.css"].forEach(function (file) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) return;
  const text = fs.readFileSync(full, "utf8");
  patterns.forEach(function (pattern) {
    const matches = text.match(pattern) || [];
    matches.forEach(addRef);
  });
});

const missing = [];
const caseMismatch = [];
const extensionMismatch = [];
let resolvedExact = 0;

refs.forEach(function (ref) {
  const full = path.join(root, ref.replace(/\//g, path.sep));
  if (fs.existsSync(full)) {
    resolvedExact += 1;
    return;
  }

  const base = basenameNoExt(ref);
  const candidates = diskByBasename.get(base) || [];
  if (!candidates.length) {
    missing.push(ref);
    return;
  }

  const exactCasePath = candidates.find(function (c) {
    return c.split("/").pop() === ref.split("/").pop();
  });
  if (exactCasePath && exactCasePath !== ref) {
    caseMismatch.push({ ref: ref, found: exactCasePath });
    return;
  }

  extensionMismatch.push({ ref: ref, found: candidates[0] });
});

const referencedBasenames = new Set(Array.from(refs).map(basenameNoExt));
const unused = diskFiles
  .map(toAssetPath)
  .filter(function (f) { return !referencedBasenames.has(basenameNoExt(f)); });

const report = {
  diskImageCount: diskFiles.length,
  referenceCount: refs.size,
  resolvedExact: resolvedExact,
  missing: missing.sort(),
  caseMismatch: caseMismatch,
  extensionMismatch: extensionMismatch,
  unused: unused.sort()
};

console.log(JSON.stringify(report, null, 2));

if (missing.length || caseMismatch.length || extensionMismatch.length) {
  process.exitCode = 1;
}
