(function () {
  var defaultLocale = "en";
  var supportedLocales = ["en", "ru"];

  function getLocale() {
    var stored = localStorage.getItem("locale");
    var candidate = stored || document.documentElement.getAttribute("lang") || navigator.language || defaultLocale;
    var locale = candidate.toLowerCase().split("-")[0];
    return supportedLocales.indexOf(locale) === -1 ? defaultLocale : locale;
  }

  function getValue(messages, key) {
    return key.split(".").reduce(function (value, part) {
      return value && value[part];
    }, messages);
  }

  function getAssetBase() {
    var script = document.currentScript || document.querySelector('script[src$="assets/i18n.js"], script[src$="/i18n.js"]');
    return script
      ? new URL(".", script.src).href
      : new URL("assets/", window.location.href).href;
  }

  function loadLocale(locale) {
    return fetch(new URL("locales/" + locale + ".json", getAssetBase()).href)
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Could not load locale " + locale);
        }
        return response.json();
      });
  }

  function applyMessages(messages, locale) {
    document.documentElement.setAttribute("lang", locale);

    document.querySelectorAll("[data-i18n]").forEach(function (node) {
      var value = getValue(messages, node.getAttribute("data-i18n"));
      if (typeof value === "string") {
        node.textContent = value;
      }
    });

    document.querySelectorAll("[data-i18n-aria-label]").forEach(function (node) {
      var value = getValue(messages, node.getAttribute("data-i18n-aria-label"));
      if (typeof value === "string") {
        node.setAttribute("aria-label", value);
      }
    });

    document.querySelectorAll("[data-i18n-alt]").forEach(function (node) {
      var value = getValue(messages, node.getAttribute("data-i18n-alt"));
      if (typeof value === "string") {
        node.setAttribute("alt", value);
      }
    });

    document.querySelectorAll("[data-i18n-src]").forEach(function (node) {
      var value = getValue(messages, node.getAttribute("data-i18n-src"));
      if (typeof value === "string") {
        node.setAttribute("src", value);
      }
    });

    document.querySelectorAll("[data-i18n-title]").forEach(function (node) {
      var value = getValue(messages, node.getAttribute("data-i18n-title"));
      if (typeof value === "string") {
        node.setAttribute("title", value);
      }
    });

    var titleKey = document.documentElement.getAttribute("data-page-title");
    var descriptionKey = document.documentElement.getAttribute("data-page-description");
    var title = titleKey && getValue(messages, titleKey);
    var description = descriptionKey && getValue(messages, descriptionKey);

    if (typeof title === "string") {
      document.title = title;
    }

    if (typeof description === "string") {
      var metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute("content", description);
      }
    }

    document.querySelectorAll("[data-markdown-key]").forEach(function (node) {
      var documentName = node.getAttribute("data-markdown-key");
      node.setAttribute("data-markdown-src", documentName + "." + locale + ".md");
      node.textContent = getValue(messages, "legal.failed") || "Failed to load data.";
    });
  }

  function updateLocaleControls(locale) {
    document.querySelectorAll("[data-locale-option]").forEach(function (button) {
      var isActive = button.getAttribute("data-locale-option") === locale;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  }

  function bindLocaleControls(locale) {
    updateLocaleControls(locale);

    document.querySelectorAll("[data-locale-option]").forEach(function (button) {
      button.addEventListener("click", function () {
        var nextLocale = button.getAttribute("data-locale-option");
        if (nextLocale === locale || supportedLocales.indexOf(nextLocale) === -1) {
          return;
        }

        localStorage.setItem("locale", nextLocale);
        window.location.reload();
      });
    });
  }

  function emitReady(locale, messages) {
    window.dispatchEvent(new CustomEvent("i18n:ready", {
      detail: {
        locale: locale,
        messages: messages
      }
    }));
  }

  var locale = getLocale();

  loadLocale(locale)
    .then(function (messages) {
      applyMessages(messages, locale);
      bindLocaleControls(locale);
      emitReady(locale, messages);
    })
    .catch(function () {
      if (locale === defaultLocale) {
        emitReady(defaultLocale, {});
        return;
      }

      loadLocale(defaultLocale)
        .then(function (messages) {
          applyMessages(messages, defaultLocale);
          bindLocaleControls(defaultLocale);
          emitReady(defaultLocale, messages);
        })
        .catch(function () {
          emitReady(defaultLocale, {});
        });
    });
}());
