import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { VolumePrismVisualizer } from "../components/parametric/VolumePrismVisualizer";
import { SymmetryPlayground } from "../components/parametric/SymmetryPlayground";
import { FractionAreaMultiplier } from "../components/parametric/FractionAreaMultiplier";
import { PolygonAreaDecomposer } from "../components/parametric/PolygonAreaDecomposer";
import { CircleMeasurementVisualizer } from "../components/parametric/CircleMeasurementVisualizer";
import { CompoundUnitCalculator } from "../components/parametric/CompoundUnitCalculator";
import { PlaceValueTable } from "../components/parametric/PlaceValueTable";
import { VisualTemplateRenderer } from "../components/parametric/VisualTemplateRegistry";

describe("Grade 5 Advanced Parametric Manipulatives Suite", () => {
  describe("VolumePrismVisualizer (3D Isometric Unit Cubes & Volume)", () => {
    it("renders isometric 3D canvas and volume calculation formula", () => {
      render(
        <VolumePrismVisualizer
          initialLength={4}
          initialWidth={3}
          initialHeight={2}
          showFormula={true}
        />
      );

      expect(screen.getByRole("img", { name: /نمایش حجم مکعب‌مستطیل/ })).toBeDefined();
      expect(screen.getByText("حجم = طول × عرض × ارتفاع")).toBeDefined();
      expect(screen.getByText("کل شکل (۲ لایه)")).toBeDefined();
    });

    it("allows toggling layer peeling to isolate a single floor", () => {
      render(
        <VolumePrismVisualizer
          initialLength={4}
          initialWidth={3}
          initialHeight={2}
        />
      );

      const layer1Btn = screen.getByText("لایه ۱");
      fireEvent.click(layer1Btn);
      expect(screen.getByRole("img", { name: /نمایش حجم مکعب‌مستطیل/ })).toBeDefined();
    });

    it("toggles transparent x-ray view mode", () => {
      render(<VolumePrismVisualizer />);
      const transparentBtn = screen.getByText("نمای شفاف").closest("button");
      expect(transparentBtn).not.toBeNull();
      fireEvent.click(transparentBtn!);
      expect(transparentBtn!.className).toContain("bg-indigo-600");
    });
  });

  describe("SymmetryPlayground (Axial & Central 180° Symmetry)", () => {
    it("renders central symmetry mode by default with center point O", () => {
      render(<SymmetryPlayground initialMode="central" initialShape="parallelogram" />);
      expect(screen.getByText("مرکز تقارن (O)")).toBeDefined();
      expect(screen.getByText(/متوازی‌الاضلاع خط تقارن ندارد/)).toBeDefined();
    });

    it("allows switching to axial symmetry mode with mirror line", () => {
      render(<SymmetryPlayground />);
      const axialBtn = screen.getByText("تقارن محوری (خطی)");
      fireEvent.click(axialBtn);
      expect(screen.getByText("خط تقارن")).toBeDefined();
    });

    it("switches preset shapes seamlessly", () => {
      render(<SymmetryPlayground />);
      const butterflyBtn = screen.getByText("شکل پروانه");
      fireEvent.click(butterflyBtn);
      expect(screen.getByText(/شکل پروانه دارای تقارن/)).toBeDefined();
    });
  });

  describe("FractionAreaMultiplier (2D Overlapping Area Multiplication)", () => {
    it("renders overlapping area model and calculates fraction product", () => {
      render(
        <FractionAreaMultiplier
          initialNumA={2}
          initialDenA={3}
          initialNumB={4}
          initialDenB={5}
        />
      );

      expect(screen.getByText("رابطه ریاضی ضرب کسرها:")).toBeDefined();
      expect(screen.getByText(/مساحت هم‌پوشانی/)).toBeDefined();
      expect(screen.getByText("۲ ستون از ۳ ستون")).toBeDefined();
      expect(screen.getByText("۴ سطر از ۵ سطر")).toBeDefined();
    });

    it("allows switching view layers between vertical, horizontal, and all", () => {
      render(<FractionAreaMultiplier />);
      const vertBtn = screen.getByText("کسر اول");
      fireEvent.click(vertBtn);
      expect(vertBtn.className).toContain("bg-white text-indigo-700");

      const horizBtn = screen.getByText("کسر دوم");
      fireEvent.click(horizBtn);
      expect(horizBtn.className).toContain("bg-white text-indigo-700");
    });
  });

  describe("PolygonAreaDecomposer (Trapezoid & Rhombus Area Derivation)", () => {
    it("renders trapezoid assembly and formula", () => {
      render(<PolygonAreaDecomposer initialShapeType="trapezoid" baseA={6} baseB={10} height={5} />);
      expect(screen.getByText("فرمول مساحت ذوزنقه:")).toBeDefined();
      expect(screen.getByText(/متوازی‌الاضلاع کامل با قاعده کل/)).toBeDefined();
    });

    it("switches to rhombus mode and displays diagonal dimensions", () => {
      render(<PolygonAreaDecomposer initialShapeType="trapezoid" />);
      const rhombusBtn = screen.getByText("لوزی");
      fireEvent.click(rhombusBtn);
      expect(screen.getByText("فرمول مساحت لوزی:")).toBeDefined();
      expect(screen.getAllByText(/قطر بزرگ/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/قطر کوچک/).length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("CircleMeasurementVisualizer (Circumference & Area Derivation)", () => {
    it("renders area slice decomposition by default", () => {
      render(<CircleMeasurementVisualizer initialMode="area_slices" initialRadius={3} />);
      expect(screen.getByText("فرمول مساحت دایره:")).toBeDefined();
      expect(screen.getByText(/قاعده مستطیل = نصف محیط دایره/)).toBeDefined();
    });

    it("switches to circumference rolling mode with linear ruler", () => {
      render(<CircleMeasurementVisualizer />);
      const circBtn = screen.getByText("محیط و عدد پی");
      fireEvent.click(circBtn);
      expect(screen.getByText("فرمول محیط دایره:")).toBeDefined();
      expect(screen.getByText("خط‌کش بر حسب سانتی‌متر")).toBeDefined();
      expect(screen.getByText(/محیط تقریباً ۳\.۱۴ برابر قطر است/)).toBeDefined();
    });
  });

  describe("CompoundUnitCalculator (Hours, Minutes, Seconds with Borrowing)", () => {
    it("renders compound time subtraction with 60-unit borrowing callout", () => {
      render(
        <CompoundUnitCalculator
          initialOp="subtract"
          initialH1={4}
          initialM1={15}
          initialS1={20}
          initialH2={1}
          initialM2={40}
          initialS2={45}
        />
      );

      expect(screen.getByText("قاعده طلایی عددهای مرکب:")).toBeDefined();
      expect(screen.getByText(/۶۰ واحد \(نه ۱۰ واحد!\) به ستون فعلی اضافه می‌شود/)).toBeDefined();
    });

    it("switches to addition mode", () => {
      render(<CompoundUnitCalculator />);
      const addBtn = screen.getByText("جمع زمان");
      fireEvent.click(addBtn);
      expect(screen.getByText("+")).toBeDefined();
    });
  });

  describe("PlaceValueTable Grade 5 Extensions (Billions & Decimals)", () => {
    it("renders billions tier correctly when specified or when number >= 1,000,000,000", () => {
      render(
        <PlaceValueTable
          number={5_420_180_000}
          tiers={["billions", "millions", "thousands", "ones"]}
          label="جدول ارزش مکانی تا طبقه میلیارد"
        />
      );

      expect(screen.getByText("طبقه میلیاردها")).toBeDefined();
      expect(screen.getByText("طبقه میلیون‌ها")).toBeDefined();
      expect(screen.getByText("طبقه هزارها")).toBeDefined();
      expect(screen.getByText("طبقه یکی‌ها")).toBeDefined();
    });

    it("renders decimal tier with tenths, hundredths, thousandths", () => {
      render(
        <PlaceValueTable
          number={12.345}
          tiers={["ones", "decimals"]}
          label="جدول ارزش مکانی اعشاری"
        />
      );

      expect(screen.getByText("مرتبه‌های اعشاری")).toBeDefined();
      expect(screen.getByText("دهم")).toBeDefined();
      expect(screen.getByText("صدم")).toBeDefined();
      expect(screen.getByText("هزارم")).toBeDefined();
    });
  });

  describe("VisualTemplateRegistry Universal Dispatcher", () => {
    it("dispatches all 6 Grade 5 components correctly", () => {
      const { rerender } = render(
        <VisualTemplateRenderer
          template={{
            type: "VolumePrismVisualizer",
            props: { initialLength: 3, initialWidth: 2, initialHeight: 2 },
          }}
        />
      );
      expect(screen.getByRole("img", { name: /نمایش حجم مکعب‌مستطیل/ })).toBeDefined();

      rerender(
        <VisualTemplateRenderer
          template={{
            type: "SymmetryPlayground",
            props: { initialMode: "central" },
          }}
        />
      );
      expect(screen.getByText("مرکز تقارن (O)")).toBeDefined();

      rerender(
        <VisualTemplateRenderer
          template={{
            type: "FractionAreaMultiplier",
            props: { initialNumA: 1, initialDenA: 2, initialNumB: 1, initialDenB: 3 },
          }}
        />
      );
      expect(screen.getByText("رابطه ریاضی ضرب کسرها:")).toBeDefined();

      rerender(
        <VisualTemplateRenderer
          template={{
            type: "PolygonAreaDecomposer",
            props: { initialShapeType: "rhombus" },
          }}
        />
      );
      expect(screen.getByText("فرمول مساحت لوزی:")).toBeDefined();

      rerender(
        <VisualTemplateRenderer
          template={{
            type: "CircleMeasurementVisualizer",
            props: { initialMode: "circumference" },
          }}
        />
      );
      expect(screen.getByText("فرمول محیط دایره:")).toBeDefined();

      rerender(
        <VisualTemplateRenderer
          template={{
            type: "CompoundUnitCalculator",
            props: { initialOp: "subtract" },
          }}
        />
      );
      expect(screen.getByText("قاعده طلایی عددهای مرکب:")).toBeDefined();
    });
  });
});
