// Mobile nav toggle
const toggle = document.querySelector('.nav__toggle');
const links = document.querySelector('.nav__links');
if (toggle && links) {
  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  links.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// Footer year
const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

// Build the chip's gold pins (8 per side)
document.querySelectorAll('.chip-pins').forEach((row) => {
  for (let i = 0; i < 8; i++) row.appendChild(document.createElement('span'));
});

// Chip follows the cursor
(function () {
  const tilt = document.querySelector('.chip-tilt');
  if (!tilt) return;
  window.addEventListener('mousemove', (e) => {
    const nx = e.clientX / window.innerWidth - 0.5;
    const ny = e.clientY / window.innerHeight - 0.5;
    tilt.style.setProperty('--ry', (nx * 55).toFixed(1) + 'deg');
    tilt.style.setProperty('--rx', (-18 - ny * 30).toFixed(1) + 'deg');
  }, { passive: true });
})();

// Contact — the email never appears in the HTML source (base64, decoded here),
// so email-harvester bots that read raw HTML can't scrape it. Clicking any
// contact element copies the address to the clipboard with a short confirmation.
(function () {
  const email = atob('YWxlZW5hLnlheGkueGlhb0BnbWFpbC5jb20=');

  // Footer: show the address (injected at runtime)
  document.querySelectorAll('.js-emailshow').forEach((el) => {
    el.textContent = email;
  });

  // Nav "Contact", hero "Email", and the footer address all copy on click
  document.querySelectorAll('.js-contact, .js-emailshow').forEach((el) => {
    el.setAttribute('title', 'Click to copy my email');
    el.addEventListener('click', (ev) => {
      ev.preventDefault();
      const original = el.textContent;
      const flash = (msg) => {
        el.textContent = msg;
        setTimeout(() => { el.textContent = original; }, 1600);
      };
      const reveal = () => { el.textContent = email; };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(() => flash('Copied ✓'), reveal);
      } else {
        reveal();
      }
    });
  });
})();
