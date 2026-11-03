(function () {
  "use strict";

  var cfg = window.SITE_CONFIG;
  var esc = window.escapeHtml;

  window.absoluteUrl = function (path) {
    return cfg.siteUrl.replace(/\/$/, "") + "/" + String(path).replace(/^\//, "");
  };

  window.whatsAppUrl = function (product) {
    var text = product
      ? "السلام عليكم، عايز أسأل عن سعر وتوفر: " + product.name
      : "السلام عليكم، عايز أستفسر عن أجهزة التصوير والطابعات.";
    return "https://wa.me/" + cfg.whatsapp + "?text=" + encodeURIComponent(text);
  };

  window.productTags = function (p) {
    var tags = [p.kind === "mfp" ? "تصوير وطباعة ومسح" : "طباعة فقط", p.format, p.color];
    if (p.speed) tags.push(p.speed + " صفحة/د");
    return tags;
  };

  window.productCard = function (p) {
    var href = "product.html?id=" + encodeURIComponent(p.id);
    return '<article class="card">' +
      '<a class="card-media" href="' + href + '" tabindex="-1" aria-hidden="true"><img src="' + esc(p.image) + '" alt="" loading="lazy" decoding="async"></a>' +
      '<div class="card-body">' +
      '<span class="card-brand">' + esc(p.brand) + "</span>" +
      '<h3><a href="' + href + '">' + esc(p.model) + "</a></h3>" +
      '<ul class="tags">' + window.productTags(p).map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul>" +
      '<div class="card-actions"><a class="btn btn-wa btn-sm" href="' + esc(window.whatsAppUrl(p)) + '" target="_blank" rel="noopener noreferrer">اسأل عن السعر</a></div>' +
      "</div></article>";
  };

  window.kindCount = function (products, key) {
    return products.filter(function (p) {
      if (key === "mfp-A3-color") return p.kind === "mfp" && p.format === "A3" && p.color === "ألوان";
      if (key === "mfp-A3-bw") return p.kind === "mfp" && p.format === "A3" && p.color !== "ألوان";
      if (key === "mfp-A4") return p.kind === "mfp" && p.format === "A4";
      if (key === "prn") return p.kind === "prn";
      return false;
    }).length;
  };

  document.addEventListener("DOMContentLoaded", function () {
    var btn = document.querySelector(".menu-btn");
    var nav = document.getElementById("nav");
    if (btn && nav) {
      btn.addEventListener("click", function () {
        var open = nav.classList.toggle("open");
        btn.setAttribute("aria-expanded", String(open));
      });
    }
  });
}());
