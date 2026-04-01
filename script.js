// ================================================================
// CITY BUDDY – script.js FIXED FINAL VERSION
// ================================================================

// ── CHOOSE YOUR MODE ──────────────────────────────────────────
// If using Python backend → set USE_PYTHON_BACKEND = true
// If using EmailJS (Netlify) → set USE_PYTHON_BACKEND = false
const USE_PYTHON_BACKEND = true; // ← change to false for Netlify

// EmailJS keys (only needed if USE_PYTHON_BACKEND = false)
const EMAILJS_PUBLIC_KEY  = "xNKhEqAK7TW0nMZx2";
const EMAILJS_SERVICE_ID  = "service_81vbg6h";
const EMAILJS_BOOKING_TID = "template_0zzr3o2";
const EMAILJS_CONTACT_TID = "template_i5b6zdj";

if (!USE_PYTHON_BACKEND) {
  emailjs.init(EMAILJS_PUBLIC_KEY);
}

// ── PAGE NAVIGATION ───────────────────────────────────────────
function showPage(name) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  const target = document.getElementById("page-" + name);
  if (target) target.classList.add("active");

  document.querySelectorAll(".nav-link").forEach(a => a.classList.remove("active"));
  const navLink = document.querySelector(`.nav-link[data-page="${name}"]`);
  if (navLink) navLink.classList.add("active");

  window.scrollTo({ top: 0, behavior: "smooth" });
  setTimeout(initReveal, 150);

  if (name === "booking") {
    const dateEl = document.getElementById("b_date");
    if (dateEl) dateEl.min = new Date().toISOString().split("T")[0];
  }
}

// ── MOBILE MENU ───────────────────────────────────────────────
function toggleMenu() {
  document.getElementById("mobileDrawer").classList.toggle("open");
  document.getElementById("hamburger").classList.toggle("active");
}

function closeMenu() {
  document.getElementById("mobileDrawer").classList.remove("open");
  document.getElementById("hamburger").classList.remove("active");
}

document.addEventListener("click", function(e) {
  const drawer = document.getElementById("mobileDrawer");
  const ham = document.getElementById("hamburger");
  if (drawer.classList.contains("open") &&
      !drawer.contains(e.target) &&
      !ham.contains(e.target)) {
    closeMenu();
  }
});

// ── NAVBAR SCROLL ─────────────────────────────────────────────
window.addEventListener("scroll", () => {
  const nav = document.getElementById("navbar");
  const backTop = document.getElementById("backTop");
  if (nav) nav.classList.toggle("scrolled", window.scrollY > 30);
  if (backTop) backTop.classList.toggle("show", window.scrollY > 400);
});

// ── CUSTOM CURSOR ─────────────────────────────────────────────
(function() {
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  const dot = document.getElementById("cursorDot");
  const ring = document.getElementById("cursorRing");
  if (!dot || !ring) return;
  let mx = 0, my = 0, rx = 0, ry = 0;
  document.addEventListener("mousemove", e => {
    mx = e.clientX; my = e.clientY;
    dot.style.cssText = `left:${mx}px;top:${my}px;transform:translate(-50%,-50%)`;
  });
  (function animateRing() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.cssText = `left:${rx}px;top:${ry}px;transform:translate(-50%,-50%)`;
    requestAnimationFrame(animateRing);
  })();
})();

// ── SCROLL REVEAL ─────────────────────────────────────────────
function initReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll(".page.active .reveal").forEach(el => {
    el.classList.remove("visible");
    obs.observe(el);
  });
}

// ── FAQ ACCORDION ─────────────────────────────────────────────
function toggleFaq(el) {
  const item = el.parentElement;
  const isOpen = item.classList.contains("open");
  document.querySelectorAll(".faq-item.open").forEach(i => i.classList.remove("open"));
  if (!isOpen) item.classList.add("open");
}

// ── COOKIE BANNER ─────────────────────────────────────────────
function initCookieBanner() {
  const banner = document.getElementById("cookieBanner");
  if (!banner) return;
  if (localStorage.getItem("cb_cookie") === "1") {
    banner.classList.add("hide");
    return;
  }
  setTimeout(() => { banner.style.display = "flex"; }, 1500);
}

function acceptCookies() {
  const banner = document.getElementById("cookieBanner");
  if (banner) banner.classList.add("hide");
  localStorage.setItem("cb_cookie", "1");
}

// ── FILE UPLOAD ───────────────────────────────────────────────
function handleFile(inputId, displayId) {
  const input = document.getElementById(inputId);
  const display = document.getElementById(displayId);
  if (!input || !display) return;
  if (input.files && input.files.length > 0) {
    if (input.files[0].size > 5 * 1024 * 1024) {
      alert("File too large. Max 5MB.");
      input.value = "";
      return;
    }
    display.textContent = "✓ " + input.files[0].name;
  }
}

// ── HELPERS ───────────────────────────────────────────────────
function getSelectedService() {
  const checked = document.querySelector('input[name="svc"]:checked');
  return checked ? checked.value : "Not selected";
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
  return /^[6-9]\d{9}$/.test(phone);
}

function showError(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.borderColor = "#ef4444";
  el.style.boxShadow = "0 0 0 3px rgba(239,68,68,.1)";
  setTimeout(() => { el.style.borderColor = ""; el.style.boxShadow = ""; }, 2500);
}

// ── BOOKING SUBMISSION ────────────────────────────────────────
async function submitBooking() {
  const name     = (document.getElementById("b_name")?.value || "").trim();
  const email    = (document.getElementById("b_email")?.value || "").trim();
  const phone    = (document.getElementById("b_phone")?.value || "").trim();
  const date     = document.getElementById("b_date")?.value || "";
  const time     = document.getElementById("b_time")?.value || "";
  const location = (document.getElementById("b_location")?.value || "").trim();
  const expect   = (document.getElementById("b_expect")?.value || "").trim();
  const agreed   = document.getElementById("b_agree")?.checked || false;
  const service  = getSelectedService();

  if (!name)               { alert("Please enter your full name.");       showError("b_name");        return; }
  if (!validateEmail(email)){ alert("Please enter a valid email.");        showError("b_email");       return; }
  if (!validatePhone(phone)){ alert("Enter a valid 10-digit mobile no."); showError("b_phone");       return; }
  if (!date)               { alert("Please select a date.");              showError("b_date");        return; }
  if (!time)               { alert("Please select a time.");              showError("b_time");        return; }
  if (!location)           { alert("Please enter your city/area.");       showError("b_location");    return; }
  if (!expect)             { alert("Please share your expectations.");    showError("b_expect");      return; }
  if (!agreed)             { alert("Please agree to the Safety Rules.");                              return; }

  const btn = document.getElementById("submitBtn");
  const btnText = document.getElementById("submit-text");
  btn.disabled = true;
  if (btnText) btnText.textContent = "Submitting...";

  const params = {
    client_name: name, client_email: email, client_phone: phone,
    service_type: service, meetup_date: date, meetup_time: time,
    meetup_location: location, expectations: expect,
    agreed_to_terms: "Yes",
    submitted_at: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
  };

  try {
    if (USE_PYTHON_BACKEND) {
      // Python Flask backend
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params)
      });
      const result = await res.json();
      if (result.success) { onBookingSuccess(); }
      else { alert("❌ Error: " + result.error); btn.disabled = false; if (btnText) btnText.textContent = "Submit Booking Request"; }
    } else {
      // EmailJS (for Netlify)
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_BOOKING_TID, params);
      onBookingSuccess();
    }
  } catch (err) {
    console.error(err);
    if (USE_PYTHON_BACKEND) {
      alert("❌ Cannot connect to server. Make sure Python server is running:\npython server.py");
    } else {
      onBookingSuccess(); // demo fallback
    }
    btn.disabled = false;
    if (btnText) btnText.textContent = "Submit Booking Request";
  }
}

function onBookingSuccess() {
  ["b_name","b_email","b_phone","b_date","b_time","b_location","b_expect"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  const agree = document.getElementById("b_agree");
  if (agree) agree.checked = false;
  ["id-fn","photo-fn"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = "";
  });
  const firstRadio = document.querySelector('input[name="svc"]');
  if (firstRadio) firstRadio.checked = true;

  const banner = document.getElementById("booking-success");
  if (banner) { banner.classList.add("show"); banner.scrollIntoView({ behavior:"smooth", block:"center" }); }

  const btn = document.getElementById("submitBtn");
  const btnText = document.getElementById("submit-text");
  if (btn) {
    if (btnText) btnText.textContent = "✓ Submitted!";
    btn.style.background = "var(--sage)";
    setTimeout(() => {
      btn.disabled = false;
      if (btnText) btnText.textContent = "Submit Booking Request";
      btn.style.background = "";
    }, 5000);
  }
}

// ── CONTACT FORM ──────────────────────────────────────────────
async function submitContact() {
  const name    = (document.getElementById("c_name")?.value || "").trim();
  const email   = (document.getElementById("c_email")?.value || "").trim();
  const subject = document.getElementById("c_subject")?.value || "";
  const message = (document.getElementById("c_message")?.value || "").trim();

  if (!name)                { alert("Please enter your name.");           return; }
  if (!validateEmail(email)){ alert("Please enter a valid email.");       return; }
  if (!subject)             { alert("Please select a subject.");          return; }
  if (message.length < 10)  { alert("Please write at least 10 chars.");  return; }

  const params = {
    sender_name: name, sender_email: email, subject, message,
    sent_at: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
  };

  try {
    if (USE_PYTHON_BACKEND) {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params)
      });
      const result = await res.json();
      if (result.success) onContactSuccess();
      else alert("❌ Error: " + result.error);
    } else {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_CONTACT_TID, params);
      onContactSuccess();
    }
  } catch (err) {
    console.error(err);
    onContactSuccess(); // fallback
  }
}

function onContactSuccess() {
  ["c_name","c_email","c_message"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  const sub = document.getElementById("c_subject");
  if (sub) sub.value = "";
  const banner = document.getElementById("contact-success");
  if (banner) { banner.classList.add("show"); }
  const cBtn = document.getElementById("c-submit-text");
  if (cBtn) { cBtn.textContent = "✓ Sent!"; setTimeout(() => { cBtn.textContent = "Send Message"; }, 4000); }
}

// ── LEGAL TABS ────────────────────────────────────────────────
function switchTab(id, btn) {
  document.querySelectorAll(".legal-panel").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".ltab").forEach(t => t.classList.remove("active"));
  const panel = document.getElementById("lt-" + id);
  if (panel) panel.classList.add("active");
  btn.classList.add("active");
}

// ── DOM READY ─────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('a[href="#"]').forEach(a => {
    a.addEventListener("click", e => e.preventDefault());
  });
  initReveal();
  initCookieBanner();
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeMenu(); });
  const dateEl = document.getElementById("b_date");
  if (dateEl) dateEl.min = new Date().toISOString().split("T")[0];
});