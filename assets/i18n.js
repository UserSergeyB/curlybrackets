(function () {
  var defaultLocale = "en";
  var supportedLocales = ["en"];

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

  function emitReady(locale, messages) {
    window.dispatchEvent(new CustomEvent("i18n:ready", {
      detail: {
        locale: locale,
        messages: messages
      }
    }));
  }

  var locale = getLocale();

  fetch("../../assets/locales/" + locale + ".json")
    .catch(function () {
      return fetch("assets/locales/" + locale + ".json");
    })
    .then(function (response) {
      if (!response.ok) {
        throw new Error("Could not load locale " + locale);
      }
      return response.json();
    })
    .then(function (messages) {
      applyMessages(messages, locale);
      emitReady(locale, messages);
    })
    .catch(function () {
      if (locale === defaultLocale) {
        emitReady(defaultLocale, {});
        return;
      }

      fetch("../../assets/locales/" + defaultLocale + ".json")
        .catch(function () {
          return fetch("assets/locales/" + defaultLocale + ".json");
        })
        .then(function (response) {
          return response.json();
        })
        .then(function (messages) {
          applyMessages(messages, defaultLocale);
          emitReady(defaultLocale, messages);
        })
        .catch(function () {
          emitReady(defaultLocale, {});
        });
    });
}());
