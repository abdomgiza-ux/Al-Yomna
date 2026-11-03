(function () {
  "use strict";
  var esc = window.escapeHtml;
  window.whenCatalogReady(function (products) {
    document.getElementById("brandBlocks").innerHTML = window.BRAND_ORDER.map(function (b) {
      var list = products.filter(function (p) { return p.brand === b; });
      return '<section class="brand-block"><header><h2>' + esc(b) + "</h2>" +
        '<a class="more" href="products.html?brand=' + encodeURIComponent(b) + '">' + list.length + " جهاز في الكتالوج</a></header>" +
        '<div class="brand-models">' + list.map(function (p) {
          return '<a href="product.html?id=' + encodeURIComponent(p.id) + '">' + esc(p.model) + "</a>";
        }).join("") + "</div></section>";
    }).join("");
  });
}());
