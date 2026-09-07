(function () {
  "use strict";

  function escapeHtml(value) {
    return window.escapeHtml ? window.escapeHtml(value) : String(value);
  }

  function escapeAttr(value) {
    return window.escapeAttr ? window.escapeAttr(value) : String(value);
  }

  function getProductId() {
    return new URLSearchParams(window.location.search).get("id");
  }

  function setMeta(product) {
    var config = window.SITE_CONFIG || {};
    var title = product.brand + " " + product.model + " | " + (config.name || "اليُمنى للهندسة والتجارة");
    document.title = title;

    var description = product.description;
    var descMeta = document.querySelector('meta[name="description"]');
    var ogTitle = document.querySelector('meta[property="og:title"]');
    var ogDesc = document.querySelector('meta[property="og:description"]');
    var ogImage = document.querySelector('meta[property="og:image"]');

    if (descMeta) descMeta.setAttribute("content", description);
    if (ogTitle) ogTitle.setAttribute("content", title);
    if (ogDesc) ogDesc.setAttribute("content", description);
    if (ogImage && window.absoluteUrl) {
      ogImage.setAttribute("content", window.absoluteUrl(product.image));
    }

    var canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute("href", window.absoluteUrl("product.html?id=" + encodeURIComponent(product.id)));
    }

    var jsonLd = document.createElement("script");
    jsonLd.type = "application/ld+json";
    jsonLd.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Product",
      "name": product.brand + " " + product.model,
      "brand": product.brand,
      "model": product.model,
      "image": window.absoluteUrl ? window.absoluteUrl(product.image) : product.image,
      "description": product.description,
      "offers": {
        "@type": "Offer",
        "priceSpecification": {
          "@type": "PriceSpecification",
          "priceCurrency": "EGP",
          "description": "Call For Price"
        },
        "availability": "https://schema.org/InStock"
      }
    });
    document.head.appendChild(jsonLd);
  }

  function redirectToNotFound() {
    window.location.replace("product-not-found.html");
  }

  function renderProduct(products) {
    var id = getProductId();
    if (!id) {
      redirectToNotFound();
      return;
    }

    var product = products.find(function (item) { return item.id === id; });
    if (!product) {
      redirectToNotFound();
      return;
    }

    var detail = document.getElementById("productDetail");
    var related = document.getElementById("relatedProducts");
    if (!detail) return;

    setMeta(product);

    var label = product.brand + " " + product.model;
    detail.innerHTML = [
      '<div class="detail-media reveal"><img loading="eager" decoding="async" src="' + escapeAttr(product.image) + '" alt="' + escapeAttr(label) + '"></div>',
      '<article class="detail-content reveal delay-1">',
      '<p class="eyebrow">' + escapeHtml(product.brand) + "</p>",
      "<h1>" + escapeHtml(product.model) + "</h1>",
      "<p>" + escapeHtml(product.description) + "</p>",
      '<div class="price">' + escapeHtml(product.price) + "</div>",
      '<ul class="spec-list">',
      product.specs.map(function (spec) { return "<li>" + escapeHtml(spec) + "</li>"; }).join(""),
      "</ul>",
      '<a class="btn btn-whatsapp" href="' + escapeAttr(window.whatsAppUrl(product)) + '" target="_blank" rel="noopener noreferrer">استفسار عبر واتساب</a>',
      "</article>"
    ].join("");

    if (related) {
      var relatedProducts = products.filter(function (item) {
        return item.brand === product.brand && item.id !== product.id;
      }).slice(0, 3);
      related.innerHTML = relatedProducts.map(window.productCard).join("");
      if (window.observeReveals) window.observeReveals(related);
    }

    if (window.observeReveals) window.observeReveals(detail);
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (typeof window.whenCatalogReady !== "function") {
      redirectToNotFound();
      return;
    }
    window.whenCatalogReady(renderProduct);
  });
}());
