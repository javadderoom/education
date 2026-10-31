import { getCanonicalCartridge } from "@/lib/data/cartridge";
import { AssessmentCarousel } from "@/components/assessment/AssessmentCarousel";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "سنجش و تمرین کسرها | پایه چهارم دبستان",
  description: "ارزیابی تشخیصی و تمرین‌های تعاملی مفهوم کسرها برای دانش‌آموزان",
};

export default async function StudentPage() {
  const cartridge = getCanonicalCartridge();

  return (
    <div className="w-full">
      <AssessmentCarousel
        items={cartridge.diagnostic_items}
        knowledgeComponents={cartridge.knowledge_components}
        misconceptions={cartridge.misconceptions}
        studentName="علی رضایی"
      />
    </div>
  );
}
