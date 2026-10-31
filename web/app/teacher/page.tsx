import { getCanonicalCartridge } from "@/lib/data/cartridge";
import { CurationStudio } from "@/components/curation/CurationStudio";
import { getClassDiagnosticStats } from "@/actions/analytics";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "میز بازبینی و تایید آموزگار | ریاضی دوره دوم ابتدایی",
  description: "پنل اختصاصی معلمان جهت بازبینی، تایید و تحلیل آموزشی سوالات تشخیصی",
};

interface TeacherPageProps {
  searchParams?: Promise<{ subject?: string }>;
}

export default async function TeacherPage({ searchParams }: TeacherPageProps) {
  const params = searchParams ? await searchParams : {};
  const subjectId = params?.subject || "SUBJ-MATH4-FRACTIONS";

  const cartridgeFile =
    subjectId === "SUBJ-MATH5-RATIO" || subjectId.includes("5")
      ? "grade5_math_ch3.json"
      : "grade4_math_ch2.json";

  const cartridge = getCanonicalCartridge(cartridgeFile);
  const diagnosticSummary = await getClassDiagnosticStats(cartridge.subject.id);

  return (
    <div className="w-full">
      <CurationStudio
        initialItems={cartridge.diagnostic_items}
        misconceptions={cartridge.misconceptions}
        subjectTitle={cartridge.title}
        kcStats={diagnosticSummary.kcStats}
        misconceptionStats={diagnosticSummary.misconceptionStats}
        totalStudents={diagnosticSummary.totalStudents}
        classAverageMastery={diagnosticSummary.classAverageMastery}
        mostPrevalentMisconception={diagnosticSummary.mostPrevalentMisconception}
      />
    </div>
  );
}
