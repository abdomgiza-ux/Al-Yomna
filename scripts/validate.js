#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { readJson } = require("./json-utils");

const root = path.join(__dirname, "..");
let failed = 0;

function ok(message) {
  console.log("OK  " + message);
}

function fail(message) {
  console.error("FAIL " + message);
  failed += 1;
}

const productsPath = path.join(root, "data", "products.json");
const products = readJson(productsPath);

if (!Array.isArray(products) || products.length !== 75) {
  fail("products.json must contain 75 products, found " + products.length);
} else {
  ok("products.json has 75 products");
}

const ids = new Set();
const images = new Set();
products.forEach(function (product) {
  if (!product.id || ids.has(product.id)) {
    fail("duplicate or missing product id: " + product.id);
  }
  ids.add(product.id);
  if (!product.image || !/^assets\/products\/.+\.(?:png|jpe?g|webp)$/i.test(product.image)) {
    fail("invalid image path for " + product.id + ": " + product.image);
  }
  const imagePath = path.join(root, product.image.replace(/\//g, path.sep));
  if (!fs.existsSync(imagePath)) {
    fail("missing image file for " + product.id + ": " + product.image);
  }
  if (images.has(product.image.toLowerCase())) {
    fail("duplicate image path: " + product.image);
  }
  images.add(product.image.toLowerCase());
});
ok("product ids and image paths match files on disk");

const brandLogo = path.join(root, "assets", "brand", "logo.jpg");
if (!fs.existsSync(brandLogo)) {
  fail("missing assets/brand/logo.jpg");
} else {
  ok("brand logo exists at assets/brand/logo.jpg");
}

const requiredFiles = [
  "index.html",
  "products.html",
  "product.html",
  "product-not-found.html",
  "404.html",
  "robots.txt",
  "sitemap.xml",
  "favicon.svg",
  "js/config.js",
  "js/escape.js",
  "js/products.js",
  "js/app.js",
  "js/product.js"
];

requiredFiles.forEach(function (file) {
  if (!fs.existsSync(path.join(root, file))) {
    fail("missing required file: " + file);
  }
});
ok("required project files exist");

const sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
if ((sitemap.match(/<url>/g) || []).length !== 80) {
  fail("sitemap.xml should contain 80 URLs");
} else {
  ok("sitemap.xml contains 80 URLs");
}

if (failed) {
  process.exitCode = 1;
  console.error("\nValidation failed with " + failed + " issue(s).");
} else {
  console.log("\nAll validation checks passed.");
}
