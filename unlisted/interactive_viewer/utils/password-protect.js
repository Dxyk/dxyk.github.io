const PASSWORD_HASH = "9122642801c74e4de2cadd6c6e2fc225076fc123";

async function sha1(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-1", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

async function requirePassword() {
  while (true) {
    const entered = prompt("Enter password (Cancel to quit):");
    if (entered === null) {
      // user cancelled
      if (document.body) {
        document.body.innerHTML = "<p>Access cancelled.</p>";
      }
      return false;
    }
    const hash = await sha1(entered);
    if (hash === PASSWORD_HASH) {
      return true;
    }
    alert("Incorrect password. Please try again.");
  }
}

function removeHideStyle() {
  const head = document.head;
  if (!head) return;

  // Find <style> that hides html,body
  const hideTags = Array.from(head.querySelectorAll("style")).filter(
    (tag) =>
      tag.textContent.includes("html, body") &&
      tag.textContent.includes("display: none")
  );

  for (const tag of hideTags) {
    tag.remove();
  }
}


// Run only after DOM is parsed, so <body> definitely exists
document.addEventListener("DOMContentLoaded", async () => {
  const ok = await requirePassword();

  if (!ok) {
    // User cancelled; if body exists we already replaced its content in requirePassword()
    return;
  }
  removeHideStyle();
  // Correct password: do nothing; original content is now visible
});
