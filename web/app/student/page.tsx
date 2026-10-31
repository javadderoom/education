import { redirect } from "next/navigation";
import { getCanonicalCartridge } from "@/lib/data/cartridge";
import { AssessmentCarousel } from "@/components/assessment/AssessmentCarousel";
import { getAuthSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "سنجش و تمرین مفهومی ریاضی | دوره دوم ابتدایی",
  description: "ارزیابی تشخیصی، ردیابی شناختی و تمرین‌های تعاملی ریاضی دوره دوم ابتدایی",
};

interface StudentPageProps {
  searchParams?: Promise<{ subject?: string }>;
}

export default async function StudentPage({ searchParams }: StudentPageProps) {
  const user = await getAuthSession();
  const params = searchParams ? await searchParams : {};
  const subjectId = params?.subject || "SUBJ-MATH4-FRACTIONS";

  if (!user) {
    redirect(`/login?role=student&redirect=${encodeURIComponent(`/student?subject=${subjectId}`)}`);
  }

  const cartridgeFile =
    subjectId === "SUBJ-MATH5-RATIO" || subjectId.includes("5")
      ? "grade5_math_ch3.json"
      : "grade4_math_ch2.json";

  const cartridge = await getCanonicalCartridge(cartridgeFile);

  const defaultStudentName = user.displayName;
  const defaultStudentUsername = user.username;

  return (
    <div className="w-full">
      <AssessmentCarousel
        items={cartridge.diagnostic_items}
        knowledgeComponents={cartridge.knowledge_components}
        misconceptions={cartridge.misconceptions}
        studentName={defaultStudentName}
        studentUsername={defaultStudentUsername}
      />
    </div>
  );
}
