import { getCanonicalCartridge } from "@/lib/data/cartridge";
import { AssessmentCarousel } from "@/components/assessment/AssessmentCarousel";
import { getLearnersList } from "@/actions/analytics";
import { getCurrentUserAction } from "@/actions/auth";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "سنجش و تمرین مفهومی ریاضی | دوره دوم ابتدایی",
  description: "ارزیابی تشخیصی، ردیابی شناختی و تمرین‌های تعاملی ریاضی دوره دوم ابتدایی",
};

interface StudentPageProps {
  searchParams?: Promise<{ subject?: string }>;
}

export default async function StudentPage({ searchParams }: StudentPageProps) {
  const params = searchParams ? await searchParams : {};
  const subjectId = params?.subject || "SUBJ-MATH4-FRACTIONS";

  const cartridgeFile =
    subjectId === "SUBJ-MATH5-RATIO" || subjectId.includes("5")
      ? "grade5_math_ch3.json"
      : "grade4_math_ch2.json";

  const [cartridge, learnersData, currentUser] = await Promise.all([
    getCanonicalCartridge(cartridgeFile),
    getLearnersList(),
    getCurrentUserAction(),
  ]);

  const defaultStudentName = currentUser?.displayName || (cartridge.subject.grade_level === 5 ? "محمدحسین مرادی" : "علی رضایی");
  const defaultStudentUsername = currentUser?.username || (cartridge.subject.grade_level === 5 ? "student_grade5_demo" : "student_demo");

  return (
    <div className="w-full">
      <AssessmentCarousel
        items={cartridge.diagnostic_items}
        knowledgeComponents={cartridge.knowledge_components}
        misconceptions={cartridge.misconceptions}
        learners={learnersData.learners}
        studentName={defaultStudentName}
        studentUsername={defaultStudentUsername}
      />
    </div>
  );
}
