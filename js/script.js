(() => {
  "use strict";

  const ENQUIRY_EMAIL = "karatebristoldojo@gmail.com";

  // Mobile nav toggle
  const nav = document.querySelector(".nav");
  const navToggle = document.querySelector(".nav__toggle");
  if (nav && navToggle) {
    navToggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    nav.querySelectorAll(".nav__links a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Scroll-reveal via IntersectionObserver, with a fallback so short pages
  // (or clients viewing before JS-heavy content loads) never end up with
  // permanently hidden sections.
  const revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px" }
    );
    revealEls.forEach((el) => io.observe(el));
    setTimeout(() => {
      revealEls.forEach((el) => el.classList.add("is-visible"));
    }, 1200);
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  // FAQ accordion — one open at a time
  document.querySelectorAll(".faq-item").forEach((item) => {
    const question = item.querySelector(".faq-item__question");
    if (!question) return;
    question.addEventListener("click", () => {
      const alreadyOpen = item.classList.contains("is-open");
      item.parentElement
        .querySelectorAll(".faq-item.is-open")
        .forEach((open) => {
          open.classList.remove("is-open");
          open.querySelector(".faq-item__question").setAttribute("aria-expanded", "false");
        });
      if (!alreadyOpen) {
        item.classList.add("is-open");
        question.setAttribute("aria-expanded", "true");
      }
    });
  });

  // Enquiry form: validate, then hand off to a prefilled mailto link.
  const form = document.getElementById("enquiryForm");
  if (form) {
    const fields = {
      parentName: { required: true },
      email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email address" },
      phone: { required: true },
      childName: { required: true },
      childAge: { required: true },
      interest: { required: true },
      consent: { required: true, isCheckbox: true },
    };

    const getField = (name) => form.elements.namedItem(name);

    const setError = (name, message) => {
      const field = getField(name);
      const wrapper = field?.closest(".form-field");
      const errorEl = wrapper?.querySelector(".form-error");
      if (wrapper) wrapper.classList.toggle("has-error", Boolean(message));
      if (errorEl) errorEl.textContent = message || "";
    };

    const validate = () => {
      let firstInvalid = null;
      let isValid = true;

      Object.entries(fields).forEach(([name, rule]) => {
        const field = getField(name);
        if (!field) return;
        const value = rule.isCheckbox ? field.checked : field.value.trim();
        let message = "";

        if (rule.required && !value) {
          message = "This field is required";
        } else if (rule.pattern && value && !rule.pattern.test(value)) {
          message = rule.message || "This value doesn't look right";
        }

        setError(name, message);
        if (message) {
          isValid = false;
          if (!firstInvalid) firstInvalid = field;
        }
      });

      if (firstInvalid) firstInvalid.focus();
      return isValid;
    };

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!validate()) return;

      const data = new FormData(form);
      const get = (name) => (data.get(name) || "").toString().trim();

      const subject = `KARATOTS enquiry from ${get("parentName")}`;
      const bodyLines = [
        `Parent/Guardian: ${get("parentName")}`,
        `Email: ${get("email")}`,
        `Phone: ${get("phone")}`,
        `Child's name: ${get("childName")}`,
        `Child's age: ${get("childAge")}`,
        `Interested in: ${get("interest")}`,
        get("preferredArea") ? `Preferred area: ${get("preferredArea")}` : null,
        get("message") ? `Message: ${get("message")}` : null,
      ].filter(Boolean);

      const mailto = `mailto:${ENQUIRY_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join("\n"))}`;
      window.location.href = mailto;

      const confirmation = document.getElementById("formConfirmation");
      if (confirmation) {
        confirmation.hidden = false;
        confirmation.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  }
})();
