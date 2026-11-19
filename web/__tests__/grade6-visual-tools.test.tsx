import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { CoordinateGridVisualizer } from "../components/parametric/CoordinateGridVisualizer";
import { IntegerNumberLine } from "../components/parametric/IntegerNumberLine";
import { AngleRelationshipVisualizer } from "../components/parametric/AngleRelationshipVisualizer";
import { FractionDivisionVisualizer } from "../components/parametric/FractionDivisionVisualizer";
import { CylinderVolumeVisualizer } from "../components/parametric/CylinderVolumeVisualizer";
import { ApproximationRuler } from "../components/parametric/ApproximationRuler";
import { VisualTemplateRenderer } from "../components/parametric/VisualTemplateRegistry";

describe("Grade 6 Spatial, Algebraic & Diagnostic Manipulatives Suite", () => {
  describe("CoordinateGridVisualizer (2D Cartesian Grid & Symmetry)", () => {
    it("renders 2D Cartesian grid with X and Y axes in quadrant 1 by default", () => {
      render(
        <CoordinateGridVisualizer
          quadrantMode="quadrant1"
          initialPoints={[{ id: "P", label: "الف", x: 4, y: 3 }]}
        />
      );

      expect(screen.getByRole("img", { name: /دستگاه مختصات دو بعدی/ })).toBeDefined();
      expect(screen.getByText(/طول نقطه/)).toBeDefined();
      expect(screen.getByText(/عرض نقطه/)).toBeDefined();
      expect(screen.getByText(/طول \(x\)/)).toBeDefined();
      expect(screen.getByText(/عرض \(y\)/)).toBeDefined();
    });

    it("allows toggling to all 4 quadrants mode", () => {
      render(<CoordinateGridVisualizer />);
      const all4Btn = screen.getByText("چهار ناحیه");
      fireEvent.click(all4Btn);

      expect(all4Btn.className).toContain("bg-white text-indigo-700");
    });

    it("switches to geometric shape mode (triangle and rectangle)", () => {
      render(<CoordinateGridVisualizer />);
      const triBtn = screen.getByText("مثلث");
      fireEvent.click(triBtn);

      expect(triBtn.className).toContain("bg-indigo-600 text-white");

      const rectBtn = screen.getByText("مستطیل");
      fireEvent.click(rectBtn);

      expect(rectBtn.className).toContain("bg-indigo-600 text-white");
    });

    it("toggles reflection symmetry across X-axis, Y-axis and origin", () => {
      render(<CoordinateGridVisualizer />);
      const symXBtn = screen.getByText("محور طول (X)");
      fireEvent.click(symXBtn);

      expect(screen.getByText(/قرینه/)).toBeDefined();

      const symOriginBtn = screen.getByText("مبدا مختصات");
      fireEvent.click(symOriginBtn);

      expect(screen.getByText(/قرینه/)).toBeDefined();
    });
  });

  describe("IntegerNumberLine (Signed Integers & Comparison)", () => {
    it("renders signed integer line with zero origin and directional indicators", () => {
      render(<IntegerNumberLine initialValue={-3} initialCompareValue={2} />);

      expect(screen.getByRole("img", { name: /محور اعداد صحیح/ })).toBeDefined();
      expect(screen.getByText("مبدا (صفر)")).toBeDefined();
      expect(screen.getByText(/منفی‌ها/)).toBeDefined();
      expect(screen.getByText(/مثبت‌ها/)).toBeDefined();
    });

    it("evaluates mathematical comparison between negative and positive integers", () => {
      render(<IntegerNumberLine initialValue={-4} initialCompareValue={2} />);

      expect(screen.getByText("<")).toBeDefined();
      expect(screen.getByText("عدد سمت چپ روی محور همواره کوچکتر است")).toBeDefined();
    });

    it("toggles to opposite (قرینه) mode showing reflection across zero", () => {
      render(<IntegerNumberLine initialValue={-5} />);
      const oppBtn = screen.getByText("قرینه عدد");
      fireEvent.click(oppBtn);

      expect(screen.getByText("مفهوم قرینه:")).toBeDefined();
      expect(screen.getByText(/فاصله هر دو از صفر برابر است/)).toBeDefined();
    });

    it("switches real-world metaphors (thermometer & sea level)", () => {
      render(<IntegerNumberLine />);
      const thermoBtn = screen.getByText("دماسنج");
      fireEvent.click(thermoBtn);

      expect(screen.getByText(/در دماسنج/)).toBeDefined();

      const seaBtn = screen.getByText("سطح دریا");
      fireEvent.click(seaBtn);

      expect(screen.getByText(/در ارتفاع‌سنجی/)).toBeDefined();
    });
  });

  describe("AngleRelationshipVisualizer (Vertical, Complementary & Supplementary Angles)", () => {
    it("renders vertical angles mode proving opposite angles are equal", () => {
      render(<AngleRelationshipVisualizer initialMode="vertical" initialAngle={50} />);

      expect(screen.getByRole("img", { name: /نمودار زاویه‌ها/ })).toBeDefined();
      expect(screen.getByText("قاعده زاویه‌های متقابل به رأس:")).toBeDefined();
      expect(screen.getByText("زاویه‌های روبه‌رو همواره با هم برابرند")).toBeDefined();
    });

    it("switches to complementary mode proving sum is 90 degrees", () => {
      render(<AngleRelationshipVisualizer />);
      const compBtn = screen.getByText("متمم (۹۰°)");
      fireEvent.click(compBtn);

      expect(screen.getByText("قاعده زاویه‌های متمم:")).toBeDefined();
      expect(screen.getByText("مجموع دو زاویه برابر ۹۰ درجه است")).toBeDefined();
    });

    it("switches to supplementary mode proving sum is 180 degrees", () => {
      render(<AngleRelationshipVisualizer />);
      const suppBtn = screen.getByText("مکمل (۱۸۰°)");
      fireEvent.click(suppBtn);

      expect(screen.getByText("قاعده زاویه‌های مکمل:")).toBeDefined();
      expect(screen.getByText("مجموع دو زاویه برابر ۱۸۰ درجه است")).toBeDefined();
    });
  });

  describe("FractionDivisionVisualizer (Visual Measurement Partitioning)", () => {
    it("renders dividend strip and calculates division quotient", () => {
      render(<FractionDivisionVisualizer initialPresetId="p1" />);

      expect(screen.getByRole("img", { name: /نوار مدل تقسیم کسرها/ })).toBeDefined();
      expect(screen.getByText(/شمارش بسته‌ها/)).toBeDefined();
      expect(screen.getByText(/۶ بسته/)).toBeDefined();
    });

    it("navigates step 1 -> step 2 -> step 3 smoothly", () => {
      render(<FractionDivisionVisualizer />);

      const step1Btn = screen.getByText("مرحله ۱");
      fireEvent.click(step1Btn);
      expect(screen.getByText(/نوار بالا نشان‌دهنده مقدار کسر اول/)).toBeDefined();

      const step2Btn = screen.getByText("مرحله ۲");
      fireEvent.click(step2Btn);
      expect(screen.getByText(/با هم‌مخرج کردن/)).toBeDefined();

      const step3Btn = screen.getByText("مرحله ۳");
      fireEvent.click(step3Btn);
      expect(screen.getByText(/شمارش بسته‌ها:/)).toBeDefined();
    });

    it("toggles invert-and-multiply algebraic proof popup", () => {
      render(<FractionDivisionVisualizer />);
      const whyBtn = screen.getByText("چرا معکوس و ضرب؟");
      fireEvent.click(whyBtn);

      expect(screen.getByText("ارتباط مدل تصویری با قاعده ضرب در معکوس:")).toBeDefined();
    });
  });

  describe("CylinderVolumeVisualizer (3D Isometric Cylinder & Unrolled Net)", () => {
    it("renders 3D cylinder and calculates volume and lateral surface area", () => {
      render(<CylinderVolumeVisualizer initialRadius={3} initialHeight={5} />);

      expect(screen.getByRole("img", { name: /نمایش تصویری استوانه/ })).toBeDefined();
      expect(screen.getByText("فرمول حجم: مساحت قاعده × ارتفاع")).toBeDefined();
      expect(screen.getByText(/V = π × r² × h/)).toBeDefined();
    });

    it("toggles to unrolled net view showing lateral rectangle and circular bases", () => {
      render(<CylinderVolumeVisualizer />);
      const netBtn = screen.getByText("گسترده (باز شده)");
      fireEvent.click(netBtn);

      expect(screen.getByText("سطح جانبی (مستطیل)")).toBeDefined();
      expect(screen.getByText("قاعده بالا")).toBeDefined();
      expect(screen.getByText("قاعده پایین")).toBeDefined();
      expect(screen.getByText(/طول مستطیل = محیط دایره/)).toBeDefined();
    });

    it("switches calculation tabs (volume, lateral area, total area)", () => {
      render(<CylinderVolumeVisualizer />);
      const lateralBtn = screen.getByText("مساحت جانبی");
      fireEvent.click(lateralBtn);

      expect(screen.getByText("فرمول مساحت جانبی: محیط قاعده × ارتفاع")).toBeDefined();

      const totalBtn = screen.getByText("مساحت کل");
      fireEvent.click(totalBtn);

      expect(screen.getByText("فرمول مساحت کل: مساحت جانبی + مساحت دو قاعده")).toBeDefined();
    });
  });

  describe("Universal VisualTemplateRenderer for Grade 6 Manipulatives", () => {
    it("dispatches CoordinateGridVisualizer correctly", () => {
      render(
        <VisualTemplateRenderer
          template={{
            type: "CoordinateGridVisualizer",
            props: { quadrantMode: "quadrant1" },
          }}
        />
      );
      expect(screen.getByRole("img", { name: /دستگاه مختصات دو بعدی/ })).toBeDefined();
    });

    it("dispatches IntegerNumberLine correctly", () => {
      render(
        <VisualTemplateRenderer
          template={{
            type: "IntegerNumberLine",
            props: { initialValue: -2, initialCompareValue: 3 },
          }}
        />
      );
      expect(screen.getByRole("img", { name: /محور اعداد صحیح/ })).toBeDefined();
    });

    it("dispatches AngleRelationshipVisualizer correctly", () => {
      render(
        <VisualTemplateRenderer
          template={{
            type: "AngleRelationshipVisualizer",
            props: { initialMode: "vertical" },
          }}
        />
      );
      expect(screen.getByRole("img", { name: /نمودار زاویه‌ها/ })).toBeDefined();
    });

    it("dispatches FractionDivisionVisualizer correctly", () => {
      render(
        <VisualTemplateRenderer
          template={{
            type: "FractionDivisionVisualizer",
            props: { initialPresetId: "p2" },
          }}
        />
      );
      expect(screen.getByRole("img", { name: /نوار مدل تقسیم کسرها/ })).toBeDefined();
    });

    it("dispatches CylinderVolumeVisualizer correctly", () => {
      render(
        <VisualTemplateRenderer
          template={{
            type: "CylinderVolumeVisualizer",
            props: { initialRadius: 2, initialHeight: 4 },
          }}
        />
      );
      expect(screen.getByRole("img", { name: /نمایش تصویری استوانه/ })).toBeDefined();
    });

    it("dispatches ApproximationRuler correctly", () => {
      render(
        <VisualTemplateRenderer
          template={{
            type: "ApproximationRuler",
            props: { initialNumber: 468, initialPrecision: 10 },
          }}
        />
      );
      expect(screen.getByRole("img", { name: /خط‌کش تقریب/ })).toBeDefined();
    });
  });

  describe("ApproximationRuler (Truncation vs Rounding & Error Calculation)", () => {
    it("renders approximation ruler with truncation, rounding and comparison indicators", () => {
      render(<ApproximationRuler initialNumber={468} initialPrecision={10} />);

      expect(screen.getByRole("img", { name: /خط‌کش تقریب/ })).toBeDefined();
      expect(screen.getByText("روش قطع کردن (حذف ارقام)")).toBeDefined();
      expect(screen.getByText("روش گرد کردن (نزدیک‌ترین)")).toBeDefined();
      expect(screen.getAllByText(/خطای تقریب:/).length).toBeGreaterThan(0);
    });

    it("allows switching approximation precision level between 10, 100, and 1000", () => {
      render(<ApproximationRuler initialNumber={468} initialPrecision={10} />);

      const p100Btn = screen.getByText("کمتر از ۱۰۰");
      fireEvent.click(p100Btn);

      expect(p100Btn.className).toContain("bg-white text-indigo-700");

      const p1000Btn = screen.getByText("کمتر از ۱۰۰۰");
      fireEvent.click(p1000Btn);

      expect(p1000Btn.className).toContain("bg-white text-indigo-700");
    });

    it("calculates truncation and rounding results accurately for edge values", () => {
      render(<ApproximationRuler initialNumber={468} initialPrecision={10} />);

      // For 468 with precision 10:
      // Truncation: 460 (Persian: ۴۶۰, error: ۸ واحد)
      // Rounding: 470 (Persian: ۴۷۰, error: ۲ واحد)
      expect(screen.getAllByText("۴۶۰").length).toBeGreaterThan(0);
      expect(screen.getAllByText("۴۷۰").length).toBeGreaterThan(0);
      expect(screen.getByText(/خطای تقریب: ۸ واحد/)).toBeDefined();
      expect(screen.getByText(/خطای تقریب: ۲ واحد/)).toBeDefined();
    });
  });
});
