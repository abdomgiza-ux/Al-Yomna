(function () {
  "use strict";
  var esc = window.escapeHtml;

  function notFound() { location.replace("product-not-found.html"); }

  function setMeta(p) {
    var title = p.name + " | " + window.SITE_CONFIG.name;
    document.title = title;
    function set(sel, val) { var el = document.querySelector(sel); if (el) el.setAttribute("content", val); }
    set('meta[name="description"]', p.description);
    set('meta[property="og:title"]', title);
    set('meta[property="og:description"]', p.description);
    set('meta[property="og:image"]', window.absoluteUrl(p.image));
    var url = window.absoluteUrl("product.html?id=" + encodeURIComponent(p.id));
    var link = document.createElement("link");
    link.rel = "canonical"; link.href = url;
    document.head.appendChild(link);
    var ld = document.createElement("script");
    ld.type = "application/ld+json";
    ld.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Product",
      name: p.name,
      brand: { "@type": "Brand", name: p.brand },
      model: p.model,
      image: window.absoluteUrl(p.image),
      description: p.description,
      url: url
    });
    document.head.appendChild(ld);
  }

  function specRows(specs) {
    return specs.map(function (s) {
      var i = s.indexOf(":");
      if (i === -1) return "<tr><th>ميزة</th><td>" + esc(s) + "</td></tr>";
      return "<tr><th>" + esc(s.slice(0, i).trim()) + "</th><td>" + esc(s.slice(i + 1).trim()) + "</td></tr>";
    }).join("");
  }

  window.whenCatalogReady(function (products) {
    var id = new URLSearchParams(location.search).get("id");
    var p = products.filter(function (x) { return x.id === id; })[0];
    if (!p) return notFound();
    setMeta(p);
    document.getElementById("crumb").textContent = p.name;

    document.getElementById("detail").innerHTML =
      '<div class="detail-media"><img src="' + esc(p.image) + '" alt="' + esc(p.name) + '" width="600" height="600"></div>' +
      "<div>" +
      '<span class="detail-brand">' + esc(p.brand) + "</span>" +
      "<h1>" + esc(p.model) + "</h1>" +
      '<ul class="tags">' + window.productTags(p).map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul>" +
      '<p class="detail-text">' + esc(p.description) + "</p>" +
      '<div class="price-box"><div><strong>السعر عند الطلب</strong><small>نرد عليك بالسعر والتوفر على واتساب</small></div>' +
      '<a class="btn btn-wa" href="' + esc(window.whatsAppUrl(p)) + '" target="_blank" rel="noopener noreferrer">اسأل عن السعر</a></div>' +
      '<table class="spec-table"><caption>المواصفات</caption><tbody>' + specRows(p.specs) + "</tbody></table>" +
      '<p class="spec-note">المواصفات حسب بيانات الشركة المصنّعة وقد تختلف قليلًا حسب الإصدار والملحقات. أكّد معنا قبل الشراء.</p>' +
      "</div>";

    var rel = products.filter(function (x) { return x.brand === p.brand && x.id !== p.id && x.kind === p.kind; }).slice(0, 4);
    if (rel.length) {
      document.getElementById("related").innerHTML = rel.map(window.productCard).join("");
      document.getElementById("relWrap").hidden = false;
    }
  });
}());
