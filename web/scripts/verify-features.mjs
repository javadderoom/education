import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE_URL = "http://localhost:3000";
const SECRET_KEY = process.env.AUTH_SECRET || "edu_platform_secret_key_production_foss_2026";
const OUTPUT_DIR = "C:\\Users\\Javad\\.gemini\\antigravity\\brain\\124884b8-4972-4872-8fa0-8758a24aed4a\\audit_screenshots";

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
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
    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
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
    const fullPath = path.join(OUTPUT_DIR, filename);
    fs.writeFileSync(fullPath, buffer);
    console.log(`[Captured] -> ${filename}`);
  }

  async evaluate(expression) {
    const res = await this.send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    return res.result?.value;
  }

  async setCookie(token, domain = "localhost") {
    await this.send("Network.setCookie", {
      name: "edu_session_token",
      value: token,
      domain,
      path: "/",
      httpOnly: true,
      secure: false,
    });
  }
}

async function main() {
  const remotePort = 9223;
  const userDataDir = path.join(os.tmpdir(), `chrome_verify_${Date.now()}`);

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

  console.log("Launched headless Chrome CDP...");
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
    throw new Error("Failed to connect to Chrome remote debugging port.");
  }

  const ws = new WebSocket(pageWsUrl);
  await new Promise((resolve) => (ws.onopen = resolve));
  const cdp = new CDPClient(ws);

  await cdp.send("Page.enable");
  await cdp.send("DOM.enable");
  await cdp.send("Network.enable");
  await cdp.setViewport(1280, 850);

  // Set student cookie
  const studentToken = await signToken({
    id: "student_ali",
    username: "student_ali",
    displayName: "علی رضایی",
    role: "student",
    gradeLevel: 4,
  });
  await cdp.setCookie(studentToken);

  // 1. Student Assessment with TTS & Scratchpad buttons
  console.log("1. Navigating to student assessment...");
  await cdp.navigate(`${BASE_URL}/student?subject=SUBJ-MATH4-FRACTIONS&start=1`);
  console.log(await cdp.evaluate('window.location.href + " | " + document.title'));
  await cdp.sleep(1200);
  await cdp.captureScreenshot("12_student_assessment_tts_scratchpad.png");

  // 2. Open Scratchpad Overlay
  console.log("2. Opening scratchpad canvas overlay...");
  await cdp.evaluate(`(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const scratch = btns.find(b => b.textContent && b.textContent.includes('چرک‌نویس'));
    if (scratch) scratch.click();
  })()`);
  await cdp.sleep(1000);
  await cdp.captureScreenshot("13_student_scratchpad_open.png");

  // 3. Student Topic Selector with Join Class button & modal
  console.log("3. Navigating to student topic selector...");
  await cdp.navigate(`${BASE_URL}/student?subject=SUBJ-MATH4-FRACTIONS`);
  await cdp.sleep(1000);
  await cdp.evaluate(`(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const joinBtn = btns.find(b => b.textContent && b.textContent.includes('پیوستن به کلاس'));
    if (joinBtn) joinBtn.click();
  })()`);
  await cdp.sleep(1000);
  await cdp.captureScreenshot("14_student_join_class_modal.png");

  // 4. Teacher Desk with Classroom Join Code & 2D Student Matrix
  console.log("4. Navigating to teacher desk...");
  const teacherToken = await signToken({
    id: "cmvwthvmm000bd4vfm4yqjiti",
    username: "teacher_maryam",
    displayName: "مریم حسینی",
    role: "teacher",
    gradeLevel: 4,
  });
  await cdp.setCookie(teacherToken);
  await cdp.navigate(`${BASE_URL}/teacher?subject=SUBJ-MATH4-FRACTIONS`);
  console.log(await cdp.evaluate('window.location.href + " | " + document.title'));
  await cdp.sleep(1200);

  // Switch to "نقشه حرارتی کلاس" tab
  await cdp.evaluate(`(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const heatTab = btns.find(b => b.textContent && b.textContent.includes('نقشه حرارتی'));
    if (heatTab) heatTab.click();
  })()`);
  await cdp.sleep(800);

  // Switch to "ماتریس انفرادی دانش‌آموزان" sub-tab
  await cdp.evaluate(`(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const matrixBtn = btns.find(b => b.textContent && b.textContent.includes('ماتریس انفرادی'));
    if (matrixBtn) matrixBtn.click();
  })()`);
  await cdp.sleep(1000);
  await cdp.captureScreenshot("15_teacher_individual_student_matrix.png");

  // 5. Admin Panel with Cartridge Package Importer
  console.log("5. Navigating to admin dashboard...");
  const adminToken = await signToken({
    id: "admin_super",
    username: "admin_super",
    displayName: "مدیر ارشد سامانه",
    role: "admin",
  });
  await cdp.setCookie(adminToken);
  await cdp.navigate(`${BASE_URL}/admin`);
  console.log(await cdp.evaluate('window.location.href + " | " + document.title'));
  await cdp.sleep(1200);

  // Switch to "بسته‌های درسی" tab
  await cdp.evaluate(`(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const currTab = btns.find(b => b.textContent && b.textContent.includes('بسته‌های درسی'));
    if (currTab) currTab.click();
  })()`);
  await cdp.sleep(800);
  await cdp.captureScreenshot("16_admin_cartridge_package_importer.png");

  ws.close();
  chromeProc.kill();
  console.log("All feature verification screenshots captured successfully!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
