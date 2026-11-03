(function () {
  "use strict";

  var ids = ["q", "brand"];
  var radios = ["kind", "format", "color"];

  function radio(name) {
    var el = document.querySelector('input[name="' + name + '"]:checked');
    return el ? el.value : "";
  }

  function setRadio(name, value) {
    var el = document.querySelector('input[name="' + name + '"][value="' + (value || "").replace(/"/g, "") + '"]');
    (el || document.querySelector('input[name="' + name + '"][value=""]')).checked = true;
  }

  window.whenCatalogReady(function (products) {
    var grid = document.getElementById("productsGrid");
    var empty = document.getElementById("empty");
    var count = document.getElementById("count");
    var brandSel = document.getElementById("brand");
    var q = document.getElementById("q");

    window.BRAND_ORDER.forEach(function (b) {
      var o = document.createElement("option");
      o.value = b;
      o.textContent = b + " (" + products.filter(function (p) { return p.brand === b; }).length + ")";
      brandSel.appendChild(o);
    });

    var params = new URLSearchParams(location.search);
    q.value = params.get("q") || "";
    brandSel.value = params.get("brand") || "";
    radios.forEach(function (r) { setRadio(r, params.get(r)); });

    function render() {
      var term = q.value.trim().toLowerCase().replace(/\s+/g, " ");
      var f = { brand: brandSel.value, kind: radio("kind"), format: radio("format"), color: radio("color") };
      var list = products.filter(function (p) {
        if (f.brand && p.brand !== f.brand) return false;
        if (f.kind && p.kind !== f.kind) return false;
        if (f.format && p.format !== f.format) return false;
        if (f.color && p.color !== f.color) return false;
        if (term) {
          var hay = (p.name + " " + p.model + " " + p.brand + " " + p.category).toLowerCase();
          return term.split(" ").every(function (w) { return hay.indexOf(w) !== -1; });
        }
        return true;
      });
      grid.innerHTML = list.map(window.productRow).join("");
      count.textContent = list.length;
      empty.hidden = list.length > 0;

      var next = new URLSearchParams();
      if (q.value.trim()) next.set("q", q.value.trim());
      Object.keys(f).forEach(function (k) { if (f[k]) next.set(k, f[k]); });
      var qs = next.toString();
      history.replaceState(null, "", location.pathname + (qs ? "?" + qs : ""));
    }

    document.getElementById("filters").addEventListener("input", render);
    document.getElementById("filters").addEventListener("change", render);
    document.getElementById("reset").addEventListener("click", function () {
      q.value = ""; brandSel.value = "";
      radios.forEach(function (r) { setRadio(r, ""); });
      render();
    });

    var toggle = document.querySelector(".filter-toggle");
    var panel = document.getElementById("filters");
    toggle.addEventListener("click", function () {
      var open = panel.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    if (params.toString() && window.matchMedia("(max-width: 960px)").matches) {
      panel.classList.add("open");
      toggle.setAttribute("aria-expanded", "true");
    }
    render();
  });
}());
