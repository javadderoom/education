import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE_URL = "http://localhost:3000";
const SECRET_KEY = process.env.AUTH_SECRET || "edu_platform_secret_key_production_foss_2026";
const AUDIT_DIR = "C:\\Users\\Javad\\.gemini\\antigravity\\brain\\124884b8-4972-4872-8fa0-8758a24aed4a\\deep_feature_audit";

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
    const fullPath = path.join(AUDIT_DIR, filename);
    fs.writeFileSync(fullPath, buffer);
    console.log(`[Verified Screenshot] -> ${filename}`);
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
      sameSite: "Lax",
    });
  }
}

async function run() {
  const tmpDir = path.join(os.tmpdir(), "chrome-feature-verify-" + Date.now());
  const chromeProc = spawn(CHROME_PATH, [
    "--remote-debugging-port=9223",
    "--headless=new",
    `--user-data-dir=${tmpDir}`,
    "--no-first-run",
    "--no-default-browser-check",
    "about:blank",
  ]);

  await new Promise((r) => setTimeout(r, 1500));

  let wsUrl = null;
  for (let i = 0; i < 10; i++) {
    try {
      const res = await fetch("http://127.0.0.1:9223/json/list");
      const list = await res.json();
      const pageTarget = list.find((t) => t.type === "page");
      if (pageTarget?.webSocketDebuggerUrl) {
        wsUrl = pageTarget.webSocketDebuggerUrl;
        break;
      }
    } catch {
      await new Promise((r) => setTimeout(r, 300));
    }
  }

  if (!wsUrl) throw new Error("Could not connect to Chrome debugging target on port 9223");

  const ws = new WebSocket(wsUrl);
  await new Promise((r) => (ws.onopen = r));

  const cdp = new CDPClient(ws);
  await cdp.send("Page.enable");
  await cdp.send("Network.enable");
  await cdp.send("Runtime.enable");

  // 1. Verify Student Exam Completed Screen with Detailed Question Review
  console.log("\n--- Check 1: Student Exam Review in Completed Screen ---");
  const studentToken = await signToken({
    id: "cmvwthvmm0001d4vf6l103t7q",
    username: "student_ali",
    displayName: "علی رضایی",
    role: "student",
    gradeLevel: 4,
  });
  await cdp.setCookie(studentToken);
  await cdp.setViewport(1280, 900, false);
  await cdp.navigate(`${BASE_URL}/student?subject=SUBJ-MATH4-FRACTIONS&start=1`);
  await cdp.sleep(1200);

  // Clear any existing modal by clicking "هنوز مطمئن نیستم" or an option
  await cdp.evaluate(`(() => {
    const notSureBtn = Array.from(document.querySelectorAll('button')).find(
      (b) => b.textContent && b.textContent.includes('هنوز مطمئن نیستم')
    );
    if (notSureBtn) notSureBtn.click();
  })()`);
  await cdp.sleep(800);

  // Click "اتمام آزمون" button
  await cdp.evaluate(`(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const early = btns.find(
      (b) => (b.title && b.title.includes('پایان زودهنگام')) ||
             (b.textContent && b.textContent.includes('اتمام آزمون'))
    );
    if (early) early.click();
  })()`);
  await cdp.sleep(500);

  // Click "ثبت و مشاهده کارنامه"
  await cdp.evaluate(`(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const confirm = btns.find(
      (b) => b.textContent && b.textContent.includes('ثبت و مشاهده کارنامه')
    );
    if (confirm) confirm.click();
  })()`);
  await cdp.sleep(1000);

  // Expand the Question Review Accordion
  await cdp.evaluate(`(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const reviewBtn = btns.find(
      (b) => b.textContent && b.textContent.includes('مرور سوالات')
    );
    if (reviewBtn) reviewBtn.click();
  })()`);
  await cdp.sleep(800);
  await cdp.captureScreenshot("audit_15_exam_review_accordion_expanded.png");

  // 2. Verify Teacher Print Button & Header
  console.log("\n--- Check 2: Teacher Print Report Capability ---");
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

  // Switch to Heatmap
  await cdp.evaluate(`(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const tab = btns.find(b => b.textContent && b.textContent.includes('نقشه حرارتی'));
    if (tab) tab.click();
  })()`);
  await cdp.sleep(600);

  // Switch to 2D matrix
  await cdp.evaluate(`(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const tab = btns.find(b => b.textContent && b.textContent.includes('ماتریس انفرادی'));
    if (tab) tab.click();
  })()`);
  await cdp.sleep(800);
  await cdp.captureScreenshot("audit_16_teacher_matrix_with_print_button.png");

  // 3. Verify Admin Cartridge Uploader Template Download & Sample Preview
  console.log("\n--- Check 3: Admin Cartridge Template & Sample Preview ---");
  const adminToken = await signToken({
    id: "admin_super",
    username: "admin_super",
    displayName: "مدیر ارشد سامانه",
    role: "admin",
  });
  await cdp.setCookie(adminToken);
  await cdp.navigate(`${BASE_URL}/admin`);
  await cdp.sleep(1000);

  // Curricula tab
  await cdp.evaluate(`(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const tab = btns.find(b => b.textContent && b.textContent.includes('بسته‌های درسی'));
    if (tab) tab.click();
  })()`);
  await cdp.sleep(800);

  // Simulate parsing a package to inspect the sample questions preview
  await cdp.evaluate(`(() => {
    // Dispatch a synthetic change event on the file input or simulate JSON validation
    const mockJson = {
      cartridge_id: "math_grade5_ch4_preview",
      title: "فصل ۴ ریاضی پنجم: تقارن و مختصات (آزمایشی)",
      subject: { name: "ریاضی پنجم", grade_level: 5 },
      knowledge_components: [{ id: "KC-COORD-01", title: "مختصات نقاط" }],
      misconceptions: [{ code: "SWAP_XY", name: "جابجایی طول و عرض" }],
      diagnostic_items: [
        {
          id: "ITEM-01",
          stem: "نقطه الف دارای ۳ واحد طول و ۵ واحد عرض است. مختصات آن کدام است؟",
          kc_id: "KC-COORD-01",
          options: [{ label: "الف", content: "(۳ ، ۵)" }, { label: "ب", content: "(۵ ، ۳)" }]
        },
        {
          id: "ITEM-02",
          stem: "اگر از مبدا مختصات ۴ واحد به راست و ۲ واحد به بالا حرکت کنیم، به کدام نقطه می‌رسیم؟",
          kc_id: "KC-COORD-01",
          options: [{ label: "الف", content: "(۴ ، ۲)" }, { label: "ب", content: "(۲ ، ۴)" }]
        }
      ]
    };

    // We can simulate filing the input using FileReader mock or triggering validateJson
    const event = new CustomEvent("mock-cartridge-load", { detail: mockJson });
    window.dispatchEvent(event);
  })()`);
  await cdp.captureScreenshot("audit_17_admin_cartridge_downloader_button.png");

  ws.close();
  chromeProc.kill();
  console.log("\n=== Additional Verification Complete! ===");
}

run().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
