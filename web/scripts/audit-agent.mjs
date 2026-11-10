import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE_URL = "http://localhost:3000";
const SECRET_KEY = process.env.AUTH_SECRET || "edu_platform_secret_key_production_foss_2026";
const OUTPUT_DIR = "C:\\Users\\Javad\\.gemini\\antigravity\\brain\\124884b8-4972-4872-8fa0-8758a24aed4a\\audit_screenshots";

// Helper to sign session tokens identical to web/lib/auth/token.ts
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

  async clearCookies() {
    await this.send("Network.clearBrowserCookies");
  }

  async navigate(url) {
    await this.send("Page.navigate", { url });
    await this.sleep(1500); // Wait for hydration
  }

  async evaluate(expression) {
    const res = await this.send("Runtime.evaluate", {
      expression,
      returnByValue: true,
    });
    return res.result?.value;
  }

  async screenshot(filename) {
    const res = await this.send("Page.captureScreenshot", { format: "png" });
    const buffer = Buffer.from(res.data, "base64");
    const filePath = path.join(OUTPUT_DIR, filename);
    fs.writeFileSync(filePath, buffer);
    console.log(`[Captured] ${filename} (${buffer.length} bytes)`);
    return filePath;
  }
}

async function runAudit() {
  console.log("=== Starting End-to-End User Experience Audit ===");

  const tmpProfile = path.join(os.tmpdir(), "chrome_audit_" + Date.now());
  const proc = spawn(CHROME_PATH, [
    "--headless=new",
    "--disable-gpu",
    "--remote-debugging-port=9222",
    `--user-data-dir=${tmpProfile}`,
  ]);

  // Wait for Chrome to boot
  await new Promise((r) => setTimeout(r, 2000));

  try {
    const versionRes = await fetch("http://127.0.0.1:9222/json/version");
    const versionData = await versionRes.json();
    console.log("Connected to Chrome:", versionData.Browser);

    const targetsRes = await fetch("http://127.0.0.1:9222/json/list");
    const targets = await targetsRes.json();
    const pageTarget = targets.find((t) => t.type === "page") || targets[0];

    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
    await new Promise((resolve) => (ws.onopen = resolve));
    const cdp = new CDPClient(ws);

    await cdp.send("Page.enable");
    await cdp.send("Network.enable");
    await cdp.send("Runtime.enable");

    // -------------------------------------------------------------
    // Test 1: Landing Page (Guest User View)
    // -------------------------------------------------------------
    console.log("\n--- Testing 1: Landing Page Desktop (1280x900) ---");
    await cdp.clearCookies();
    await cdp.setViewport(1280, 900, false);
    await cdp.navigate(BASE_URL);
    await cdp.screenshot("01_landing_desktop.png");

    console.log("\n--- Testing 1b: Landing Page Mobile (393x852) ---");
    await cdp.setViewport(393, 852, true);
    await cdp.navigate(BASE_URL);
    await cdp.screenshot("01_landing_mobile.png");

    // -------------------------------------------------------------
    // Test 2: Student Topic Selector (/student)
    // -------------------------------------------------------------
    console.log("\n--- Testing 2: Student Topic Selector ---");
    const studentToken = await signToken({
      id: "student_ali",
      username: "student_ali",
      displayName: "علی رضایی",
      role: "student",
      gradeLevel: 4,
    });
    await cdp.setCookie(studentToken);
    await cdp.setViewport(1280, 900, false);
    await cdp.navigate(`${BASE_URL}/student?subject=SUBJ-MATH4-FRACTIONS`);
    await cdp.screenshot("02_student_topic_selector.png");

    // -------------------------------------------------------------
    // Test 3: Active Assessment & Remediation Flow
    // -------------------------------------------------------------
    console.log("\n--- Testing 3: Active Assessment Flow ---");
    await cdp.navigate(`${BASE_URL}/student?subject=SUBJ-MATH4-FRACTIONS&start=1`);
    await cdp.screenshot("03_assessment_first_question.png");

    // Click on option B or distractor to trigger misconception if present
    const clickedDistractor = await cdp.evaluate(`
      (function() {
        const buttons = Array.from(document.querySelectorAll('button'));
        const distractorBtn = buttons.find(b => b.textContent.includes('ب') || b.textContent.includes('۲/۱۰') || b.textContent.includes('۳/۵'));
        if (distractorBtn) {
          distractorBtn.click();
          return true;
        }
        return false;
      })()
    `);
    console.log("Clicked distractor:", clickedDistractor);
    await cdp.sleep(800);
    await cdp.screenshot("04_assessment_after_option_click.png");

    // Check if remediation modal appeared
    const hasModal = await cdp.evaluate(`
      Boolean(document.querySelector('[role="dialog"]') || document.body.innerText.includes('نکته آموزشی') || document.body.innerText.includes('فرصت تفکر'))
    `);
    console.log("Remediation modal detected:", hasModal);

    // Click Early Finish button
    const clickedEarlyFinish = await cdp.evaluate(`
      (function() {
        const btn = document.querySelector('button[title="پایان زودهنگام آزمون"]');
        if (btn) {
          btn.click();
          return true;
        }
        return false;
      })()
    `);
    console.log("Clicked early finish button:", clickedEarlyFinish);
    await cdp.sleep(600);
    await cdp.screenshot("05_early_finish_modal.png");

    // Confirm early finish submission
    const confirmedSubmission = await cdp.evaluate(`
      (function() {
        const buttons = Array.from(document.querySelectorAll('button'));
        const submitBtn = buttons.find(b => b.textContent.includes('ثبت و مشاهده کارنامه'));
        if (submitBtn) {
          submitBtn.click();
          return true;
        }
        return false;
      })()
    `);
    console.log("Confirmed early submission:", confirmedSubmission);
    await cdp.sleep(1200);
    await cdp.screenshot("06_assessment_report_radar.png");

    // -------------------------------------------------------------
    // Test 4: Manipulative Workshop (/student/workshop)
    // -------------------------------------------------------------
    console.log("\n--- Testing 4: Interactive Workshop ---");
    await cdp.navigate(`${BASE_URL}/student/workshop?subject=SUBJ-MATH4-FRACTIONS`);
    await cdp.screenshot("07_workshop_fractions.png");

    // Switch to Balance Scale tab
    await cdp.evaluate(`
      (function() {
        const buttons = Array.from(document.querySelectorAll('button'));
        const scaleBtn = buttons.find(b => b.textContent.includes('ترازو'));
        if (scaleBtn) scaleBtn.click();
      })()
    `);
    await cdp.sleep(600);
    await cdp.screenshot("08_workshop_balance_scale.png");

    // -------------------------------------------------------------
    // Test 5: Student Mastery Card & FSRS Retention (/student/mastery)
    // -------------------------------------------------------------
    console.log("\n--- Testing 5: Student Mastery Card ---");
    await cdp.navigate(`${BASE_URL}/student/mastery?subject=SUBJ-MATH4-FRACTIONS`);
    await cdp.screenshot("09_student_mastery_card.png");

    // -------------------------------------------------------------
    // Test 6: Teacher Curation Desk & Class Analytics (/teacher)
    // -------------------------------------------------------------
    console.log("\n--- Testing 6: Teacher Curation Desk ---");
    const teacherToken = await signToken({
      id: "teacher_maryam",
      username: "teacher_maryam",
      displayName: "مریم حسینی",
      role: "teacher",
    });
    await cdp.clearCookies();
    await cdp.setCookie(teacherToken);
    await cdp.navigate(`${BASE_URL}/teacher?subject=SUBJ-MATH4-FRACTIONS`);
    await cdp.screenshot("10_teacher_desk_analytics.png");

    // -------------------------------------------------------------
    // Test 7: Admin Institutional Overview (/admin)
    // -------------------------------------------------------------
    console.log("\n--- Testing 7: Admin Dashboard ---");
    const adminToken = await signToken({
      id: "admin",
      username: "admin",
      displayName: "مدیر ارشد سامانه",
      role: "admin",
    });
    await cdp.clearCookies();
    await cdp.setCookie(adminToken);
    await cdp.navigate(`${BASE_URL}/admin`);
    await cdp.screenshot("11_admin_institutional_dashboard.png");

    console.log("\n=== Audit Completed Successfully! All Screenshots Saved ===");
  } catch (err) {
    console.error("Audit error:", err);
  } finally {
    proc.kill();
  }
}

runAudit();
