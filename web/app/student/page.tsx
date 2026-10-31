import { redirect } from "next/navigation";
import { getCanonicalCartridge } from "@/lib/data/cartridge";
import { StudentAssessmentView } from "@/components/assessment/StudentAssessmentView";
import { getAuthSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "سنجش و تمرین مفهومی ریاضی | دوره دوم ابتدایی",
  description: "ارزیابی تشخیصی، ردیابی شناختی و تمرین‌های تعاملی ریاضی دوره دوم ابتدایی",
};

interface StudentPageProps {
  searchParams?: Promise<{ subject?: string; topics?: string; start?: string }>;
}

export default async function StudentPage({ searchParams }: StudentPageProps) {
  const user = await getAuthSession();
  const params = searchParams ? await searchParams : {};
  const subjectId = params?.subject || "SUBJ-MATH4-FRACTIONS";
  const initialTopicIds = params?.topics ? params.topics.split(",").filter(Boolean) : undefined;
  const initialStarted = params?.start === "1";

  if (!user) {
    redirect(`/login?role=student&redirect=${encodeURIComponent(`/student?subject=${subjectId}`)}`);
  }

  const [cartridgeG4, cartridgeG5] = await Promise.all([
    getCanonicalCartridge("grade4_math_ch2.json"),
    getCanonicalCartridge("grade5_math_ch3.json"),
  ]);

  const cartridges = {
    "SUBJ-MATH4-FRACTIONS": cartridgeG4,
    "SUBJ-MATH5-RATIO": cartridgeG5,
  };

  const defaultStudentName = user.displayName;
  const defaultStudentUsername = user.username;

  return (
    <div className="w-full">
      <StudentAssessmentView
        initialSubjectId={subjectId}
        initialTopicIds={initialTopicIds}
        initialStarted={initialStarted}
        studentName={defaultStudentName}
        studentUsername={defaultStudentUsername}
        cartridges={cartridges}
      />
    </div>
  );
}
