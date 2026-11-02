"use server";

import { prisma } from "@/lib/db/prisma";
import { getAuthSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export interface TierDefinition {
  depth: number;
  key: string;
  title: string;
  singular: string;
  placeholder?: string;
}

export interface CurriculumFrameworkDTO {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  isActive: boolean;
  tierDefinitions: TierDefinition[];
}

export interface CurriculumNodeDTO {
  id: string;
  frameworkId: string;
  parentId: string | null;
  depth: number;
  nodeType: string;
  code: string | null;
  title: string;
  shortTitle: string | null;
  description: string | null;
  orderIndex: number;
  icon: string | null;
  color: string | null;
  metadata: any | null;
  isActive: boolean;
  childrenCount?: number;
  kcCount?: number;
  children?: CurriculumNodeDTO[];
}

export interface CreateCurriculumNodeInput {
  frameworkId: string;
  parentId?: string | null;
  nodeType?: string;
  code?: string;
  title: string;
  shortTitle?: string;
  description?: string;
  orderIndex?: number;
  icon?: string;
  color?: string;
  metadata?: any;
}

export interface UpdateCurriculumNodeInput {
  title?: string;
  shortTitle?: string;
  code?: string;
  description?: string;
  orderIndex?: number;
  icon?: string;
  color?: string;
  metadata?: any;
  isActive?: boolean;
}

/**
 * Fetch all available curriculum frameworks with their dynamic tier definitions.
 */
export async function getCurriculumFrameworksAction(): Promise<{
  success: boolean;
  frameworks: CurriculumFrameworkDTO[];
  error?: string;
}> {
  try {
    const frameworks = await prisma.curriculumFramework.findMany({
      orderBy: [{ isDefault: "desc" }, { name: "asc" }],
    });

    return {
      success: true,
      frameworks: frameworks.map((f) => ({
        id: f.id,
        code: f.code,
        name: f.name,
        description: f.description,
        isDefault: f.isDefault,
        isActive: f.isActive,
        tierDefinitions: (f.tierDefinitions as unknown as TierDefinition[]) || [],
      })),
    };
  } catch (err: any) {
    console.error("Failed to fetch curriculum frameworks:", err);
    return { success: false, frameworks: [], error: err.message };
  }
}

/**
 * Fetch full hierarchical tree for a curriculum framework.
 */
export async function getCurriculumTreeAction(frameworkCodeOrId?: string): Promise<{
  success: boolean;
  framework: CurriculumFrameworkDTO | null;
  nodes: CurriculumNodeDTO[];
  tree: CurriculumNodeDTO[];
  error?: string;
}> {
  try {
    let framework = null;
    if (frameworkCodeOrId) {
      framework = await prisma.curriculumFramework.findFirst({
        where: {
          OR: [{ id: frameworkCodeOrId }, { code: frameworkCodeOrId }],
        },
      });
    }

    if (!framework) {
      framework = await prisma.curriculumFramework.findFirst({
        where: { isDefault: true },
      });
    }

    if (!framework) {
      framework = await prisma.curriculumFramework.findFirst();
    }

    if (!framework) {
      return { success: false, framework: null, nodes: [], tree: [], error: "چارچوب آموزشی یافت نشد." };
    }

    // Fetch all nodes belonging to this framework
    const rawNodes = await prisma.curriculumNode.findMany({
      where: { frameworkId: framework.id },
      orderBy: [{ depth: "asc" }, { orderIndex: "asc" }, { title: "asc" }],
      include: {
        _count: {
          select: {
            children: true,
            knowledgeComponents: true,
          },
        },
      },
    });

    const nodes: CurriculumNodeDTO[] = rawNodes.map((n) => ({
      id: n.id,
      frameworkId: n.frameworkId,
      parentId: n.parentId,
      depth: n.depth,
      nodeType: n.nodeType,
      code: n.code,
      title: n.title,
      shortTitle: n.shortTitle,
      description: n.description,
      orderIndex: n.orderIndex,
      icon: n.icon,
      color: n.color,
      metadata: n.metadata,
      isActive: n.isActive,
      childrenCount: n._count.children,
      kcCount: n._count.knowledgeComponents,
    }));

    // Assemble nested tree
    const nodeMap = new Map<string, CurriculumNodeDTO>();
    nodes.forEach((n) => nodeMap.set(n.id, { ...n, children: [] }));

    const tree: CurriculumNodeDTO[] = [];
    nodes.forEach((n) => {
      const nodeWithChildren = nodeMap.get(n.id)!;
      if (n.parentId && nodeMap.has(n.parentId)) {
        nodeMap.get(n.parentId)!.children!.push(nodeWithChildren);
      } else {
        tree.push(nodeWithChildren);
      }
    });

    const frameworkDTO: CurriculumFrameworkDTO = {
      id: framework.id,
      code: framework.code,
      name: framework.name,
      description: framework.description,
      isDefault: framework.isDefault,
      isActive: framework.isActive,
      tierDefinitions: (framework.tierDefinitions as unknown as TierDefinition[]) || [],
    };

    return {
      success: true,
      framework: frameworkDTO,
      nodes,
      tree,
    };
  } catch (err: any) {
    console.error("Failed to fetch curriculum tree:", err);
    return { success: false, framework: null, nodes: [], tree: [], error: err.message };
  }
}

/**
 * Create a new node in the curriculum tree. Admin only.
 */
export async function createCurriculumNodeAction(input: CreateCurriculumNodeInput): Promise<{
  success: boolean;
  node?: CurriculumNodeDTO;
  error?: string;
}> {
  try {
    const user = await getAuthSession();
    if (!user || user.role !== "admin") {
      return { success: false, error: "دسترسی غیرمجاز: تنها مدیر کلان سامانه مجاز به تغییر ساختار است." };
    }

    if (!input.title || input.title.trim().length === 0) {
      return { success: false, error: "عنوان گره الزامی است." };
    }

    let calculatedDepth = 1;
    let nodeType = input.nodeType || "grade";

    if (input.parentId) {
      const parent = await prisma.curriculumNode.findUnique({
        where: { id: input.parentId },
      });
      if (!parent) {
        return { success: false, error: "گره والد انتخاب‌شده یافت نشد." };
      }
      calculatedDepth = parent.depth + 1;

      if (calculatedDepth > 4) {
        return { success: false, error: "حداکثر عمق سلسله‌مراتب آموزشی ۴ سطح است." };
      }

      // Automatically determine nodeType from framework tier definitions if not provided
      if (!input.nodeType) {
        const framework = await prisma.curriculumFramework.findUnique({
          where: { id: input.frameworkId },
        });
        const tiers = (framework?.tierDefinitions as unknown as TierDefinition[]) || [];
        const currentTier = tiers.find((t) => t.depth === calculatedDepth);
        nodeType = currentTier?.key || (calculatedDepth === 2 ? "book" : calculatedDepth === 3 ? "chapter" : "lesson");
      }
    }

    // Determine order index if omitted
    let orderIndex = input.orderIndex;
    if (orderIndex === undefined) {
      const lastSibling = await prisma.curriculumNode.findFirst({
        where: {
          frameworkId: input.frameworkId,
          parentId: input.parentId || null,
        },
        orderBy: { orderIndex: "desc" },
      });
      orderIndex = (lastSibling?.orderIndex ?? 0) + 1;
    }

    const created = await prisma.curriculumNode.create({
      data: {
        frameworkId: input.frameworkId,
        parentId: input.parentId || null,
        depth: calculatedDepth,
        nodeType,
        code: input.code?.trim() || null,
        title: input.title.trim(),
        shortTitle: input.shortTitle?.trim() || null,
        description: input.description?.trim() || null,
        orderIndex,
        icon: input.icon || null,
        color: input.color || null,
        metadata: input.metadata || null,
        isActive: true,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/");
    revalidatePath("/student");

    return {
      success: true,
      node: {
        id: created.id,
        frameworkId: created.frameworkId,
        parentId: created.parentId,
        depth: created.depth,
        nodeType: created.nodeType,
        code: created.code,
        title: created.title,
        shortTitle: created.shortTitle,
        description: created.description,
        orderIndex: created.orderIndex,
        icon: created.icon,
        color: created.color,
        metadata: created.metadata,
        isActive: created.isActive,
      },
    };
  } catch (err: any) {
    console.error("Failed to create curriculum node:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Update an existing curriculum node. Admin only.
 */
export async function updateCurriculumNodeAction(
  id: string,
  input: UpdateCurriculumNodeInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getAuthSession();
    if (!user || user.role !== "admin") {
      return { success: false, error: "دسترسی غیرمجاز: تنها مدیر کلان سامانه مجاز به تغییر ساختار است." };
    }

    const existing = await prisma.curriculumNode.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, error: "گره مورد نظر یافت نشد." };
    }

    await prisma.curriculumNode.update({
      where: { id },
      data: {
        title: input.title !== undefined ? input.title.trim() : undefined,
        shortTitle: input.shortTitle !== undefined ? input.shortTitle.trim() : undefined,
        code: input.code !== undefined ? input.code.trim() : undefined,
        description: input.description !== undefined ? input.description.trim() : undefined,
        orderIndex: input.orderIndex !== undefined ? input.orderIndex : undefined,
        icon: input.icon !== undefined ? input.icon : undefined,
        color: input.color !== undefined ? input.color : undefined,
        metadata: input.metadata !== undefined ? input.metadata : undefined,
        isActive: input.isActive !== undefined ? input.isActive : undefined,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/");
    revalidatePath("/student");

    return { success: true };
  } catch (err: any) {
    console.error("Failed to update curriculum node:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Safely delete a curriculum node with dependency protection. Admin only.
 */
export async function deleteCurriculumNodeAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getAuthSession();
    if (!user || user.role !== "admin") {
      return { success: false, error: "دسترسی غیرمجاز: تنها مدیر کلان سامانه مجاز به حذف است." };
    }

    const node = await prisma.curriculumNode.findUnique({
      where: { id },
      include: {
        children: { select: { id: true } },
        knowledgeComponents: {
          select: {
            id: true,
            diagnosticItems: { select: { id: true, itemResponses: { select: { id: true } } } },
          },
        },
      },
    });

    if (!node) {
      return { success: false, error: "گره مورد نظر یافت نشد." };
    }

    // Protection rule: Check if attached Knowledge Components have student assessment session responses
    const totalResponses = node.knowledgeComponents.reduce(
      (sum, kc) =>
        sum +
        kc.diagnosticItems.reduce((iSum, item) => iSum + item.itemResponses.length, 0),
      0
    );

    if (totalResponses > 0) {
      return {
        success: false,
        error: `این سرفصل دارای ${totalResponses} پاسخ ارزیابی ثبت‌شده از دانش‌آموزان است و برای حفظ سلامت سوابق تحصیلی نمی‌تواند حذف شود. به جای حذف، می‌توانید آن را غیرفعال کنید.`,
      };
    }

    await prisma.curriculumNode.delete({
      where: { id },
    });

    revalidatePath("/admin");
    revalidatePath("/");
    revalidatePath("/student");

    return { success: true };
  } catch (err: any) {
    console.error("Failed to delete curriculum node:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Reorder sibling nodes in a single atomic transaction. Admin only.
 */
export async function reorderCurriculumNodesAction(
  items: { id: string; orderIndex: number }[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getAuthSession();
    if (!user || user.role !== "admin") {
      return { success: false, error: "دسترسی غیرمجاز." };
    }

    await prisma.$transaction(
      items.map((item) =>
        prisma.curriculumNode.update({
          where: { id: item.id },
          data: { orderIndex: item.orderIndex },
        })
      )
    );

    revalidatePath("/admin");
    revalidatePath("/");

    return { success: true };
  } catch (err: any) {
    console.error("Failed to reorder curriculum nodes:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Update the dynamic tier nomenclature definitions for a framework. Admin only.
 */
export async function updateFrameworkTierDefinitionsAction(
  frameworkId: string,
  tierDefinitions: TierDefinition[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getAuthSession();
    if (!user || user.role !== "admin") {
      return { success: false, error: "دسترسی غیرمجاز." };
    }

    if (!Array.isArray(tierDefinitions) || tierDefinitions.length === 0) {
      return { success: false, error: "تعاریف سطوح معتبر نیست." };
    }

    await prisma.curriculumFramework.update({
      where: { id: frameworkId },
      data: {
        tierDefinitions: tierDefinitions as any,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/");

    return { success: true };
  } catch (err: any) {
    console.error("Failed to update tier definitions:", err);
    return { success: false, error: err.message };
  }
}
