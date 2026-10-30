import { getCanonicalCartridge } from "@/lib/data/cartridge";
import { AssessmentCarousel } from "@/components/assessment/AssessmentCarousel";

export const dynamic = "force-dynamic";

export default async function HomePage() {
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
