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

  window.productRow = function (p) {
    var href = "product.html?id=" + encodeURIComponent(p.id);
    var colored = p.color === "ألوان";
    return '<article class="row">' +
      '<a class="row-img" href="' + href + '" tabindex="-1" aria-hidden="true"><img src="' + esc(p.image) + '" alt="" width="96" height="96" loading="lazy" decoding="async"></a>' +
      '<div class="row-title"><small>' + esc(p.brand) + "</small>" +
      '<h3><a href="' + href + '">' + esc(p.model) + "</a></h3>" +
      "<p>" + esc(p.kind === "mfp" ? "ماكينة تصوير متعددة الوظائف" : "طابعة ليزر") + "</p></div>" +
      '<div class="row-meta">' +
      '<span class="cell"><small>المقاس</small>' + esc(p.format) + "</span>" +
      '<span class="cell"><small>الطباعة</small><i class="dot' + (colored ? " col" : "") + '"></i>' + esc(p.color) + "</span>" +
      '<span class="cell"><small>السرعة</small>' + (p.speed ? p.speed + " صفحة/د" : "—") + "</span>" +
      "</div>" +
      '<div class="row-act"><a class="btn btn-out btn-sm" href="' + href + '">المواصفات</a>' +
      '<a class="btn btn-wa btn-sm" href="' + esc(window.whatsAppUrl(p)) + '" target="_blank" rel="noopener noreferrer">اسأل عن السعر</a></div>' +
      "</article>";
  };
  window.productCard = window.productRow;

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
