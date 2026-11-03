(function () {
  "use strict";
  var esc = window.escapeHtml;

  var BANDS = { 1: [0, 30], 2: [30, 45], 3: [45, 65], 4: [65, 999] };

  function initPicker(products) {
    var form = document.getElementById("picker");
    var out = document.getElementById("pickerOut");
    var note = document.getElementById("pickerNote");
    if (!form) return;
    function val(n) { return form.querySelector('input[name="' + n + '"]:checked').value; }

    function run() {
      var kind = val("pk"), color = val("pc"), fmt = val("pf"), band = BANDS[val("pv")];
      var pool = products.filter(function (p) {
        return p.kind === kind && p.color === color && p.format === fmt && p.speed;
      });
      var mid = (band[0] + Math.min(band[1], 90)) / 2;
      var inBand = pool.filter(function (p) { return p.speed >= band[0] && p.speed < band[1]; });
      var list = (inBand.length ? inBand : pool).slice().sort(function (a, b) {
        return Math.abs(a.speed - mid) - Math.abs(b.speed - mid);
      }).slice(0, 4);

      out.innerHTML = list.map(window.productRow).join("");
      var wa = window.whatsAppUrl();
      if (!list.length) {
        note.innerHTML = 'مفيش جهاز بالمواصفات دي في الكتالوج. <a href="' + wa + '" target="_blank" rel="noopener noreferrer">اسألنا على واتساب</a> ونشوف لك بديل.';
      } else if (!inBand.length) {
        note.innerHTML = 'مفيش جهاز في نطاق السرعة المناسب لحجمك بالظبط، دي أقرب الأجهزة المتاحة. <a href="' + wa + '" target="_blank" rel="noopener noreferrer">كلمنا نرشّح لك</a>.';
      } else {
        note.innerHTML = 'الترشيح حسب سرعة الجهاز وحجم الطباعة الشهري. <a href="products.html?kind=' + kind + '&format=' + fmt + '&color=' + encodeURIComponent(color) + '">شوف كل الأجهزة بنفس المواصفات</a>.';
      }
    }
    form.addEventListener("change", run);
    run();
  }

  window.whenCatalogReady(function (products) {
    initPicker(products);
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
    document.getElementById("featuredGrid").innerHTML = featured.map(window.productRow).join("");

    document.getElementById("brandRow").innerHTML = order.map(function (brand) {
      var n = products.filter(function (p) { return p.brand === brand; }).length;
      return '<a href="products.html?brand=' + encodeURIComponent(brand) + '"><strong>' + esc(brand) + "</strong><span>" + n + " جهاز</span></a>";
    }).join("");
  });
}());
