#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const products = JSON.parse(fs.readFileSync(path.join(root, "data", "products.json"), "utf8"));
const configPath = path.join(root, "js", "config.js");
const configSource = fs.readFileSync(configPath, "utf8");
const siteUrlMatch = configSource.match(/siteUrl:\s*"([^"]+)"/);
const base = (siteUrlMatch && siteUrlMatch[1] || "https://alyomna.com").replace(/\/$/, "");

const staticPages = [
  { file: "index.html", priority: "1.0" },
  { file: "products.html", priority: "0.8" },
  { file: "brands.html", priority: "0.8" },
  { file: "about.html", priority: "0.8" },
  { file: "contact.html", priority: "0.8" }
];

const urls = staticPages.map(function (page) {
  return [
    "  <url>",
    "    <loc>" + base + "/" + page.file + "</loc>",
    "    <changefreq>weekly</changefreq>",
    "    <priority>" + page.priority + "</priority>",
    "  </url>"
  ].join("\n");
});

products.forEach(function (product) {
  urls.push([
    "  <url>",
    "    <loc>" + base + "/product.html?id=" + encodeURIComponent(product.id) + "</loc>",
    "    <changefreq>monthly</changefreq>",
    "    <priority>0.6</priority>",
    "  </url>"
  ].join("\n"));
});

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  urls.join("\n"),
  "</urlset>",
  ""
].join("\n");

fs.writeFileSync(path.join(root, "sitemap.xml"), xml, "utf8");
console.log("Generated sitemap with", urls.length, "URLs");
