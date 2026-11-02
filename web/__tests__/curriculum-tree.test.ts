import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "../lib/db/prisma";
import {
  getCurriculumFrameworksAction,
  getCurriculumTreeAction,
  createCurriculumNodeAction,
  updateCurriculumNodeAction,
  deleteCurriculumNodeAction,
  updateFrameworkTierDefinitionsAction,
} from "../actions/curriculum";

// Mock authentication session to test admin and non-admin scenarios
const mockGetAuthSession = vi.fn();
vi.mock("@/lib/auth/session", () => ({
  getAuthSession: () => mockGetAuthSession(),
}));

// Mock revalidatePath
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("Universal Polymorphic Curriculum Hierarchy Engine", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAuthSession.mockResolvedValue({
      id: "admin_test",
      username: "admin_user",
      displayName: "مدیر سیستم",
      role: "admin",
    });
  });

  it("fetches all three seeded curriculum frameworks with dynamic tier definitions", async () => {
    const res = await getCurriculumFrameworksAction();
    expect(res.success).toBe(true);
    expect(res.frameworks.length).toBeGreaterThanOrEqual(3);

    const codes = res.frameworks.map((f) => f.code);
    expect(codes).toContain("k12");
    expect(codes).toContain("university");
    expect(codes).toContain("bootcamp");

    const k12 = res.frameworks.find((f) => f.code === "k12")!;
    expect(k12.isDefault).toBe(true);
    expect(k12.tierDefinitions).toHaveLength(4);
    expect(k12.tierDefinitions[0].title).toBe("پایه تحصیلی");
    expect(k12.tierDefinitions[1].title).toBe("کتاب / عنوان درس");
    expect(k12.tierDefinitions[2].title).toBe("فصل / بخش");
    expect(k12.tierDefinitions[3].title).toBe("درس / سرفصل آموزشی");
  });

  it("retrieves full 4-tier K-12 hierarchical tree with grades, books, chapters and lessons", async () => {
    const res = await getCurriculumTreeAction("k12");
    expect(res.success).toBe(true);
    expect(res.framework?.code).toBe("k12");
    expect(res.tree.length).toBeGreaterThanOrEqual(2); // Grade 4 and Grade 5

    const g4Node = res.tree.find((n) => n.code === "G4");
    expect(g4Node).toBeDefined();
    expect(g4Node?.depth).toBe(1);
    expect(g4Node?.nodeType).toBe("grade");
    expect(g4Node?.title).toContain("پایه چهارم");

    // Check Level 2: Book
    const math4Book = g4Node?.children?.find((c) => c.code === "MATH4");
    expect(math4Book).toBeDefined();
    expect(math4Book?.depth).toBe(2);
    expect(math4Book?.nodeType).toBe("book");

    // Check Level 3: Chapters
    const ch2Fractions = math4Book?.children?.find((c) => c.code === "CH02");
    expect(ch2Fractions).toBeDefined();
    expect(ch2Fractions?.depth).toBe(3);
    expect(ch2Fractions?.title).toContain("کسرها");

    // Check Level 4: Lessons
    expect(ch2Fractions?.children?.length).toBe(5);
    const lesson1 = ch2Fractions?.children?.[0];
    expect(lesson1?.depth).toBe(4);
    expect(lesson1?.nodeType).toBe("lesson");
    expect(lesson1?.kcCount).toBeGreaterThanOrEqual(1);
  });

  it("retrieves Higher Ed / University framework tree with major, course, unit and lecture", async () => {
    const res = await getCurriculumTreeAction("university");
    expect(res.success).toBe(true);
    expect(res.framework?.code).toBe("university");

    const majorNode = res.tree.find((n) => n.code === "BS-CS");
    expect(majorNode).toBeDefined();
    expect(majorNode?.depth).toBe(1);
    expect(majorNode?.title).toContain("مهندسی کامپیوتر");

    const courseNode = majorNode?.children?.find((c) => c.code === "MATH101");
    expect(courseNode).toBeDefined();
    expect(courseNode?.depth).toBe(2);
    expect(courseNode?.title).toContain("ریاضی عمومی ۱");
  });

  it("retrieves Bootcamp framework tree with track, course, sprint and microskill", async () => {
    const res = await getCurriculumTreeAction("bootcamp");
    expect(res.success).toBe(true);
    expect(res.framework?.code).toBe("bootcamp");

    const trackNode = res.tree.find((n) => n.code === "TRK-FS");
    expect(trackNode).toBeDefined();
    expect(trackNode?.depth).toBe(1);
    expect(trackNode?.title).toContain("فول‌استک وب");

    const nextCourse = trackNode?.children?.find((c) => c.code === "NEXT16");
    expect(nextCourse).toBeDefined();
    expect(nextCourse?.depth).toBe(2);
    expect(nextCourse?.title).toContain("Next.js");
  });

  it("enforces admin authorization when creating or modifying nodes", async () => {
    mockGetAuthSession.mockResolvedValueOnce({
      id: "student_1",
      role: "student",
      username: "student_user",
    });

    const createRes = await createCurriculumNodeAction({
      frameworkId: "FRAMEWORK-K12",
      title: "پایه جدید غیرمجاز",
    });

    expect(createRes.success).toBe(false);
    expect(createRes.error).toContain("دسترسی غیرمجاز");
  });

  it("creates, updates and safely deletes a new curriculum node in the database", async () => {
    const fw = await prisma.curriculumFramework.findUnique({ where: { code: "k12" } });
    expect(fw).toBeTruthy();

    // 1. Create Level 1 node
    const createRes = await createCurriculumNodeAction({
      frameworkId: fw!.id,
      title: "پایه ششم ابتدایی آزمایشی",
      code: "G6-TEST",
      color: "amber",
      icon: "GraduationCap",
    });

    expect(createRes.success).toBe(true);
    const createdId = createRes.node!.id;
    expect(createRes.node?.depth).toBe(1);

    // 2. Create Level 2 child under it
    const createChildRes = await createCurriculumNodeAction({
      frameworkId: fw!.id,
      parentId: createdId,
      title: "علوم ششم آزمایشی",
      code: "SCI6-TEST",
    });

    expect(createChildRes.success).toBe(true);
    expect(createChildRes.node?.depth).toBe(2);
    const childId = createChildRes.node!.id;

    // 3. Update node
    const updateRes = await updateCurriculumNodeAction(createdId, {
      title: "پایه ششم ابتدایی به‌روزرسانی‌شده",
      description: "توضیحات تستی اضافه شد",
    });
    expect(updateRes.success).toBe(true);

    const updatedDb = await prisma.curriculumNode.findUnique({ where: { id: createdId } });
    expect(updatedDb?.title).toBe("پایه ششم ابتدایی به‌روزرسانی‌شده");

    // 4. Delete child and parent
    const delChild = await deleteCurriculumNodeAction(childId);
    expect(delChild.success).toBe(true);

    const delParent = await deleteCurriculumNodeAction(createdId);
    expect(delParent.success).toBe(true);

    const verifyDeleted = await prisma.curriculumNode.findUnique({ where: { id: createdId } });
    expect(verifyDeleted).toBeNull();
  });

  it("updates tier definitions for a framework dynamically", async () => {
    const fw = await prisma.curriculumFramework.findUnique({ where: { code: "bootcamp" } });
    expect(fw).toBeTruthy();

    const customTiers = [
      { depth: 1, key: "domain", title: "حوزه تخصصی", singular: "حوزه" },
      { depth: 2, key: "program", title: "برنامه جامع مهارتی", singular: "برنامه" },
      { depth: 3, key: "module", title: "ماژول آموزشی", singular: "ماژول" },
      { depth: 4, key: "unit", title: "واحد یادگیری", singular: "واحد" },
    ];

    const res = await updateFrameworkTierDefinitionsAction(fw!.id, customTiers);
    expect(res.success).toBe(true);

    const updated = await prisma.curriculumFramework.findUnique({ where: { id: fw!.id } });
    const tiers = updated?.tierDefinitions as any[];
    expect(tiers[0].title).toBe("حوزه تخصصی");
    expect(tiers[2].title).toBe("ماژول آموزشی");
  });
});
