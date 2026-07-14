const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;

// On Railway: attach a Volume and set DATA_DIR to its mount path (e.g. /data)
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "data");
const SUB_DIR = path.join(DATA_DIR, "submissions");
const ADMIN_KEY = process.env.ADMIN_KEY || "change-me";

fs.mkdirSync(SUB_DIR, { recursive: true });

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

// ---------- submit ----------
app.post("/api/submit", (req, res) => {
  try {
    const body = req.body || {};
    if (!Array.isArray(body.answers) || body.answers.length === 0) {
      return res.status(400).json({ ok: false, error: "Invalid payload" });
    }
    const id =
      new Date().toISOString().replace(/[:.]/g, "-") +
      "_" +
      crypto.randomBytes(3).toString("hex");
    const record = {
      id,
      receivedAt: new Date().toISOString(),
      contact: body.contact || {},
      answers: body.answers,
      meta: { ua: req.headers["user-agent"] || "" },
    };
    fs.writeFileSync(
      path.join(SUB_DIR, id + ".json"),
      JSON.stringify(record, null, 2),
      "utf8"
    );
    res.json({ ok: true, id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

// ---------- admin ----------
function checkKey(req, res) {
  const key = req.query.key || "";
  if (key !== ADMIN_KEY) {
    res
      .status(401)
      .send(
        page(
          "Admin",
          `<div class="card"><h2>Locked</h2><p>Append <code>?key=YOUR_ADMIN_KEY</code> to the URL.</p></div>`
        )
      );
    return false;
  }
  return true;
}

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function page(title, inner) {
  return `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)} · AIxAI</title>
<style>
  body{font-family:Inter,system-ui,Segoe UI,Arial,sans-serif;background:#F6F5F2;color:#282C30;margin:0;padding:32px 16px}
  .wrap{max-width:900px;margin:0 auto}
  .card{background:#fff;border:1px solid #E5E2DB;border-radius:14px;padding:24px 28px;margin-bottom:16px}
  h1{font-size:22px} h2{font-size:18px}
  a{color:#282C30}
  table{width:100%;border-collapse:collapse;font-size:14px}
  td,th{padding:10px 8px;border-bottom:1px solid #EEE;text-align:left;vertical-align:top}
  .q{color:#6E6E6E;font-size:13px}
  .sec{background:#282C30;color:#fff;padding:6px 12px;border-radius:8px;font-size:13px;display:inline-block;margin:18px 0 6px}
  .agency{color:#C8641B;font-weight:600}
  .pill{background:#F0EEE9;border-radius:20px;padding:2px 10px;font-size:12px}
  code{background:#F0EEE9;padding:2px 6px;border-radius:6px}
</style></head><body><div class="wrap">
<div style="display:flex;align-items:center;gap:10px;margin-bottom:20px">
  <svg viewBox="620 200 820 740" width="34" height="30" xmlns="http://www.w3.org/2000/svg"><path fill="#282C30" d="M 625.497 207.751 C 656.651 207.201 689.19 207.712 720.431 207.891 C 750.377 234.363 784.353 270.972 813.133 299.322 L 1044.9 530.413 L 1107.18 592.771 C 1118.12 603.671 1130.64 616.924 1142.14 626.776 C 1175.85 606.816 1209.76 587.179 1243.85 567.869 C 1261.29 557.912 1285.32 545.139 1301.54 534.521 C 1318.08 533.783 1337.64 534.234 1354.36 534.218 C 1380.57 534.074 1406.79 534.125 1433 534.37 C 1402.99 549.651 1362 574.948 1332.31 592.057 C 1284.22 619.19 1236.35 646.716 1188.7 674.633 C 1231.06 715.904 1272.16 758.729 1314.57 799.985 C 1324.34 809.494 1336.37 820.771 1344.85 831.252 C 1344.11 807.727 1344.61 781.937 1344.61 758.281 L 1344.65 628.25 C 1368.43 612.981 1393.92 600.693 1418.03 585.141 C 1419.48 622.239 1418.3 668.437 1418.28 706.122 L 1418.27 935.308 L 1345.96 935.303 C 1326.52 917.407 1305.72 894.387 1286.36 875.504 C 1231.78 822.271 1178.34 764.726 1123.43 712.041 C 1076.99 739.355 1030.36 766.351 983.545 793.028 C 921.996 827.505 861.172 864.294 799.527 898.851 C 780.742 909.382 755.291 926.548 735.54 934.505 C 731.78 936.02 704.33 935.483 698.603 935.463 L 629.435 935.26 C 628.748 908.77 629.405 879.485 629.404 852.758 L 629.344 690.584 L 629.26 235.789 C 653.111 260.375 679.876 286.56 702.745 311.52 L 703.266 881.283 C 811.869 819.763 919.085 754.789 1027.79 693.318 C 1044.25 684.007 1060.78 674.429 1076.95 664.637 C 1069.18 657.936 1058.98 647.256 1051.36 639.7 L 1000.03 588.105 L 865.339 452.914 C 805.822 393.984 746.837 334.519 688.391 274.526 C 676.726 262.515 632.812 219.056 625.497 207.751 z"/></svg>
  <strong style="letter-spacing:1px">AIxAI</strong>
  <span style="color:#9A968E">· Discovery Admin</span>
</div>
${inner}</div></body></html>`;
}

app.get("/admin", (req, res) => {
  if (!checkKey(req, res)) return;
  const files = fs
    .readdirSync(SUB_DIR)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .reverse();
  const rows = files
    .map((f) => {
      let c = {};
      try {
        c = JSON.parse(fs.readFileSync(path.join(SUB_DIR, f), "utf8"));
      } catch (e) {}
      const id = f.replace(".json", "");
      const nAns = Array.isArray(c.answers) ? c.answers.length : 0;
      const nAgency = Array.isArray(c.answers)
        ? c.answers.filter((a) => a.agency).length
        : 0;
      return `<tr>
        <td>${esc(id)}</td>
        <td>${esc(c.receivedAt || "—")}</td>
        <td>${nAns} answers · <span class="agency">${nAgency} ★</span></td>
        <td><a href="/admin/view/${esc(id)}?key=${esc(req.query.key)}">View</a> ·
            <a href="/admin/raw/${esc(id)}?key=${esc(req.query.key)}">JSON</a></td>
      </tr>`;
    })
    .join("");
  res.send(
    page(
      "Submissions",
      `<div class="card"><h1>Submissions (${files.length})</h1>
       <table><tr><th>Submission</th><th>Received</th><th>Summary</th><th></th></tr>${
         rows || "<tr><td colspan=4>No submissions yet.</td></tr>"
       }</table></div>`
    )
  );
});

app.get("/admin/view/:id", (req, res) => {
  if (!checkKey(req, res)) return;
  const file = path.join(SUB_DIR, req.params.id.replace(/[^\w\-]/g, "") + ".json");
  if (!fs.existsSync(file)) return res.status(404).send(page("Not found", "<div class='card'>Not found</div>"));
  const rec = JSON.parse(fs.readFileSync(file, "utf8"));
  const c = rec.contact || {};
  const pills = [];
  if (c.business) pills.push(`Business: ${esc(c.business)}`);
  if (c.name) pills.push(`Filled by: ${esc(c.name)}`);
  if (c.email) pills.push(`Email: ${esc(c.email)}`);
  if (c.phone) pills.push(`Phone: ${esc(c.phone)}`);
  pills.push(`Received: ${esc(rec.receivedAt)}`);
  let html = `<div class="card"><h1>${esc(c.business || "Submission")}</h1>
    <p>${pills.map((p) => `<span class="pill">${p}</span>`).join(" ")}</p></div><div class="card">`;
  let lastSec = "";
  for (const a of rec.answers) {
    if (a.section !== lastSec) {
      html += `<div class="sec">${esc(a.section)}</div>`;
      lastSec = a.section;
    }
    const ans = a.agency
      ? `<span class="agency">★ Left to AIxAI (agency's discretion)</span>${
          a.answer ? " — <em>note:</em> " + esc(a.answer) : ""
        }`
      : esc(a.answer || "—");
    html += `<table><tr><td style="width:46%" class="q">${esc(a.q)}</td><td>${ans}</td></tr></table>`;
  }
  html += `</div>`;
  res.send(page("View submission", html));
});

app.get("/admin/raw/:id", (req, res) => {
  if (!checkKey(req, res)) return;
  const file = path.join(SUB_DIR, req.params.id.replace(/[^\w\-]/g, "") + ".json");
  if (!fs.existsSync(file)) return res.status(404).json({ error: "not found" });
  res.download(file);
});

app.get("/health", (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`AIxAI questionnaire running on port ${PORT}`);
  console.log(`Data dir: ${DATA_DIR}`);
  if (ADMIN_KEY === "change-me")
    console.warn("WARNING: set ADMIN_KEY env variable before deploying!");
});
