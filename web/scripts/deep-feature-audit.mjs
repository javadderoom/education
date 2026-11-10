import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE_URL = "http://localhost:3000";
const SECRET_KEY = process.env.AUTH_SECRET || "edu_platform_secret_key_production_foss_2026";
const AUDIT_DIR = "C:\\Users\\Javad\\.gemini\\antigravity\\brain\\124884b8-4972-4872-8fa0-8758a24aed4a\\deep_feature_audit";

if (!fs.existsSync(AUDIT_DIR)) {
  fs.mkdirSync(AUDIT_DIR, { recursive: true });
}

async function signToken(user) {
  const json = JSON.stringify(user);
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(SECRET_KEY),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(json));
  const hmacHex = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const encodedPayload = Buffer.from(json).toString("base64url");
  return `${encodedPayload}.${hmacHex}`;
}

class CDPClient {
  constructor(ws) {
    this.ws = ws;
    this.id = 1;
    this.callbacks = new Map();
    this.consoleLogs = [];
    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.method === "Runtime.consoleAPICalled") {
        this.consoleLogs.push({
          type: msg.params.type,
          args: msg.params.args.map((a) => a.value || a.description),
        });
      }
      if (msg.id && this.callbacks.has(msg.id)) {
        const { resolve, reject } = this.callbacks.get(msg.id);
        this.callbacks.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message));
        else resolve(msg.result);
      }
    };
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  async setViewport(width, height, isMobile = false) {
    await this.send("Emulation.setDeviceMetricsOverride", {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: isMobile,
    });
  }

  async navigate(url) {
    await this.send("Page.navigate", { url });
    await this.sleep(1200);
  }

  async captureScreenshot(filename) {
    const res = await this.send("Page.captureScreenshot", { format: "png" });
    const buffer = Buffer.from(res.data, "base64");
    const fullPath = path.join(AUDIT_DIR, filename);
    fs.writeFileSync(fullPath, buffer);
    console.log(`[Audit Screenshot] -> ${filename}`);
  }

  async evaluate(expression) {
    const res = await this.send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    return res.result?.value;
  }

  async setCookie(token) {
    await this.send("Network.setCookie", {
      name: "edu_session_token",
      value: token,
      domain: "localhost",
      path: "/",
      httpOnly: true,
      secure: false,
    });
  }
}

async function runDeepAudit() {
  const remotePort = 9225;
  const userDataDir = path.join(os.tmpdir(), `chrome_audit_deep_${Date.now()}`);

  const chromeProc = spawn(
    CHROME_PATH,
    [
      `--remote-debugging-port=${remotePort}`,
      `--user-data-dir=${userDataDir}`,
      "--headless=new",
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-gpu",
      "about:blank",
    ],
    { stdio: "ignore" }
  );

  console.log("Starting Chrome CDP for deep feature audit...");
  let pageWsUrl = null;
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 200));
    try {
      const targetsRes = await fetch(`http://127.0.0.1:${remotePort}/json/list`);
      if (targetsRes.ok) {
        const targets = await targetsRes.json();
        const pageTarget = targets.find((t) => t.type === "page") || targets[0];
        if (pageTarget?.webSocketDebuggerUrl) {
          pageWsUrl = pageTarget.webSocketDebuggerUrl;
          break;
        }
      }
    } catch {}
  }

  if (!pageWsUrl) {
    chromeProc.kill();
    throw new Error("Cannot connect to Chrome remote debugging port.");
  }

  const ws = new WebSocket(pageWsUrl);
  await new Promise((resolve) => (ws.onopen = resolve));
  const cdp = new CDPClient(ws);

  await cdp.send("Page.enable");
  await cdp.send("DOM.enable");
  await cdp.send("Network.enable");
  await cdp.send("Runtime.enable");

  const studentToken = await signToken({
    id: "student_ali",
    username: "student_ali",
    displayName: "علی رضایی",
    role: "student",
    gradeLevel: 4,
  });
  await cdp.setCookie(studentToken);

  // -------------------------------------------------------------
  // Test 1: Desktop Assessment with TTS and Scratchpad
  // -------------------------------------------------------------
  console.log("\n--- Audit 1: Desktop Assessment (1280x800) ---");
  await cdp.setViewport(1280, 800);
  await cdp.navigate(`${BASE_URL}/student?subject=SUBJ-MATH4-FRACTIONS&start=1`);
  await cdp.captureScreenshot("audit_01_desktop_assessment.png");

  // Check speech button presence and state
  const speechBtnText = await cdp.evaluate(`(() => {
    const btn = document.querySelector('button[title*="روخوانی صوتی"]');
    return btn ? btn.textContent.trim() : null;
  })()`);
  console.log("Speech button text:", speechBtnText);

  // Click speech button to test TTS trigger
  await cdp.evaluate(`(() => {
    const btn = document.querySelector('button[title*="روخوانی صوتی"]');
    if (btn) btn.click();
  })()`);
  await cdp.sleep(500);
  await cdp.captureScreenshot("audit_02_tts_active_state.png");

  // -------------------------------------------------------------
  // Test 2: Scratchpad Drawing and Controls
  // -------------------------------------------------------------
  console.log("\n--- Audit 2: Scratchpad Canvas & Drawing ---");
  await cdp.evaluate(`(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const scratch = btns.find(b => b.textContent && b.textContent.includes('چرک‌نویس'));
    if (scratch) scratch.click();
  })()`);
  await cdp.sleep(600);

  // Simulate mouse draw on the scratchpad canvas
  const drawn = await cdp.evaluate(`(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return false;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;

    // Simulate simple drawing strokes: "2/3 + 1/3 = 3/3"
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(100, 100);
    ctx.lineTo(250, 100);
    ctx.lineTo(150, 200);
    ctx.stroke();

    ctx.font = '24px Sahel, sans-serif';
    ctx.fillStyle = '#334155';
    ctx.fillText('محاسبه دانش‌آموز: ۱/۴ + ۲/۴ = ۳/۴', 100, 260);
    return true;
  })()`);
  console.log("Simulated canvas scratch note drawn:", drawn);
  await cdp.sleep(500);
  await cdp.captureScreenshot("audit_03_scratchpad_with_drawings.png");

  // Toggle transparent glass mode
  await cdp.evaluate(`(() => {
    const btn = document.querySelector('button[title*="شیشه‌ای"]');
    if (btn) btn.click();
  })()`);
  await cdp.sleep(500);
  await cdp.captureScreenshot("audit_04_scratchpad_glass_mode.png");

  // Test Minimize
  await cdp.evaluate(`(() => {
    const btn = document.querySelector('button[title*="کوچک‌نمایی"]');
    if (btn) btn.click();
  })()`);
  await cdp.sleep(500);
  await cdp.captureScreenshot("audit_05_scratchpad_minimized.png");

  // -------------------------------------------------------------
  // Test 3: Mobile Viewport (393x852) Assessment & Scratchpad
  // -------------------------------------------------------------
  console.log("\n--- Audit 3: Mobile Viewport Assessment (393x852) ---");
  await cdp.setViewport(393, 852, true);
  await cdp.sleep(600);
  await cdp.captureScreenshot("audit_06_mobile_assessment_view.png");

  // Open scratchpad on mobile
  await cdp.evaluate(`(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('چرک‌نویس'));
    if (btn) btn.click();
  })()`);
  await cdp.sleep(600);
  await cdp.captureScreenshot("audit_07_mobile_scratchpad_open.png");

  // -------------------------------------------------------------
  // Test 4: Classroom Join Code in Topic Selector
  // -------------------------------------------------------------
  console.log("\n--- Audit 4: Student Join Classroom ---");
  await cdp.setViewport(1280, 800, false);
  await cdp.navigate(`${BASE_URL}/student?subject=SUBJ-MATH4-FRACTIONS`);
  await cdp.sleep(800);

  // Click Join Class button
  await cdp.evaluate(`(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('پیوستن به کلاس'));
    if (btn) btn.click();
  })()`);
  await cdp.sleep(600);
  await cdp.captureScreenshot("audit_08_join_class_modal_open.png");

  // Test submitting invalid code
  await cdp.evaluate(`(() => {
    const input = document.querySelector('input[placeholder*="CLASS-"]');
    if (input) {
      input.value = 'INVALID_CODE_999';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    const submitBtn = document.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.click();
  })()`);
  await cdp.sleep(1000);
  await cdp.captureScreenshot("audit_09_join_class_error_state.png");

  // Test submitting valid code
  await cdp.evaluate(`(() => {
    const input = document.querySelector('input[placeholder*="CLASS-"]');
    if (input) {
      input.value = 'CLASS-GRADE4-A';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    const submitBtn = document.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.click();
  })()`);
  await cdp.sleep(1200);
  await cdp.captureScreenshot("audit_10_join_class_success_state.png");

  // -------------------------------------------------------------
  // Test 5: Teacher Desk Matrix Heatmap & Filters
  // -------------------------------------------------------------
  console.log("\n--- Audit 5: Teacher Desk 2D Mastery Matrix ---");
  const teacherToken = await signToken({
    id: "cmvwthvmm000bd4vfm4yqjiti",
    username: "teacher_maryam",
    displayName: "مریم حسینی",
    role: "teacher",
    gradeLevel: 4,
  });
  await cdp.setCookie(teacherToken);
  await cdp.navigate(`${BASE_URL}/teacher?subject=SUBJ-MATH4-FRACTIONS`);
  await cdp.sleep(1000);

  // Click Heatmap tab
  await cdp.evaluate(`(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const tab = btns.find(b => b.textContent && b.textContent.includes('نقشه حرارتی'));
    if (tab) tab.click();
  })()`);
  await cdp.sleep(600);

  // Click 2D Matrix sub-tab
  await cdp.evaluate(`(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const tab = btns.find(b => b.textContent && b.textContent.includes('ماتریس انفرادی'));
    if (tab) tab.click();
  })()`);
  await cdp.sleep(800);
  await cdp.captureScreenshot("audit_11_teacher_matrix_full.png");

  // Test filtering by "نیاز به مداخله"
  await cdp.evaluate(`(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && b.textContent.includes('نیاز به مداخله'));
    if (btn) btn.click();
  })()`);
  await cdp.sleep(600);
  await cdp.captureScreenshot("audit_12_teacher_matrix_struggling_filter.png");

  // -------------------------------------------------------------
  // Test 6: Admin Cartridge Uploader
  // -------------------------------------------------------------
  console.log("\n--- Audit 6: Admin Cartridge Importer ---");
  const adminToken = await signToken({
    id: "admin_super",
    username: "admin_super",
    displayName: "مدیر ارشد سامانه",
    role: "admin",
  });
  await cdp.setCookie(adminToken);
  await cdp.navigate(`${BASE_URL}/admin`);
  await cdp.sleep(1000);

  // Switch to Curricula tab
  await cdp.evaluate(`(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const tab = btns.find(b => b.textContent && b.textContent.includes('بسته‌های درسی'));
    if (tab) tab.click();
  })()`);
  await cdp.sleep(800);
  await cdp.captureScreenshot("audit_13_admin_curricula_tab.png");

  // -------------------------------------------------------------
  // Test 7: Student Finished Exam Screen (Looking for gaps)
  // -------------------------------------------------------------
  console.log("\n--- Audit 7: Student Exam Completed Screen ---");
  await cdp.setCookie(studentToken);
  await cdp.navigate(`${BASE_URL}/student?subject=SUBJ-MATH4-FRACTIONS&start=1`);
  await cdp.sleep(800);

  // Trigger early finish to view completion screen
  await cdp.evaluate(`(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const early = btns.find(b => b.title && b.title.includes('پایان زودهنگام') || (b.textContent && b.textContent.includes('اتمام آزمون')));
    if (early) early.click();
  })()`);
  await cdp.sleep(500);

  // Confirm in modal
  await cdp.evaluate(`(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const confirm = btns.find(b => b.textContent && b.textContent.includes('بله، مشاهده کارنامه'));
    if (confirm) confirm.click();
  })()`);
  await cdp.sleep(1000);
  await cdp.captureScreenshot("audit_14_exam_completed_screen.png");

  ws.close();
  chromeProc.kill();
  console.log("\n=== Deep Audit Finished! All 14 checkpoints recorded! ===");
}

runDeepAudit().catch((err) => {
  console.error("Deep audit failed:", err);
  process.exit(1);
});
