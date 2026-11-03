(function () {
  "use strict";
  var esc = window.escapeHtml;
  var SHOW = 8;

  function tile(p) {
    return '<a class="tile" href="product.html?id=' + encodeURIComponent(p.id) + '">' +
      '<span class="tile-img"><img src="' + esc(p.image) + '" alt="" width="160" height="160" loading="lazy" decoding="async"></span>' +
      '<strong>' + esc(p.model) + "</strong>" +
      "<small>" + esc(p.format) + " · " + esc(p.color) + (p.speed ? " · " + p.speed + " ص/د" : "") + "</small></a>";
  }

  window.whenCatalogReady(function (products) {
    var order = window.BRAND_ORDER;
    document.getElementById("brandNav").innerHTML = order.map(function (b) {
      var n = products.filter(function (p) { return p.brand === b; }).length;
      return '<a href="#b-' + encodeURIComponent(b.replace(/\s/g, "-")) + '">' + esc(b) + " <span>" + n + "</span></a>";
    }).join("");

    document.getElementById("brandBlocks").innerHTML = order.map(function (b) {
      var list = products.filter(function (p) { return p.brand === b; });
      var top = list.slice().sort(function (x, y) {
        return (x.kind === "mfp" ? 0 : 1) - (y.kind === "mfp" ? 0 : 1) || (y.speed || 0) - (x.speed || 0);
      }).slice(0, SHOW);
      var more = list.length > SHOW;
      return '<section class="brand-block" id="b-' + encodeURIComponent(b.replace(/\s/g, "-")) + '">' +
        "<header><h2>" + esc(b) + "</h2><span>" + list.length + " جهاز</span></header>" +
        '<div class="tiles">' + top.map(tile).join("") + "</div>" +
        '<p class="brand-more"><a class="btn btn-out btn-sm" href="products.html?brand=' + encodeURIComponent(b) + '">' +
        (more ? "كل أجهزة " + esc(b) + " (" + list.length + ")" : "افتح في الكتالوج") + "</a></p></section>";
    }).join("");
  });
}());
