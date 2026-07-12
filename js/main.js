(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- footer year ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------- nav: shrink + hide on scroll down ---------- */
  const nav = document.getElementById("nav");
  let lastY = window.scrollY;
  let ticking = false;

  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle("is-scrolled", y > 24);
    if (y > lastY && y > 300 && !document.body.classList.contains("menu-open")) {
      nav.classList.add("is-hidden");
    } else {
      nav.classList.remove("is-hidden");
    }
    lastY = y;
    ticking = false;
  };
  window.addEventListener("scroll", () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  /* ---------- mobile menu ---------- */
  const burger = document.getElementById("burger");
  const menu = document.getElementById("mobileMenu");

  const setMenu = (open) => {
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menu.classList.toggle("is-open", open);
    menu.setAttribute("aria-hidden", String(!open));
    document.body.classList.toggle("menu-open", open);
    document.body.style.overflow = open ? "hidden" : "";
  };
  burger.addEventListener("click", () =>
    setMenu(burger.getAttribute("aria-expanded") !== "true"));
  menu.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menu.classList.contains("is-open")) setMenu(false);
  });

  /* ---------- hero word rotator ---------- */
  const rotator = document.getElementById("rotator");
  if (rotator) {
    const wrap = rotator.parentElement;
    const line = wrap.parentElement;
    wrap.style.transformOrigin = "0 80%";

    // shrink the word if it's wider than its line (offsetWidth ignores transforms)
    const fitRotator = () => {
      const scale = Math.min(1, line.offsetWidth / rotator.offsetWidth);
      wrap.style.transform = scale < 1 ? `scale(${scale})` : "";
    };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitRotator);
    fitRotator();
    let resizeT;
    window.addEventListener("resize", () => {
      clearTimeout(resizeT);
      resizeT = setTimeout(fitRotator, 120);
    }, { passive: true });

    if (!reduceMotion) {
      const words = ["websites", "logos", "brands", "content"];
      let i = 0;
      setInterval(() => {
        rotator.classList.remove("is-in");
        rotator.classList.add("is-out");
        setTimeout(() => {
          i = (i + 1) % words.length;
          rotator.textContent = words[i];
          fitRotator();
          rotator.classList.remove("is-out");
          rotator.classList.add("is-in-from");
          void rotator.offsetWidth; // force reflow so the "from" state paints before transitioning
          rotator.classList.remove("is-in-from");
          rotator.classList.add("is-in");
        }, 260);
      }, 2600);
    }
  }

  /* ---------- scroll reveals (staggered) ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    // stagger siblings that enter together
    const groups = new Map();
    revealEls.forEach((el) => {
      const parent = el.parentElement;
      if (!groups.has(parent)) groups.set(parent, []);
      el.style.setProperty("--d", `${(groups.get(parent).length % 6) * 0.09}s`);
      groups.get(parent).push(el);
    });

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in-view"));
  }

  /* ---------- stat counters ---------- */
  const stats = document.querySelectorAll(".stat__num");
  if (stats.length) {
    const animateCount = (el) => {
      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || "";
      if (reduceMotion) { el.textContent = target + suffix; return; }
      const dur = 1400;
      const t0 = performance.now();
      const tick = (now) => {
        const p = Math.min((now - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const statIO = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          statIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    stats.forEach((el) => statIO.observe(el));
  }

  /* ---------- store: price count-up ---------- */
  const priceCounts = document.querySelectorAll(".price-count");
  if (priceCounts.length) {
    const animatePrice = (el) => {
      const target = parseInt(el.dataset.count, 10);
      if (reduceMotion) { el.textContent = target; return; }
      const dur = 1100;
      const t0 = performance.now();
      const tick = (now) => {
        const p = Math.min((now - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const priceIO = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animatePrice(entry.target);
          priceIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    priceCounts.forEach((el) => priceIO.observe(el));
  }

  /* ---------- pricing toggle ---------- */
  const pricingTabs = document.querySelectorAll("[data-pricing-tab]");
  if (pricingTabs.length) {
    const pricingPanels = {
      onetime: document.getElementById("pricing-onetime"),
      plans: document.getElementById("pricing-plans"),
    };
    const revealNow = (panel) =>
      panel.querySelectorAll(".reveal").forEach((el) => el.classList.add("in-view"));

    pricingTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const key = tab.dataset.pricingTab;
        if (tab.classList.contains("is-active")) return;
        pricingTabs.forEach((t) => {
          const active = t === tab;
          t.classList.toggle("is-active", active);
          t.setAttribute("aria-selected", String(active));
        });
        Object.entries(pricingPanels).forEach(([k, panel]) => {
          const show = k === key;
          panel.hidden = !show;
          panel.classList.toggle("is-active", show);
          if (show) revealNow(panel);
        });
      });
    });
  }

  /* ---------- pricing: plan CTAs ---------- */
  // Paste each plan's Stripe Payment Link here once created. Until then
  // the button falls back to prefilling the contact form.
  const PLAN_LINKS = {
    "Full Buyout": "https://buy.stripe.com/5kQbJ0ce55sK0lM9USgQE02",
    "Starter Care": "https://buy.stripe.com/bJe3cua5X6wO6KaffcgQE03",
    "Growth Care": "",
    "Pro Care": "",
  };
  document.querySelectorAll("[data-plan]").forEach((el) => {
    el.addEventListener("click", (e) => {
      const plan = el.dataset.plan;
      const link = PLAN_LINKS[plan];
      if (link) {
        el.href = link;
        return; // follow the Stripe Payment Link
      }
      // No link yet -- prefill the contact form; the anchor's own
      // href="#contact" still does the scroll, so no preventDefault.
      const msg = document.getElementById("f-msg");
      if (msg && !msg.value) {
        msg.value = `Hi — I'd like to get started with the ${plan} option.`;
      }
      const needSelect = document.getElementById("f-need");
      if (needSelect) needSelect.value = "Website";
    });
  });

  /* ---------- magnetic buttons (desktop only) ---------- */
  if (finePointer && !reduceMotion) {
    document.querySelectorAll(".magnetic").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${dx * 0.18}px, ${dy * 0.22}px)`;
      });
      el.addEventListener("mouseleave", () => { el.style.transform = ""; });
    });
  }

  /* ---------- store: buy buttons ---------- */
  // Paste each product's Stripe Payment Link here once created in the
  // Stripe dashboard. Until then the button routes to the contact form.
  const STRIPE_LINKS = {
    "Window Tint Selector": "https://buy.stripe.com/6oU7sKfqh3kC5G67MKgQE01",
  };
  document.querySelectorAll("[data-buy]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const product = btn.dataset.product;
      const link = STRIPE_LINKS[product];
      if (link) {
        btn.href = link;
        return; // follow the Stripe Payment Link
      }
      e.preventDefault();
      window.location.href =
        `index.html#contact?product=${encodeURIComponent(product)}`;
    });
  });

  // If arriving at the contact form with a product in the URL, pre-fill it.
  const productParam = new URLSearchParams(
    (window.location.hash.split("?")[1] || window.location.search.slice(1))
  ).get("product");
  const msgField = document.getElementById("f-msg");
  if (productParam && msgField && !msgField.value) {
    msgField.value = `Hi — I'd like to buy the ${productParam} integration for my website.`;
    const needSelect = document.getElementById("f-need");
    if (needSelect) needSelect.value = "Website";
  }

  /* ---------- contact form ---------- */
  const form = document.getElementById("contactForm");
  if (form) {
    const fields = {
      name: form.querySelector("#f-name"),
      email: form.querySelector("#f-email"),
      msg: form.querySelector("#f-msg"),
    };

    const validate = (input, test) => {
      const ok = test(input.value.trim());
      input.closest(".form__field").classList.toggle("has-error", !ok);
      return ok;
    };
    const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

    Object.values(fields).forEach((input) => {
      input.addEventListener("blur", () => {
        if (input === fields.email) validate(input, emailOk);
        else validate(input, (v) => v.length > 0);
      });
      input.addEventListener("input", () =>
        input.closest(".form__field").classList.remove("has-error"));
    });

    const mailtoFallback = () => {
      const need = form.querySelector("#f-need").value;
      const biz = form.querySelector("#f-biz").value.trim();
      const subject = encodeURIComponent(`Project inquiry — ${biz || fields.name.value.trim()}`);
      const body = encodeURIComponent(
        `Name: ${fields.name.value.trim()}\nEmail: ${fields.email.value.trim()}\nBusiness: ${biz || "—"}\nNeeds: ${need}\n\n${fields.msg.value.trim()}`
      );
      window.location.href = `mailto:simpleecreative.com@gmail.com?subject=${subject}&body=${body}`;
    };

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const okName = validate(fields.name, (v) => v.length > 0);
      const okEmail = validate(fields.email, emailOk);
      const okMsg = validate(fields.msg, (v) => v.length > 0);
      if (!okName || !okEmail || !okMsg) {
        form.querySelector(".has-error input, .has-error textarea")?.focus();
        return;
      }

      const submitBtn = form.querySelector(".form__submit");
      const label = form.querySelector(".form__submit-label");
      const success = form.querySelector(".form__success");
      submitBtn.disabled = true;
      label.textContent = "Sending…";

      try {
        const res = await fetch("contact.php", {
          method: "POST",
          body: new FormData(form),
        });
        const data = await res.json();
        if (!data.ok) throw new Error(data.error || "send failed");
        success.textContent = "Thanks — your message is in. We'll reply within one business day.";
        success.hidden = false;
        form.reset();
        label.textContent = "Send it";
      } catch {
        // No PHP backend reachable (e.g. local preview) — open an email draft instead.
        mailtoFallback();
        success.textContent = "Thanks — your message is ready to send in your email app. We'll reply within one business day.";
        success.hidden = false;
        label.textContent = "Send it";
      } finally {
        submitBtn.disabled = false;
      }
    });
  }
})();
