import { getCanonicalCartridge } from "@/lib/data/cartridge";
import { AssessmentCarousel } from "@/components/assessment/AssessmentCarousel";
import { getLearnersList } from "@/actions/analytics";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "سنجش و تمرین کسرها | پایه چهارم دبستان",
  description: "ارزیابی تشخیصی و تمرین‌های تعاملی مفهوم کسرها برای دانش‌آموزان",
};

export default async function StudentPage() {
  const [cartridge, learnersData] = await Promise.all([
    getCanonicalCartridge(),
    getLearnersList(),
  ]);

  return (
    <div className="w-full">
      <AssessmentCarousel
        items={cartridge.diagnostic_items}
        knowledgeComponents={cartridge.knowledge_components}
        misconceptions={cartridge.misconceptions}
        learners={learnersData.learners}
        studentName="علی رضایی"
        studentUsername="student_ali"
      />
    </div>
  );
}
