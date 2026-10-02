(function () {
  var header = document.getElementById("site-header");
  var menu = document.getElementById("nav-menu");
  var menuToggle = document.getElementById("menu-toggle");
  var themeToggle = document.getElementById("theme-toggle");
  var progressBar = document.getElementById("progress-bar");
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav__link"));
  var sections = Array.prototype.slice.call(document.querySelectorAll("main section[id]"));
  var desktopQuery = window.matchMedia("(min-width: 861px)");

  function currentTheme() {
    return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
  }

  function paintTheme(theme) {
    var next = theme === "light" ? "light" : "dark";
    var light = next === "light";
    document.documentElement.setAttribute("data-theme", next);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", light ? "#F3F6F4" : "#0B0F0E");
    if (themeToggle) {
      themeToggle.setAttribute("aria-pressed", light ? "true" : "false");
      themeToggle.setAttribute("aria-label", light ? "Switch to dark theme" : "Switch to light theme");
    }
  }

  function storeTheme(theme) {
    try {
      localStorage.setItem("theme", theme === "light" ? "light" : "dark");
    } catch (error) {}
  }

  function setMenu(open) {
    var desktop = desktopQuery.matches;
    var expanded = !desktop && open;
    header.classList.toggle("is-open", expanded);
    menuToggle.setAttribute("aria-expanded", expanded ? "true" : "false");
    menuToggle.setAttribute("aria-label", expanded ? "Close menu" : "Open menu");
    if (desktop) menu.removeAttribute("aria-hidden");
    else menu.setAttribute("aria-hidden", expanded ? "false" : "true");
  }

  function closeMenu(focusToggle) {
    setMenu(false);
    if (focusToggle) menuToggle.focus();
  }

  function updateProgress() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var value = max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0;
    progressBar.style.width = value + "%";
  }

  function updateActive() {
    var line = header.getBoundingClientRect().height + 96;
    var current = "hero";
    sections.forEach(function (section) {
      if (section.getBoundingClientRect().top <= line) current = section.id;
    });
    var atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
    if (atBottom) current = "contact";
    navLinks.forEach(function (link) {
      var active = link.getAttribute("href") === "#" + current;
      link.classList.toggle("is-active", active);
      if (active) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  }

  function onScroll() {
    updateProgress();
    updateActive();
  }

  function equalizeProjects() {
    var cards = Array.prototype.slice.call(document.querySelectorAll(".project-card"));
    if (!cards.length) return;
    cards.forEach(function (card) {
      card.style.minHeight = "";
    });
    var max = 0;
    cards.forEach(function (card) {
      max = Math.max(max, card.getBoundingClientRect().height);
    });
    var height = Math.ceil(max) + "px";
    cards.forEach(function (card) {
      card.style.minHeight = height;
    });
  }

  function debounce(fn, wait) {
    var timer = 0;
    return function () {
      window.clearTimeout(timer);
      timer = window.setTimeout(fn, wait);
    };
  }

  document.querySelectorAll('a[href^="http"]').forEach(function (link) {
    link.setAttribute("target", "_blank");
    var rel = new Set((link.getAttribute("rel") || "").split(/\s+/).filter(Boolean));
    rel.add("noopener");
    rel.add("noreferrer");
    link.setAttribute("rel", Array.from(rel).join(" "));
  });

  document.addEventListener("click", function (event) {
    var link = event.target.closest("a");
    if (!link) return;
    var href = link.getAttribute("href");
    if (!href || href.charAt(0) !== "#") return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    var target = document.getElementById(href.slice(1));
    if (!target) return;
    event.preventDefault();
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    if (link.classList.contains("skip-link")) target.focus({ preventScroll: true });
    if (window.history && window.history.pushState) window.history.pushState(null, "", href);
    closeMenu(false);
  });

  menuToggle.addEventListener("click", function () {
    setMenu(!header.classList.contains("is-open"));
  });

  document.addEventListener("click", function (event) {
    if (!header.classList.contains("is-open")) return;
    if (header.contains(event.target)) return;
    closeMenu(false);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && header.classList.contains("is-open")) closeMenu(true);
  });

  themeToggle.addEventListener("click", function () {
    var next = currentTheme() === "light" ? "dark" : "light";
    paintTheme(next);
    storeTheme(next);
  });

  window.addEventListener("storage", function (event) {
    if (event.key !== "theme") return;
    paintTheme(event.newValue === "light" ? "light" : "dark");
  });

  var onResize = debounce(function () {
    setMenu(header.classList.contains("is-open"));
    equalizeProjects();
  }, 120);

  window.addEventListener("resize", onResize);
  window.addEventListener("scroll", onScroll, { passive: true });
  if (desktopQuery.addEventListener) desktopQuery.addEventListener("change", function () { setMenu(false); });
  else if (desktopQuery.addListener) desktopQuery.addListener(function () { setMenu(false); });

  paintTheme(currentTheme());
  setMenu(false);
  onScroll();
  equalizeProjects();

  window.addEventListener("load", function () {
    equalizeProjects();
    onScroll();
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("./sw.js").catch(function () {});
    }
  });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      equalizeProjects();
    });
  }
})();
