import React from "react";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { VisualTemplateRenderer } from "@/components/parametric/VisualTemplateRegistry";
import { PlaceValueTable } from "@/components/parametric/PlaceValueTable";
import { AbacusVisualizer } from "@/components/parametric/AbacusVisualizer";
import { InputOutputMachine } from "@/components/parametric/InputOutputMachine";
import { MatchstickPattern } from "@/components/parametric/MatchstickPattern";
import { DotPatternVisualizer } from "@/components/parametric/DotPatternVisualizer";
import { ProtractorVisualizer } from "@/components/parametric/ProtractorVisualizer";
import { ClockVisualizer } from "@/components/parametric/ClockVisualizer";
import { FractionCircle } from "@/components/parametric/FractionCircle";
import { ProbabilitySpinner } from "@/components/parametric/ProbabilitySpinner";
import { BrokenLineGraph } from "@/components/parametric/BrokenLineGraph";
import { getCanonicalCartridge } from "@/lib/data/cartridge";
import { DYNAMIC_GENERATORS } from "@/lib/curriculum/parametric-engine";
import fs from "fs";
import path from "path";

describe("Grade 4 Mathematics Visual Learning Tools & Manipulatives", () => {
  it("verifies that grade4_visual_tools_manifest.json exists and catalogs all tools", () => {
    const manifestPath = path.resolve(__dirname, "../../data/tools/grade4_visual_tools_manifest.json");
    expect(fs.existsSync(manifestPath)).toBe(true);

    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    expect(manifest.total_tools).toBeGreaterThanOrEqual(10);
    expect(Array.isArray(manifest.tools)).toBe(true);

    const toolIds = manifest.tools.map((t: any) => t.id);
    expect(toolIds).toContain("TOOL-PLACE-VALUE-TABLE");
    expect(toolIds).toContain("TOOL-ABACUS");
    expect(toolIds).toContain("TOOL-IO-MACHINE");
    expect(toolIds).toContain("TOOL-MATCHSTICK-PATTERN");
    expect(toolIds).toContain("TOOL-DOT-PATTERN");
    expect(toolIds).toContain("TOOL-PROTRACTOR");
    expect(toolIds).toContain("TOOL-CLOCK");
    expect(toolIds).toContain("TOOL-FRACTION-CIRCLE");
    expect(toolIds).toContain("TOOL-PROBABILITY-SPINNER");
    expect(toolIds).toContain("TOOL-BROKEN-LINE-GRAPH");
  });

  it("renders PlaceValueTable component with thousands and millions correctly", () => {
    const { container, getByText, getAllByText } = render(
      <PlaceValueTable
        number={407053}
        tiers={["thousands", "ones"]}
        hiddenSlot="دهگان‌هزار"
        label="جدول ارزش مکانی"
      />
    );
    expect(getByText("جدول ارزش مکانی")).toBeDefined();
    expect(getByText("طبقه هزارها")).toBeDefined();
    expect(getByText("طبقه یکی‌ها")).toBeDefined();
    // Hidden slot should show question mark
    expect(getByText("؟")).toBeDefined();
  });

  it("renders PlaceValueTable with hiddenHeader and column indices without spoiling answer", () => {
    const { getByText } = render(
      <PlaceValueTable
        number={470295}
        tiers={["thousands", "ones"]}
        highlightColumn="دهگان‌هزار"
        hiddenHeader="دهگان‌هزار"
        showColumnIndices={true}
        label="جایگاه رقم در جدول ارزش مکانی:"
      />
    );
    expect(getByText("جایگاه رقم در جدول ارزش مکانی:")).toBeDefined();
    expect(getByText("ستون ۱")).toBeDefined();
    expect(getByText("ستون ۲")).toBeDefined();
    // The target header must be masked with question mark
    expect(getByText("؟")).toBeDefined();
  });

  it("renders AbacusVisualizer component with beaded columns, rod indices, and hidden labels", () => {
    const { container, getByText, getAllByText } = render(
      <AbacusVisualizer
        number={35408009}
        label="چرتکه نشان‌دهنده عدد"
        showDigitBadges={false}
        showRodIndices={true}
        highlightRod="دهگان‌هزار"
        hiddenLabel="دهگان‌هزار"
      />
    );
    expect(getByText("چرتکه نشان‌دهنده عدد")).toBeDefined();
    expect(getByText("میله ۱")).toBeDefined();
    expect(getByText("میله ۲")).toBeDefined();
    expect(container.querySelector("svg")).toBeDefined();
    // Hidden label should show question mark
    expect(getAllByText("؟").length).toBeGreaterThan(0);
  });

  it("renders InputOutputMachine component with operations and data table", () => {
    const { container, getByText, getAllByText } = render(
      <InputOutputMachine
        inputVal={14}
        outputVal="؟"
        operations={[{ op: "mul", value: 3 }]}
        machineTitle="ماشین محیط‌یاب"
        showTable={true}
        tablePairs={[
          { input: 2, output: 6 },
          { input: 14, output: "؟" },
        ]}
      />
    );
    expect(getByText("ماشین محیط‌یاب")).toBeDefined();
    expect(getAllByText("ورودی").length).toBeGreaterThanOrEqual(1);
    expect(getAllByText("خروجی").length).toBeGreaterThanOrEqual(1);
    expect(getAllByText("؟").length).toBeGreaterThanOrEqual(2);
    // Ensure font-mono is not used on numerals or operations
    expect(container.querySelector(".font-mono")).toBeNull();
  });

  it("renders MatchstickPattern with triangle and square chain configurations", () => {
    const { container, getByText, getAllByText } = render(
      <MatchstickPattern
        patternKind="triangles"
        stages={[
          { stageNumber: 1, count: 4, isTarget: false },
          { stageNumber: 2, count: 7, isTarget: false },
          { stageNumber: 3, count: 10, isTarget: false },
          { stageNumber: 4, count: 13, isTarget: true },
        ]}
        label="الگوی چوب‌کبریت‌ها"
      />
    );
    expect(getByText("الگوی چوب‌کبریت‌ها")).toBeDefined();
    expect(getByText("؟ چوب‌کبریت")).toBeDefined();
    expect(container.querySelectorAll("svg").length).toBe(3); // 3 non-target stages have SVGs
  });

  it("renders DotPatternVisualizer with triangular numbers", () => {
    const { container, getByText, getAllByText } = render(
      <DotPatternVisualizer
        shapeType="triangle"
        stages={[
          { stageNumber: 1, dotCount: 1, rows: 1 },
          { stageNumber: 2, dotCount: 3, rows: 2 },
          { stageNumber: 3, dotCount: 6, rows: 3, isTarget: true },
        ]}
        label="الگوی نقطه‌ای"
      />
    );
    expect(getByText("الگوی نقطه‌ای")).toBeDefined();
    expect(getByText("؟ نقطه")).toBeDefined();
  });

  it("renders ProtractorVisualizer with degrees and angle rays", () => {
    const { container, getByText, getAllByText } = render(
      <ProtractorVisualizer
        angleDegree={90}
        vertexLabel="ب"
        showDegreeLabel={true}
        showClassification={true}
      />
    );
    expect(getByText("راس (ب)")).toBeDefined();
    expect(getByText("زاویه راست (قائمه)")).toBeDefined();
    expect(container.querySelector("svg")).toBeDefined();
  });

  it("renders ClockVisualizer with analog hands and digital badge", () => {
    const { container, getByText, getAllByText } = render(
      <ClockVisualizer
        hours={4}
        minutes={30}
        elapsedMinutes={45}
        showDigital={true}
      />
    );
    expect(getByText("زمان سپری‌شده: ۴۵ دقیقه")).toBeDefined();
    expect(container.querySelector("svg")).toBeDefined();
  });

  it("renders FractionCircle with mixed numbers and multiple unit circles", () => {
    const { container, getByText, getAllByText } = render(
      <FractionCircle
        wholeUnits={1}
        totalSlices={4}
        shadedSlices={3}
        colorTheme="indigo"
      />
    );
    expect(getByText("واحد کامل")).toBeDefined();
    expect(container.querySelectorAll("circle").length).toBeGreaterThanOrEqual(2);
  });

  it("renders ProbabilitySpinner with colored sectors and percentage legend", () => {
    const { container, getByText, getAllByText } = render(
      <ProbabilitySpinner
        sectors={[
          { color: "#ef4444", fraction: 0.5, label: "قرمز" },
          { color: "#3b82f6", fraction: 0.25, label: "آبی" },
          { color: "#10b981", fraction: 0.25, label: "سبز" },
        ]}
        pointerAngle={60}
      />
    );
    expect(getByText("قرمز:")).toBeDefined();
    expect(getByText("آبی:")).toBeDefined();
    expect(getByText("سبز:")).toBeDefined();
  });

  it("renders BrokenLineGraph with coordinate axes and point values", () => {
    const { container, getByText, getAllByText } = render(
      <BrokenLineGraph
        xLabels={["شنبه", "۱شنبه", "۲شنبه"]}
        yValues={[15, 20, 18]}
        xTitle="روز"
        yTitle="دما"
      />
    );
    expect(getByText("محور افقی: روز")).toBeDefined();
    expect(getByText("محور عمودی: دما")).toBeDefined();
    expect(container.querySelector("polyline")).toBeDefined();
  });

  it("verifies Universal VisualTemplateRenderer dispatches all templates safely", () => {
    const templates = [
      { type: "PlaceValueTable", props: { number: 500000 } },
      { type: "AbacusVisualizer", props: { number: 1200000 } },
      { type: "InputOutputMachine", props: { operations: [{ op: "add", value: 2 }] } },
      { type: "MatchstickPattern", props: { stages: [{ stageNumber: 1, count: 3 }] } },
      { type: "DotPatternVisualizer", props: { stages: [{ stageNumber: 1, dotCount: 1 }] } },
      { type: "ProtractorVisualizer", props: { angleDegree: 45 } },
      { type: "ClockVisualizer", props: { hours: 2, minutes: 10 } },
      { type: "FractionCircle", props: { totalSlices: 3, shadedSlices: 2 } },
      { type: "ProbabilitySpinner", props: { sectors: [{ color: "#f00", fraction: 1, label: "تک" }] } },
      { type: "BrokenLineGraph", props: { xLabels: ["الف"], yValues: [10] } },
    ];

    for (const t of templates) {
      const { container } = render(<VisualTemplateRenderer template={t} />);
      expect(container.firstChild).toBeDefined();
    }
  });

  it("verifies Grade 4 Chapter 1 canonical cartridge contains enriched visual templates", () => {
    const ch1 = getCanonicalCartridge("grade4_math_ch1.json");
    const itemsWithVisuals = ch1.diagnostic_items.filter((item) => item.visual_template);
    expect(itemsWithVisuals.length).toBeGreaterThanOrEqual(8);

    const types = itemsWithVisuals.map((item) => item.visual_template!.type);
    expect(types).toContain("PlaceValueTable");
    expect(types).toContain("MatchstickPattern");
    expect(types).toContain("DotPatternVisualizer");
    expect(types).toContain("InputOutputMachine");
    expect(types).toContain("AbacusVisualizer");
  });

  it("verifies parametric dynamic generators produce items with visual templates", () => {
    const item1 = DYNAMIC_GENERATORS["KC-MATH4-C01-01"](0);
    expect(item1.visual_template).toBeDefined();
    expect(item1.visual_template?.type).toBe("PlaceValueTable");

    const item3 = DYNAMIC_GENERATORS["KC-MATH4-C01-03"](0);
    expect(item3.visual_template).toBeDefined();
    expect(["MatchstickPattern", "DotPatternVisualizer"]).toContain(item3.visual_template?.type);

    const item4 = DYNAMIC_GENERATORS["KC-MATH4-C01-04"](0);
    expect(item4.visual_template).toBeDefined();
    expect(item4.visual_template?.type).toBe("InputOutputMachine");

    const item5 = DYNAMIC_GENERATORS["KC-MATH4-C01-05"](0);
    expect(item5.visual_template).toBeDefined();
    expect(item5.visual_template?.type).toBe("AbacusVisualizer");
  });
});
