import { getCanonicalCartridge } from "@/lib/data/cartridge";
import { CurationStudio } from "@/components/curation/CurationStudio";
import { getClassDiagnosticStats } from "@/actions/analytics";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "میز بازبینی و تایید آموزگار | ریاضی چهارم",
  description: "پنل اختصاصی معلمان جهت بازبینی، تایید و تحلیل آموزشی سوالات تشخیصی",
};

export default async function TeacherPage() {
  const cartridge = getCanonicalCartridge();
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
