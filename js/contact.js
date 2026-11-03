(function () {
  "use strict";
  document.addEventListener("DOMContentLoaded", function () {
    var form = document.getElementById("contactForm");
    var note = document.getElementById("formNote");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.name.value.trim(), phone = form.phone.value.trim(), msg = form.message.value.trim();
      if (!name || !phone || !msg) { note.textContent = "من فضلك املأ الاسم ورقم الهاتف والرسالة."; return; }
      note.textContent = "";
      var text = "السلام عليكم، أنا " + name + "\nرقمي: " + phone + "\n" + msg;
      window.open("https://wa.me/" + window.SITE_CONFIG.whatsapp + "?text=" + encodeURIComponent(text), "_blank", "noopener");
    });
  });
}());
