import { redirect } from "next/navigation";
import { getCanonicalCartridge, listAvailableCartridges, CanonicalCartridge } from "@/lib/data/cartridge";
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

  const available = listAvailableCartridges();
  const cartridges: Record<string, CanonicalCartridge> = {};
  for (const item of available) {
    try {
      const c = getCanonicalCartridge(item.filename);
      cartridges[c.subject.id] = c;
      if (item.filename === "grade4_math_ch2.json") {
        cartridges["SUBJ-MATH4-FRACTIONS"] = c;
      }
    } catch {
      // Ignore unreadable cartridges
    }
  }

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
