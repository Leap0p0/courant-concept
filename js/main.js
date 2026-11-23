// Courant Concept — scripts du site
document.addEventListener("DOMContentLoaded", function () {
  initIntro();
  initReviews();
  initTilt();
  initCounters();
  initPlugButtons();
  initCurrents();
  initGauges();
  initNav();
  initAccordions();
  initReveal();
  initYear();
  initWizard();
});

/* ---------- Menu mobile ---------- */
function initNav() {
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".main-nav");
  if (!toggle || !nav) return;

  if (!nav.querySelector(".nav-mobile-extra")) {
    var extra = document.createElement("div");
    extra.className = "nav-mobile-extra";
    extra.innerHTML =
      '<a href="tel:+33787776820" class="btn btn-outline-dark btn-block">07 87 77 68 20</a>' +
      '<a href="contact.html" class="btn btn-primary btn-block">Devis gratuit</a>';
    nav.appendChild(extra);
  }

  toggle.addEventListener("click", function () {
    var isOpen = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    document.body.style.overflow = isOpen ? "hidden" : "";
  });

  nav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    });
  });
}

/* ---------- Accordéon FAQ ---------- */
function initAccordions() {
  document.querySelectorAll(".accordion-item").forEach(function (item) {
    var trigger = item.querySelector(".accordion-trigger");
    var panel = item.querySelector(".accordion-panel");
    if (!trigger || !panel) return;

    trigger.addEventListener("click", function () {
      var isOpen = item.getAttribute("data-open") === "true";
      document.querySelectorAll(".accordion-item").forEach(function (other) {
        other.setAttribute("data-open", "false");
        other.querySelector(".accordion-panel").style.maxHeight = null;
        other.querySelector(".accordion-trigger").setAttribute("aria-expanded", "false");
      });
      if (!isOpen) {
        item.setAttribute("data-open", "true");
        panel.style.maxHeight = panel.scrollHeight + "px";
        trigger.setAttribute("aria-expanded", "true");
      }
    });
  });
}

/* ---------- Apparition au scroll ---------- */
function initReveal() {
  var items = document.querySelectorAll("[data-reveal]");
  if (!items.length) return;

  if (!("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("is-visible"); });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  items.forEach(function (el) { observer.observe(el); });
}

/* ---------- Année dans le footer ---------- */
function initYear() {
  var el = document.querySelector("[data-year]");
  if (el) el.textContent = new Date().getFullYear();
}

/* =========================================================
   Assistant de qualification de projet (multi-étapes)
   Visuel uniquement : la soumission finale n'envoie rien
   pour l'instant, elle affiche un écran de confirmation.
   ========================================================= */
function initWizard() {
  var wizard = document.querySelector("[data-wizard]");
  if (!wizard) return;

  var steps = Array.prototype.slice.call(wizard.querySelectorAll(".wizard-step"));
  var progressBar = wizard.querySelector(".progress-bar");
  var stepLabels = Array.prototype.slice.call(wizard.querySelectorAll(".wizard-steps span"));
  var prevBtn = wizard.querySelector("[data-wizard-prev]");
  var nextBtn = wizard.querySelector("[data-wizard-next]");
  var submitBtn = wizard.querySelector("[data-wizard-submit]");
  var successScreen = wizard.querySelector("[data-wizard-success]");
  var footer = wizard.querySelector(".wizard-footer");
  var progressWrap = wizard.querySelector(".wizard-progress");

  var current = 0;
  var answers = {};

  function goTo(index, scroll) {
    steps[current].classList.remove("is-active");
    current = index;
    steps[current].classList.add("is-active");

    var pct = ((current + 1) / steps.length) * 100;
    if (progressBar) progressBar.style.width = pct + "%";

    stepLabels.forEach(function (label, i) {
      label.classList.toggle("is-active", i === current);
    });

    prevBtn.style.visibility = current === 0 ? "hidden" : "visible";
    var isLast = current === steps.length - 1;
    nextBtn.style.display = isLast ? "none" : "inline-flex";
    submitBtn.style.display = isLast ? "inline-flex" : "none";

    if (isLast) renderSummary();

    if (scroll) {
      wizard.querySelector(".wizard-body").scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function validateStep() {
    var activeStep = steps[current];
    var isValid = true;

    activeStep.querySelectorAll("[data-required]").forEach(function (field) {
      var input = field.querySelector("input, select, textarea");
      var fieldValid = true;
      if (input) {
        if (input.type === "checkbox") {
          fieldValid = input.checked;
        } else {
          fieldValid = input.value.trim() !== "";
        }
      }
      field.classList.toggle("has-error", !fieldValid);
      if (!fieldValid) isValid = false;
    });

    var radioGroups = activeStep.querySelectorAll("[data-required-group]");
    radioGroups.forEach(function (group) {
      var checked = group.querySelector("input:checked");
      group.classList.toggle("has-error", !checked);
      if (!checked) isValid = false;
    });

    return isValid;
  }

  function collectStepAnswers() {
    var activeStep = steps[current];
    activeStep.querySelectorAll("input, select, textarea").forEach(function (input) {
      if (!input.name) return;
      if (input.type === "radio" || input.type === "checkbox") {
        if (input.checked) answers[input.name] = input.dataset.label || input.value;
      } else {
        answers[input.name] = input.value;
      }
    });
  }

  function renderSummary() {
    var list = wizard.querySelector("[data-wizard-summary]");
    if (!list) return;
    var labels = {
      project: "Projet",
      profile: "Profil",
      timing: "Délai souhaité",
      postcode: "Code postal",
      fullname: "Nom",
      email: "E-mail",
      phone: "Téléphone"
    };
    list.innerHTML = "";
    Object.keys(labels).forEach(function (key) {
      if (!answers[key]) return;
      var row = document.createElement("div");
      var dt = document.createElement("dt");
      dt.textContent = labels[key];
      var dd = document.createElement("dd");
      dd.textContent = answers[key];
      row.appendChild(dt);
      row.appendChild(dd);
      list.appendChild(row);
    });
  }

  nextBtn.addEventListener("click", function () {
    if (!validateStep()) return;
    collectStepAnswers();
    if (current < steps.length - 1) goTo(current + 1, true);
  });

  prevBtn.addEventListener("click", function () {
    if (current > 0) goTo(current - 1, true);
  });

  wizard.querySelector("form").addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validateStep()) return;
    collectStepAnswers();

    footer.style.display = "none";
    progressWrap.style.display = "none";
    steps[current].classList.remove("is-active");
    successScreen.classList.add("is-active");
    successScreen.style.display = "block";
  });

  // Permet de cliquer sur toute la carte d'option, pas seulement le radio
  wizard.querySelectorAll(".option-card").forEach(function (card) {
    card.addEventListener("click", function () {
      var input = card.querySelector("input");
      if (input) {
        input.checked = true;
        input.dispatchEvent(new Event("change"));
      }
    });
  });

  goTo(0);
}

/* ---------- Intro : une fiche se branche dans le « C » du logo ---------- */
function initIntro() {
  if (!document.body.hasAttribute("data-intro") || /[?&]nointro/.test(location.search)) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var el = document.createElement("div");
  el.className = "intro";
  el.setAttribute("aria-hidden", "true");
  el.innerHTML =
    '<div class="intro-stage">' +
      '<svg class="intro-svg" viewBox="0 0 100 100">' +
        '<defs><linearGradient id="ccGrad" x1="0" y1="8" x2="0" y2="92" gradientUnits="userSpaceOnUse">' +
          '<stop offset="0" stop-color="#05d8e3"/><stop offset=".55" stop-color="#0c6f96"/><stop offset="1" stop-color="#160743"/></linearGradient>' +
          '<radialGradient id="ccFlash"><stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="#05d8e3"/><stop offset="1" stop-color="#05d8e3" stop-opacity="0"/></radialGradient></defs>' +
        '<path d="M90.5 36 A41 41 0 1 0 90.5 64" fill="none" stroke="#eef3f8" stroke-width="10" stroke-linecap="round"/>' +
        '<path d="M69.6 35.2 A23 23 0 1 0 69.6 64.8" fill="none" stroke="#eef3f8" stroke-width="5" stroke-linecap="round"/>' +
        '<path class="intro-ring" d="M90.5 36 A41 41 0 1 0 90.5 64" fill="none" stroke="url(#ccGrad)" stroke-width="10" stroke-linecap="round"/>' +
        '<path class="intro-ring intro-ring--inner" d="M69.6 35.2 A23 23 0 1 0 69.6 64.8" fill="none" stroke="url(#ccGrad)" stroke-width="5" stroke-linecap="round"/>' +
        '<circle class="intro-flash" cx="75" cy="50" r="14" fill="url(#ccFlash)"/>' +
        '<g class="intro-plug-body">' +
          '<path d="M100 50 C 140 50, 150 72, 200 72 S 300 60, 420 60" fill="none" stroke="#14255a" stroke-width="4" stroke-linecap="round"/>' +
          '<rect x="83" y="41" width="19" height="18" rx="4" fill="#14255a"/>' +
          '<rect x="86" y="44" width="2" height="12" rx="1" fill="#05d8e3"/>' +
        '</g>' +
        '<g class="intro-plug"><rect x="68" y="47.5" width="17" height="5" rx="2.5" fill="#0c6f96"/></g>' +
      '</svg>' +
      '<img class="intro-logo" src="images/2-LIGNElogo-courantconcept.png" alt="">' +
      '<div class="intro-bar"><span></span></div>' +
    '</div>';
  document.body.appendChild(el);

  var done = false;
  function finish() {
    if (done) return; done = true;
    el.classList.add("is-done");
    setTimeout(function () { el.remove(); }, 900);
  }
  el.addEventListener("click", finish);
  requestAnimationFrame(function () { el.classList.add("is-playing"); });
  setTimeout(finish, 2900);
}

/* ---------- Effet 3D léger sur la photo du hero ---------- */
function initTilt() {
  var wrap = document.querySelector(".hero-photo-wrap");
  var zone = document.querySelector(".hero");
  if (!wrap || !zone) return;
  if (!window.matchMedia("(hover: hover) and (prefers-reduced-motion: no-preference)").matches) return;
  zone.addEventListener("mousemove", function (e) {
    var r = wrap.getBoundingClientRect();
    var x = (e.clientX - (r.left + r.width / 2)) / window.innerWidth;
    var y = (e.clientY - (r.top + r.height / 2)) / window.innerHeight;
    wrap.style.transform = "perspective(900px) rotateY(" + (x * 10).toFixed(2) + "deg) rotateX(" + (-y * 8).toFixed(2) + "deg)";
  });
  zone.addEventListener("mouseleave", function () { wrap.style.transform = ""; });
}

/* ---------- 1. Compteurs animés ---------- */
function initCounters() {
  var els = document.querySelectorAll("[data-count]");
  if (!els.length || !("IntersectionObserver" in window)) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var fmt = function (n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " "); };
  els.forEach(function (el) { el.textContent = "0" + (el.dataset.suffix || ""); });
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      obs.unobserve(e.target);
      var el = e.target, target = +el.dataset.count, suf = el.dataset.suffix || "", t0 = null, dur = 1600;
      function step(ts) {
        if (!t0) t0 = ts;
        var p = Math.min((ts - t0) / dur, 1), eased = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt(Math.round(target * eased)) + suf;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }, { threshold: 0.5 });
  els.forEach(function (el) { obs.observe(el); });
}

/* ---------- 2. Fiche qui se branche dans les boutons devis ---------- */
function initPlugButtons() {
  var btns = document.querySelectorAll(".header-actions .btn-primary, .hero-cta .btn-primary");
  btns.forEach(function (b) {
    b.classList.add("btn-plugged");
    var s = document.createElement("span");
    s.className = "btn-plug"; s.setAttribute("aria-hidden", "true");
    s.innerHTML = '<svg viewBox="0 0 26 18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
      '<g class="plug"><path d="M1 9h4"/><rect x="5" y="4.5" width="7" height="9" rx="2" fill="currentColor"/><path d="M12 7h3.5M12 11h3.5"/></g>' +
      '<path d="M19 3.5a6.5 6.5 0 0 1 0 11" /><path d="M17.5 6.5v5"/>' +
      '<circle class="spark" cx="17" cy="9" r="5" fill="#fff" stroke="none"/></svg>';
    b.appendChild(s);
  });
}

/* ---------- 3. Lignes de courant dans le hero ---------- */
function initCurrents() {
  var hero = document.querySelector(".hero");
  if (!hero) return;
  var paths = [
    "M-20 120 H260 L320 180 H700 L760 120 H1500",
    "M-20 520 H180 L240 460 H520 L580 520 H900 L960 580 H1500",
    "M-20 700 H400 L460 640 H820 L880 700 H1500",
    "M1100 -20 V160 L1160 220 V420 L1100 480 V900",
    "M120 -20 V60 L180 120",
    "M1300 900 V640 L1240 580 H1000"
  ];
  var ns = "http://www.w3.org/2000/svg";
  var svg = document.createElementNS(ns, "svg");
  svg.setAttribute("class", "hero-currents");
  svg.setAttribute("viewBox", "0 0 1440 800");
  svg.setAttribute("preserveAspectRatio", "xMidYMid slice");
  svg.setAttribute("aria-hidden", "true");
  var html = '<defs><linearGradient id="currentGrad"><stop offset="0" stop-color="#05d8e3" stop-opacity="0"/><stop offset="1" stop-color="#05d8e3"/></linearGradient></defs>';
  paths.forEach(function (d, i) {
    html += '<path class="trace" d="' + d + '"/>';
    html += '<path class="pulse" d="' + d + '" style="animation-delay:' + (-i * 1.3) + 's;animation-duration:' + (5 + (i % 3) * 1.5) + 's"/>';
  });
  [[260,120],[760,120],[240,460],[580,520],[460,640],[1160,220],[1100,480],[1240,580]].forEach(function (c) {
    html += '<circle class="node" cx="' + c[0] + '" cy="' + c[1] + '" r="3.5"/>';
  });
  svg.innerHTML = html;
  hero.insertBefore(svg, hero.firstChild);
}

/* ---------- 4. Jauges de charge du tableau des puissances ---------- */
function initGauges() {
  var gauges = document.querySelectorAll(".charge-gauge");
  if (!gauges.length) return;
  if (!("IntersectionObserver" in window)) { gauges.forEach(function (g) { g.classList.add("is-charged"); }); return; }
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      obs.unobserve(e.target);
      var i = Array.prototype.indexOf.call(gauges, e.target);
      setTimeout(function () { e.target.classList.add("is-charged"); }, i * 140);
    });
  }, { threshold: 0.6 });
  gauges.forEach(function (g) { obs.observe(g); });
}

/* ---------- Avis Google (données dans js/avis.js) ---------- */
function initReviews() {
  var sec = document.getElementById("avis");
  var data = window.AVIS_GOOGLE;
  if (!sec || !data || !data.avis || !data.avis.length) return;
  var esc = function (t) { var d = document.createElement("div"); d.textContent = t == null ? "" : String(t); return d.innerHTML; };
  var stars = function (n) { var s = ""; for (var i = 1; i <= 5; i++) s += '<span class="' + (i <= n ? "on" : "") + '">★</span>'; return s; };
  var g = '<svg class="g-logo" viewBox="0 0 48 48" aria-label="Google"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>';
  if (data.note) {
    sec.querySelector(".reviews-summary").innerHTML = g + '<strong>' + esc(Number(data.note).toFixed(1).replace(".", ",")) + '/5</strong> <span class="stars">' + stars(Math.round(data.note)) + '</span>' + (data.total ? ' <span>· ' + esc(data.total) + ' avis Google</span>' : "");
  }
  sec.querySelector(".reviews-track").innerHTML = data.avis.map(function (a) {
    var initiale = esc((a.nom || "?").trim().charAt(0).toUpperCase());
    return '<figure class="review-card"><div class="review-top"><span class="review-avatar">' + initiale + '</span><span><strong>' + esc(a.nom) + '</strong><small>' + esc(a.date) + '</small></span>' + g + '</div>' +
      '<div class="stars">' + stars(a.etoiles || 5) + '</div><blockquote>' + esc(a.texte) + '</blockquote></figure>';
  }).join("");
  var link = sec.querySelector(".reviews-link");
  if (data.lien) link.href = data.lien; else link.remove();
  sec.hidden = false;
}
