import { describe, it, expect } from "vitest";
import { signSessionToken, verifySessionToken, SESSION_COOKIE_NAME, SessionUser } from "@/lib/auth/token";
import { middleware } from "@/middleware";
import { NextRequest } from "next/server";

describe("Authentication & RBAC Route Protection Engine", () => {
  const adminUser: SessionUser = {
    id: "usr_admin_1",
    username: "admin",
    displayName: "مدیر کلان سامانه",
    role: "admin",
  };

  const teacherUser: SessionUser = {
    id: "usr_teacher_1",
    username: "teacher_maryam",
    displayName: "مریم حسینی",
    role: "teacher",
  };

  const studentUser: SessionUser = {
    id: "usr_student_1",
    username: "student_ali",
    displayName: "علی رضایی",
    role: "student",
    gradeLevel: 4,
  };

  it("successfully signs and verifies a valid session token using Web Crypto", async () => {
    const token = await signSessionToken(studentUser);
    expect(token).toBeDefined();
    expect(token).toContain(".");

    const decoded = await verifySessionToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.username).toBe("student_ali");
    expect(decoded?.role).toBe("student");
  });

  it("rejects tampered or forged tokens with signature mismatch", async () => {
    const validToken = await signSessionToken(studentUser);
    const [encodedPayload, hmac] = validToken.split(".");

    // Forged payload with elevated role: 'admin'
    const forgedPayload = Buffer.from(
      JSON.stringify({ ...studentUser, role: "admin" })
    ).toString("base64url");

    const forgedToken = `${forgedPayload}.${hmac}`;
    const result = await verifySessionToken(forgedToken);
    expect(result).toBeNull();
  });

  it("redirects unauthenticated guest accessing /admin to /login with staff role", async () => {
    const req = new NextRequest("http://localhost:3000/admin");
    const res = await middleware(req);

    expect(res.status).toBe(307); // Next.js redirect
    const location = res.headers.get("location");
    expect(location).toContain("/login");
    expect(location).toContain("role=staff");
    expect(location).toContain("redirect=%2Fadmin");
  });

  it("redirects unauthenticated guest accessing /teacher to /login with staff role", async () => {
    const req = new NextRequest("http://localhost:3000/teacher?subject=SUBJ-MATH4-FRACTIONS");
    const res = await middleware(req);

    expect(res.status).toBe(307);
    const location = res.headers.get("location");
    expect(location).toContain("/login");
    expect(location).toContain("role=staff");
    expect(location).toContain("redirect=%2Fteacher%3Fsubject%3DSUBJ-MATH4-FRACTIONS");
  });

  it("redirects unauthenticated guest accessing /student to /login with student role", async () => {
    const req = new NextRequest("http://localhost:3000/student");
    const res = await middleware(req);

    expect(res.status).toBe(307);
    const location = res.headers.get("location");
    expect(location).toContain("/login");
    expect(location).toContain("role=student");
    expect(location).toContain("redirect=%2Fstudent");
  });

  it("blocks student role from accessing /admin", async () => {
    const token = await signSessionToken(studentUser);
    const req = new NextRequest("http://localhost:3000/admin", {
      headers: {
        cookie: `${SESSION_COOKIE_NAME}=${token}`,
      },
    });

    const res = await middleware(req);
    expect(res.status).toBe(307);
    const location = res.headers.get("location");
    expect(location).toContain("forbidden=admin_only");
  });

  it("allows admin to access /admin", async () => {
    const token = await signSessionToken(adminUser);
    const req = new NextRequest("http://localhost:3000/admin", {
      headers: {
        cookie: `${SESSION_COOKIE_NAME}=${token}`,
      },
    });

    const res = await middleware(req);
    expect(res.status).toBe(200);
  });

  it("allows teacher to access /teacher", async () => {
    const token = await signSessionToken(teacherUser);
    const req = new NextRequest("http://localhost:3000/teacher", {
      headers: {
        cookie: `${SESSION_COOKIE_NAME}=${token}`,
      },
    });

    const res = await middleware(req);
    expect(res.status).toBe(200);
  });

  it("allows public access to / without authentication", async () => {
    const req = new NextRequest("http://localhost:3000/");
    const res = await middleware(req);
    expect(res.status).toBe(200);
  });

  it("strictly ignores client-side localStorage injections and blocks unauthenticated requests", async () => {
    // Simulate an attacker setting localStorage keys in browser
    if (typeof window !== "undefined") {
      window.localStorage.setItem("role", "admin");
      window.localStorage.setItem("user", JSON.stringify({ role: "admin", username: "admin" }));
      window.localStorage.setItem("isAdmin", "true");
    }

    // A request without the cryptographically signed HttpOnly cookie MUST be blocked
    const req = new NextRequest("http://localhost:3000/admin");
    const res = await middleware(req);

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/login");
  });
});
