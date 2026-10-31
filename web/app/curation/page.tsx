import { getCanonicalCartridge } from "@/lib/data/cartridge";
import { CurationStudio } from "@/components/curation/CurationStudio";

export const metadata = {
  title: "میز بازبینی و تایید آموزگار | ریاضی چهارم",
  description: "پنل اختصاصی معلمان جهت بازبینی و تایید سوالات تشخیصی",
};

export default async function CurationPage() {
  const cartridge = getCanonicalCartridge();

  return (
    <div className="w-full">
      <CurationStudio
        initialItems={cartridge.diagnostic_items}
        misconceptions={cartridge.misconceptions}
        subjectTitle={cartridge.title}
      />
    </div>
  );
}
