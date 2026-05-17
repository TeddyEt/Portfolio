const STORAGE_KEYS = {
  theme: "tewodros_theme",
};

function $(selector, root = document) {
  return root.querySelector(selector);
}

function $all(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

function showToast(message) {
  const toast = $("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast._t);
  showToast._t = window.setTimeout(() => toast.classList.remove("show"), 1400);
}

function getPreferredTheme() {
  const stored = localStorage.getItem(STORAGE_KEYS.theme);
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(STORAGE_KEYS.theme, theme);
}

function setupNav() {
  const toggle = $(".nav-toggle");
  const links = $("#nav-links");
  if (!toggle || !links) return;

  const close = () => {
    links.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  };

  toggle.addEventListener("click", () => {
    const isOpen = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  $all("a", links).forEach((a) => a.addEventListener("click", close));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
}

function setupFilters() {
  const buttons = $all(".filter");
  const projects = $all(".project");
  if (!buttons.length || !projects.length) return;

  const activeClass = "active";
  const setActive = (btn) => {
    buttons.forEach((b) => b.classList.toggle(activeClass, b === btn));
  };

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter ?? "all";
      setActive(btn);

      projects.forEach((p) => {
        const tags = (p.getAttribute("data-tags") || "").split(/\s+/).filter(Boolean);
        const show = filter === "all" ? true : tags.includes(filter);
        p.style.display = show ? "" : "none";
      });

      showToast("Filter applied");
    });
  });
}

function setupCopy() {
  $all("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const text = btn.getAttribute("data-copy") || "";
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const temp = document.createElement("textarea");
        temp.value = text;
        temp.style.position = "fixed";
        temp.style.left = "-9999px";
        document.body.appendChild(temp);
        temp.focus();
        temp.select();
        document.execCommand("copy");
        temp.remove();
      }
      showToast("Copied to clipboard");
    });
  });
}

function setupModal() {
  const modal = $("#projectModal");
  const closeBtn = $("#modalClose");
  const body = $("#modalBody");
  const title = $("#modalTitle");
  if (!modal || !body || !title) return;

  const render = (id) => {
    if (id === "p1") {
      title.textContent = "Student Feedback Website";
      body.innerHTML = `<ul class="bullets">
        <li>${escapeHtml("Goal: Allow students to give anonymous feedback through digital questionnaires.")}</li>
        <li>${escapeHtml("Highlights: Responsive layout, clear form UX, and PHP handling for submitted data.")}</li>
        <li>${escapeHtml("Next idea: Add analytics dashboard for instructors (privacy-safe summaries).")}</li>
      </ul>`;
    } else if (id === "p2") {
      title.textContent = "Club Registration System";
      body.innerHTML = `<ul class="bullets">
        <li>${escapeHtml("Goal: Streamline club registration with a simple admin approval workflow.")}</li>
        <li>${escapeHtml("Highlights: CLI menus, OOP design, and member record handling with data structures.")}</li>
        <li>${escapeHtml("Next idea: Export approved members to CSV for easy reporting.")}</li>
      </ul>`;
    }
  };

  const open = (id) => {
    render(id);
    modal.showModal();
  };

  const close = () => modal.close();

  $all("[data-modal]").forEach((btn) => {
    btn.addEventListener("click", () => open(btn.getAttribute("data-modal")));
  });

  $all(".project").forEach((card) => {
    card.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const btn = card.querySelector("[data-modal]");
      if (btn) btn.click();
    });
  });

  closeBtn?.addEventListener("click", close);
  modal.addEventListener("click", (e) => {
    const rect = modal.getBoundingClientRect();
    const inDialog =
      rect.top <= e.clientY && e.clientY <= rect.top + rect.height && rect.left <= e.clientX && e.clientX <= rect.left + rect.width;
    if (!inDialog) close();
  });
}

function setupContactForm() {
  const form = $("#contactForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const name = (fd.get("name") || "").toString().trim();
    const email = (fd.get("email") || "").toString().trim();
    const message = (fd.get("message") || "").toString().trim();
    const subject = encodeURIComponent(`Portfolio message from ${name || "Someone"}`);
    const body = encodeURIComponent(`From: ${name}\nEmail: ${email}\n\n${message}`);
    window.location.href = `mailto:tewodrosendalamaw68@gmail.com?subject=${subject}&body=${body}`;
  });
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setupBackToTop() {
  const link = $(".back-top");
  if (!link) return;
  link.addEventListener("click", (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
    $("#top")?.focus?.();
  });
}

function setupReveals() {
  const els = $all("[data-reveal]");
  if (!els.length) return;

  // Reveal once when entering viewport; never hide again.
  if (!("IntersectionObserver" in window)) {
    els.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  els.forEach((el, idx) => {
    const delay = Math.min(220, idx * 70);
    el.style.transitionDelay = `${delay}ms`;
  });

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.14, rootMargin: "0px 0px -10% 0px" }
  );

  els.forEach((el) => io.observe(el));
}

function main() {
  $("#year").textContent = String(new Date().getFullYear());

  const theme = getPreferredTheme();
  setTheme(theme);

  $("#themeToggle")?.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    setTheme(next);
  });

  setupNav();
  setupFilters();
  setupCopy();
  setupModal();
  setupContactForm();
  setupReveals();
  setupBackToTop();
  setupBackgroundShift();
}

document.addEventListener("DOMContentLoaded", main);

function setupNoScrollRestore() {
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";

  const scrollTopIfNoHash = () => {
    if (location.hash) return;
    window.scrollTo(0, 0);
  };

  window.addEventListener("pageshow", () => {
    // Covers reload + bfcache restore cases.
    setTimeout(scrollTopIfNoHash, 0);
  });

  window.addEventListener("load", () => {
    setTimeout(scrollTopIfNoHash, 0);
  });
}

setupNoScrollRestore();

function setupBackgroundShift() {
  const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) return;

  let raf = 0;
  const onScroll = () => {
    if (raf) return;
    raf = window.requestAnimationFrame(() => {
      raf = 0;
      const doc = document.documentElement;
      const max = Math.max(1, doc.scrollHeight - doc.clientHeight);
      const t = Math.min(1, Math.max(0, window.scrollY / max));
      const eased = t * (2 - t);
      doc.style.setProperty("--bg-shift", eased.toFixed(4));
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}
