(function () {
  function inline(text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
  }

  function render(markdown) {
    var lines = markdown.trim().split(/\r?\n/);
    var html = [];
    var inList = false;

    lines.forEach(function (line) {
      var text = line.trim();

      if (!text) {
        if (inList) {
          html.push("</ul>");
          inList = false;
        }
        return;
      }

      if (text.indexOf("### ") === 0) {
        if (inList) {
          html.push("</ul>");
          inList = false;
        }
        html.push("<h3>" + inline(text.slice(4)) + "</h3>");
        return;
      }

      if (text.indexOf("## ") === 0) {
        if (inList) {
          html.push("</ul>");
          inList = false;
        }
        html.push("<h2>" + inline(text.slice(3)) + "</h2>");
        return;
      }

      if (text.indexOf("- ") === 0) {
        if (!inList) {
          html.push("<ul>");
          inList = true;
        }
        html.push("<li>" + inline(text.slice(2)) + "</li>");
        return;
      }

      if (inList) {
        html.push("</ul>");
        inList = false;
      }
      html.push("<p>" + inline(text) + "</p>");
    });

    if (inList) {
      html.push("</ul>");
    }

    return html.join("");
  }

  document.querySelectorAll("[data-markdown]").forEach(function (node) {
    node.innerHTML = render(node.textContent);
  });
}());
