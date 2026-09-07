(function () {
  "use strict";

  var config = window.SITE_CONFIG || {};
  var products = [];
  var brands = config.brandOrder || [];

  function $(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function $all(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return window.escapeHtml ? window.escapeHtml(value) : String(value);
  }

  function escapeAttr(value) {
    return window.escapeAttr ? window.escapeAttr(value) : String(value);
  }

  function absoluteUrl(path) {
    var base = (config.siteUrl || "").replace(/\/$/, "");
    var normalized = String(path || "").replace(/^\//, "");
    return base ? base + "/" + normalized : normalized;
  }

  function whatsAppUrl(product) {
    var message = product
      ? "مرحباً، أريد الاستفسار عن " + product.brand + " " + product.model
      : "مرحباً، أريد الاستفسار عن خدمات " + (config.name || "اليُمنى للهندسة والتجارة");
    return "https://wa.me/" + config.whatsapp + "?text=" + encodeURIComponent(message);
  }

  function productCard(product) {
    var label = product.brand + " " + product.model;
    return [
      '<article class="product-card reveal">',
      '<a class="product-media" href="product.html?id=' + escapeAttr(product.id) + '" aria-label="' + escapeAttr(label) + '">',
      '<img loading="lazy" decoding="async" src="' + escapeAttr(product.image) + '" alt="' + escapeAttr(label) + '">',
      '<span class="quick-preview"><span>معاينة المنتج</span><span>' + escapeHtml(product.price) + "</span></span>",
      "</a>",
      '<div class="product-body">',
      '<div class="product-kicker"><span class="pill">' + escapeHtml(product.brand) + '</span><span>' + escapeHtml(product.category) + "</span></div>",
      "<h3>" + escapeHtml(label) + "</h3>",
      "<p>" + escapeHtml(product.description) + "</p>",
      '<div class="price">' + escapeHtml(product.price) + "</div>",
      '<div class="card-actions">',
      '<a class="btn btn-outline" href="product.html?id=' + escapeAttr(product.id) + '">التفاصيل</a>',
      '<a class="btn btn-whatsapp" href="' + escapeAttr(whatsAppUrl(product)) + '" target="_blank" rel="noopener noreferrer">استفسار</a>',
      "</div>",
      "</div>",
      "</article>"
    ].join("");
  }

  function currentPageName() {
    var path = location.pathname.split("/").pop();
    return !path ? "index.html" : path;
  }

  function setActiveNav() {
    var current = currentPageName();
    $all(".main-nav a").forEach(function (link) {
      var href = link.getAttribute("href") || "";
      var isHome = (current === "index.html") && (href === "index.html" || href === "./" || href === "/");
      if (href === current || isHome) {
        link.classList.add("active");
      }
    });
  }

  function closeNav() {
    var nav = $(".main-nav");
    var toggle = $(".nav-toggle");
    if (!nav || !nav.classList.contains("open")) return;
    nav.classList.remove("open");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
  }

  function initNav() {
    var toggle = $(".nav-toggle");
    var nav = $(".main-nav");
    if (!toggle || !nav) return;

    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    $all(".main-nav a").forEach(function (link) {
      link.addEventListener("click", closeNav);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeNav();
    });

    document.addEventListener("click", function (event) {
      if (!nav.classList.contains("open")) return;
      if (nav.contains(event.target) || toggle.contains(event.target)) return;
      closeNav();
    });
  }

  function initSiteLinks() {
    if (!config.whatsapp) return;
    $all('a[href*="wa.me/"]').forEach(function (link) {
      var href = link.getAttribute("href") || "";
      var textMatch = href.match(/[?&]text=([^&]*)/);
      var text = textMatch ? decodeURIComponent(textMatch[1]) : "";
      link.setAttribute("href", "https://wa.me/" + config.whatsapp + (text ? "?text=" + encodeURIComponent(text) : ""));
      link.setAttribute("rel", "noopener noreferrer");
    });
    $all('a[href^="tel:"]').forEach(function (link) {
      if (config.phone) link.setAttribute("href", "tel:" + config.phone);
      if (config.phoneDisplay && link.textContent.trim().match(/^\+?\d/)) {
        link.textContent = config.phoneDisplay;
      }
    });
    $all("[data-whatsapp-display]").forEach(function (node) {
      if (config.whatsapp) node.textContent = config.whatsapp;
    });
  }

  function initSkipLink() {
    if ($(".skip-link")) return;
    var main = document.querySelector("main");
    if (!main) return;
    if (!main.id) main.id = "main-content";
    var link = document.createElement("a");
    link.className = "skip-link";
    link.href = "#main-content";
    link.textContent = "تخطي إلى المحتوى";
    document.body.insertBefore(link, document.body.firstChild);
  }

  function initSeo() {
    if (!config.siteUrl) return;
    var canonicalHref = absoluteUrl(currentPageName());
    var canonical = $('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute("href", canonicalHref);
    } else {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      canonical.href = canonicalHref;
      document.head.appendChild(canonical);
    }

    var ogUrl = $('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute("content", canonicalHref);
    }

    var ogImage = $('meta[property="og:image"]');
    if (ogImage) {
      var imagePath = ogImage.getAttribute("content") || config.defaultOgImage || "";
      if (imagePath && !/^https?:\/\//.test(imagePath)) {
        ogImage.setAttribute("content", absoluteUrl(imagePath.replace(/^\//, "")));
      }
    }
  }

  function initFeatured() {
    var target = $("#featuredProducts");
    if (!target || !products.length) return;

    var seen = {};
    var featured = [];
    products.forEach(function (item) {
      if (featured.length >= 6 || seen[item.brand]) return;
      if (brands.indexOf(item.brand) === -1) return;
      seen[item.brand] = true;
      featured.push(item);
    });

    target.innerHTML = featured.map(productCard).join("");
    observeReveals(target);
  }

  function debounce(fn, wait) {
    var timer;
    return function () {
      var args = arguments;
      var context = this;
      clearTimeout(timer);
      timer = setTimeout(function () {
        fn.apply(context, args);
      }, wait);
    };
  }

  function initCatalog() {
    var grid = $("#productsGrid");
    if (!grid) return;

    var search = $("#searchInput");
    var brandFilter = $("#brandFilter");
    var count = $("#resultsCount");
    var empty = $("#emptyState");

    brands.forEach(function (brand) {
      if (products.some(function (product) { return product.brand === brand; })) {
        var option = document.createElement("option");
        option.value = brand;
        option.textContent = brand;
        brandFilter.appendChild(option);
      }
    });

    function render() {
      var term = (search.value || "").trim().toLowerCase();
      var brand = brandFilter.value;
      var filtered = products.filter(function (product) {
        var searchable = (
          product.brand + " " + product.model + " " + product.category + " " + product.description
        ).toLowerCase();
        return (!brand || product.brand === brand) && (!term || searchable.indexOf(term) > -1);
      });
      grid.innerHTML = filtered.map(productCard).join("");
      count.textContent = filtered.length;
      empty.hidden = filtered.length !== 0;
      observeReveals(grid);
    }

    search.addEventListener("input", debounce(render, 200));
    brandFilter.addEventListener("change", render);
    render();
  }

  function initBrands() {
    var target = $("#brandSections");
    if (!target) return;

    target.innerHTML = brands.map(function (brand) {
      var items = products.filter(function (product) { return product.brand === brand; });
      if (!items.length) return "";
      var id = brand.toLowerCase().replace(/\s+/g, "-");
      return [
        '<section class="brand-block reveal" id="' + escapeAttr(id) + '">',
        '<div class="brand-block-head"><div><p class="eyebrow">ماركة</p><h2>' + escapeHtml(brand) + '</h2></div><a class="text-link" href="products.html">عرض الكتالوج</a></div>',
        '<div class="mini-products">',
        items.map(function (product) {
          var label = product.brand + " " + product.model;
          return '<a href="product.html?id=' + escapeAttr(product.id) + '">' + escapeHtml(label) + "</a>";
        }).join(""),
        "</div>",
        "</section>"
      ].join("");
    }).join("");
    observeReveals(target);
  }

  function initCounters() {
    var counters = $all(".counter");
    if (!counters.length) return;

    counters.forEach(function (counter) {
      if (counter.classList.contains("counter-products") && config.productCount) {
        counter.setAttribute("data-count", String(config.productCount));
      }
    });

    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    function animate(counter) {
      var target = Number(counter.getAttribute("data-count") || "0");
      if (reduce || !target) {
        counter.textContent = target;
        return;
      }
      var started = performance.now();
      var duration = 1200;
      function tick(now) {
        var progress = Math.min((now - started) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        counter.textContent = Math.round(target * eased);
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }

    if (!("IntersectionObserver" in window)) {
      counters.forEach(animate);
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting || entry.target.dataset.counted) return;
        entry.target.dataset.counted = "true";
        animate(entry.target);
      });
    }, { threshold: 0.55 });
    counters.forEach(function (counter) { observer.observe(counter); });
  }

  function observeReveals(scope) {
    var items = $all(".reveal", scope || document).filter(function (item) {
      return !item.dataset.revealBound;
    });
    if (!items.length) return;

    if (!("IntersectionObserver" in window)) {
      items.forEach(function (item) { item.classList.add("is-visible"); });
      return;
    }

    var observer = window.__revealObserver;
    if (!observer) {
      observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
      window.__revealObserver = observer;
    }

    items.forEach(function (item, index) {
      item.dataset.revealBound = "true";
      if (!item.className.match(/delay-/) && index % 3) {
        item.style.transitionDelay = (index % 3) * 70 + "ms";
      }
      observer.observe(item);
    });
  }

  function initContactForm() {
    var form = $("#contactForm");
    if (!form) return;

    var nameInput = $("#contactName");
    var phoneInput = $("#contactPhone");
    var messageInput = $("#contactMessage");
    var errorBox = $("#contactFormError");

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var name = nameInput ? nameInput.value.trim() : "";
      var phone = phoneInput ? phoneInput.value.trim() : "";
      var message = messageInput ? messageInput.value.trim() : "";
      var errors = [];

      if (!phone && !message) {
        errors.push("يرجى إدخال رقم الهاتف أو كتابة رسالة.");
      }
      if (phone && !/^[\d\s+\-()]{7,20}$/.test(phone)) {
        errors.push("رقم الهاتف غير صالح.");
      }
      if (message.length > 1000) {
        errors.push("الرسالة طويلة جداً (1000 حرف كحد أقصى).");
      }

      if (errors.length) {
        if (errorBox) {
          errorBox.hidden = false;
          errorBox.textContent = errors[0];
        }
        if (phoneInput && errors[0].indexOf("الهاتف") > -1) {
          phoneInput.setAttribute("aria-invalid", "true");
          phoneInput.focus();
        } else if (messageInput) {
          messageInput.setAttribute("aria-invalid", "true");
          messageInput.focus();
        }
        return;
      }

      if (errorBox) errorBox.hidden = true;
      if (phoneInput) phoneInput.removeAttribute("aria-invalid");
      if (messageInput) messageInput.removeAttribute("aria-invalid");

      var text = "مرحباً، أريد التواصل مع " + (config.name || "اليُمنى للهندسة والتجارة");
      if (name) text += "\nالاسم: " + name;
      if (phone) text += "\nرقم الهاتف: " + phone;
      if (message) text += "\nالرسالة: " + message;
      window.open(
        "https://wa.me/" + config.whatsapp + "?text=" + encodeURIComponent(text),
        "_blank",
        "noopener,noreferrer"
      );
    });
  }

  function bootCatalogFeatures(catalog) {
    products = catalog || window.PRODUCTS || [];
    brands = window.BRAND_ORDER || config.brandOrder || [];

    if (!products.length) {
      var grid = $("#productsGrid");
      var featured = $("#featuredProducts");
      var brandsTarget = $("#brandSections");
      var message = '<p class="empty-state">تعذر تحميل كتالوج المنتجات. يرجى تحديث الصفحة أو التحقق من الاتصال.</p>';
      if (grid) grid.innerHTML = message;
      if (featured) featured.innerHTML = message;
      if (brandsTarget) brandsTarget.innerHTML = message;
      return;
    }

    initFeatured();
    initCatalog();
    initBrands();
  }

  window.productCard = productCard;
  window.whatsAppUrl = whatsAppUrl;
  window.observeReveals = observeReveals;
  window.absoluteUrl = absoluteUrl;

  document.addEventListener("DOMContentLoaded", function () {
    initSkipLink();
    setActiveNav();
    initNav();
    initSiteLinks();
    initSeo();
    initContactForm();
    initCounters();
    observeReveals(document);

    if (typeof window.whenCatalogReady === "function") {
      window.whenCatalogReady(bootCatalogFeatures);
    }
  });
}());
