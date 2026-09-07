(function () {
  "use strict";

  var catalogPromise = null;

  function sortProducts(products) {
    var order = (window.SITE_CONFIG && window.SITE_CONFIG.brandOrder) || [];
    return products.slice().sort(function (a, b) {
      var brandDiff = order.indexOf(a.brand) - order.indexOf(b.brand);
      return brandDiff || a.model.localeCompare(b.model, "en", { numeric: true });
    });
  }

  function loadCatalog() {
    if (!catalogPromise) {
      catalogPromise = fetch("data/products.json", { cache: "default" })
        .then(function (response) {
          if (!response.ok) {
            throw new Error("Failed to load product catalog (" + response.status + ")");
          }
          return response.json();
        })
        .then(function (data) {
          window.PRODUCTS = sortProducts(Array.isArray(data) ? data : []);
          window.BRAND_ORDER = window.SITE_CONFIG.brandOrder;
          if (window.SITE_CONFIG) {
            window.SITE_CONFIG.productCount = window.PRODUCTS.length;
          }
          document.dispatchEvent(new CustomEvent("catalog:ready", { detail: window.PRODUCTS }));
          return window.PRODUCTS;
        })
        .catch(function (error) {
          console.error("[catalog]", error);
          window.PRODUCTS = [];
          window.BRAND_ORDER = (window.SITE_CONFIG && window.SITE_CONFIG.brandOrder) || [];
          document.dispatchEvent(new CustomEvent("catalog:ready", { detail: [] }));
          return [];
        });
    }
    return catalogPromise;
  }

  window.whenCatalogReady = function (callback) {
    return loadCatalog().then(function (products) {
      callback(products);
      return products;
    });
  };

  loadCatalog();
}());
