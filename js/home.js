(function () {
  "use strict";
  var esc = window.escapeHtml;

  window.whenCatalogReady(function (products) {
    document.querySelectorAll("[data-count]").forEach(function (el) {
      var n = window.kindCount(products, el.getAttribute("data-count"));
      el.textContent = n + " جهاز";
    });

    var order = window.BRAND_ORDER;
    var featured = order.map(function (brand) {
      var list = products.filter(function (p) { return p.brand === brand; });
      var mfp = list.filter(function (p) { return p.kind === "mfp"; });
      var pool = mfp.length ? mfp : list;
      return pool.slice().sort(function (a, b) { return (b.speed || 0) - (a.speed || 0); })[0];
    }).filter(Boolean);
    document.getElementById("featuredGrid").innerHTML = featured.map(window.productCard).join("");

    document.getElementById("brandRow").innerHTML = order.map(function (brand) {
      var n = products.filter(function (p) { return p.brand === brand; }).length;
      return '<a href="products.html?brand=' + encodeURIComponent(brand) + '"><strong>' + esc(brand) + "</strong><span>" + n + " جهاز</span></a>";
    }).join("");
  });
}());
