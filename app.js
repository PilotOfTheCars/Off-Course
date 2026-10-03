// Add every future OFF COURSE edition here.
// For a released issue, set available: true and provide a cover + Heyzine ID.
const issues = [
  {
    number: "01",
    date: "October 2026",
    title: "The Lore Issue",
    description: "The Garom Files, Cubic, GASA, MRP, EMS, penguins, add-ons, real aviation, Madeira and photography.",
    pages: 79,
    cover: "assets/issue-01-cover.jpg",
    flipbook: "e8e3e8e0c5",
    available: true,
  },
  {
    number: "02",
    date: "TBA",
    title: "Incident Pending",
    description: "The next incident is already being typed.",
    available: false,
  },
];

// Google Analytics 4. Add the site's Measurement ID here (G-XXXXXXXXXX).
// Until an ID is added, the consent banner works but no analytics request is sent.
const GA_MEASUREMENT_ID = "";
const CONSENT_COOKIE = "offcourse_analytics";

function readCookie(name) {
  const match = document.cookie.split("; ").find(row => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=").slice(1).join("=")) : null;
}
function writeCookie(name, value, days = 180) {
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/; SameSite=Lax; Secure`;
}
function enableAnalytics() {
  if (!GA_MEASUREMENT_ID || window.__offCourseAnalyticsLoaded) return;
  window.__offCourseAnalyticsLoaded = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function(){ window.dataLayer.push(arguments); };
  window.gtag("js", new Date());
  window.gtag("consent", "default", {
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied"
  });
  window.gtag("config", GA_MEASUREMENT_ID, {
    allow_google_signals: false,
    allow_ad_personalization_signals: false
  });
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`;
  document.head.appendChild(script);
}
function trackEvent(name, params = {}) {
  if (typeof window.gtag === "function" && readCookie(CONSENT_COOKIE) === "yes") {
    window.gtag("event", name, params);
  }
}
function addCookieBanner() {
  const choice = readCookie(CONSENT_COOKIE);
  if (choice === "yes") {
    enableAnalytics();
    return;
  }
  if (choice === "no") return;

  const banner = document.createElement("aside");
  banner.className = "cookie-banner";
  banner.setAttribute("aria-label", "Analytics cookie choice");
  banner.innerHTML = `
    <div class="cookie-copy">
      <strong>COOKIES. YES, ACTUAL COOKIES.</strong>
      <p>Allow anonymous analytics so we can count visits and see which OFF COURSE pages get read. No advertising cookies.</p>
    </div>
    <div class="cookie-actions">
      <button class="cookie-accept" type="button">ACCEPT COOKIES</button>
      <button class="cookie-decline" type="button">NO THANKS</button>
    </div>`;
  document.body.appendChild(banner);

  banner.querySelector(".cookie-accept").addEventListener("click", () => {
    writeCookie(CONSENT_COOKIE, "yes");
    enableAnalytics();
    banner.remove();
  });
  banner.querySelector(".cookie-decline").addEventListener("click", () => {
    writeCookie(CONSENT_COOKIE, "no");
    banner.remove();
  });
}

const grid = document.querySelector("#issue-grid");
const dialog = document.querySelector("#reader-dialog");
const frame = document.querySelector("#reader-frame");
const title = document.querySelector("#reader-title");
const external = document.querySelector("#reader-external");
const close = document.querySelector("#reader-close");

function renderArchive() {
  if (!grid) return;
  grid.innerHTML = issues.map(issue => {
    if (!issue.available) {
      return `
        <article class="issue-card pending">
          <div class="placeholder-cover" aria-hidden="true"><span>${issue.number}</span><small>COMING LATER</small></div>
          <div class="card-copy">
            <p class="issue-number">ISSUE ${issue.number}</p>
            <h3>${issue.title}</h3>
            <p class="card-description">${issue.description}</p>
            <p class="meta">${issue.date}</p>
          </div>
        </article>`;
    }
    return `
      <article class="issue-card">
        <button class="issue-open" data-reader="${issue.flipbook}" data-issue="${issue.number}" aria-label="Read Issue ${issue.number}">
          <div class="issue-cover-frame">
            <img src="${issue.cover}" alt="Cover of OFF COURSE Issue ${issue.number}" loading="lazy" />
            <span>READ ISSUE →</span>
          </div>
          <div class="card-copy">
            <p class="issue-number">ISSUE ${issue.number} / ${issue.date.toUpperCase()}</p>
            <h3>${issue.title}</h3>
            <p class="card-description">${issue.description}</p>
            <p class="meta">${issue.pages} pages / Read now</p>
          </div>
        </button>
      </article>`;
  }).join("");
  const released = issues.filter(issue => issue.available);
  const releasedCount = document.querySelector("#released-count");
  const pageCount = document.querySelector("#page-count");
  if (releasedCount) releasedCount.textContent = released.length;
  if (pageCount) pageCount.textContent = released.reduce((sum, issue) => sum + (issue.pages || 0), 0);
}

function openReader(id, issueNumber = "01") {
  if (!dialog || !frame) return;
  const url = `https://heyzine.com/flip-book/${id}.html`;
  frame.src = url;
  title.textContent = `OFF COURSE — ISSUE ${issueNumber}`;
  external.href = url;
  dialog.showModal();
  document.body.style.overflow = "hidden";
  trackEvent("issue_open", { issue_number: issueNumber });
}
function closeReader() {
  if (!dialog || !dialog.open) return;
  dialog.close();
  frame.src = "";
  document.body.style.overflow = "";
}
renderArchive();
addCookieBanner();
document.addEventListener("click", event => {
  const trigger = event.target.closest("[data-reader]");
  if (trigger) openReader(trigger.dataset.reader, trigger.dataset.issue || "01");
});
if (close) close.addEventListener("click", closeReader);
if (dialog) {
  dialog.addEventListener("click", event => { if (event.target === dialog) closeReader(); });
  dialog.addEventListener("cancel", event => { event.preventDefault(); closeReader(); });
}