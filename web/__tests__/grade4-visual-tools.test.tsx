import React from "react";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { VisualTemplateRenderer } from "../components/parametric/VisualTemplateRegistry";
import { NumberLine } from "../components/parametric/NumberLine";
import { FractionStrip } from "../components/parametric/FractionStrip";
import { AreaGrid } from "../components/parametric/AreaGrid";
import { PlaceValueTable } from "../components/parametric/PlaceValueTable";
import { AbacusVisualizer } from "../components/parametric/AbacusVisualizer";
import { InputOutputMachine } from "../components/parametric/InputOutputMachine";
import { MatchstickPattern } from "../components/parametric/MatchstickPattern";
import { DotPatternVisualizer } from "../components/parametric/DotPatternVisualizer";
import { ProtractorVisualizer } from "../components/parametric/ProtractorVisualizer";
import { ClockVisualizer } from "../components/parametric/ClockVisualizer";
import { FractionCircle } from "../components/parametric/FractionCircle";
import { ProbabilitySpinner } from "../components/parametric/ProbabilitySpinner";
import { BrokenLineGraph } from "../components/parametric/BrokenLineGraph";
import { PlaceValueBundles } from "../components/parametric/PlaceValueBundles";
import { getCanonicalCartridge } from "../lib/data/cartridge";
import { DYNAMIC_GENERATORS } from "../lib/curriculum/parametric-engine";
import fs from "node:fs";
import path from "node:path";

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
    expect(toolIds).toContain("TOOL-PLACE-VALUE-BUNDLES");
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

  it("renders PlaceValueTable with hiddenHeader and hiddenSlot without spoiling answer", () => {
    const { getByText } = render(
      <PlaceValueTable
        number={470295}
        tiers={["thousands", "ones"]}
        highlightColumn="دهگان‌هزار"
        hiddenSlot="دهگان‌هزار"
        label="جایگاه رقم در جدول ارزش مکانی:"
      />
    );
    expect(getByText("جایگاه رقم در جدول ارزش مکانی:")).toBeDefined();
    // The target slot must be masked with question mark
    expect(getByText("؟")).toBeDefined();
  });

  it("renders AbacusVisualizer component with beaded columns and hidden labels", () => {
    const { container, getByText, getAllByText } = render(
      <AbacusVisualizer
        number={35408009}
        label="چرتکه نشان‌دهنده عدد"
        showDigitBadges={false}
        highlightRod="دهگان‌هزار"
        hiddenLabel="دهگان‌هزار"
      />
    );
    expect(getByText("چرتکه نشان‌دهنده عدد")).toBeDefined();
    expect(container.querySelector("svg")).toBeDefined();
    // Hidden label should show question mark
    expect(getAllByText("؟").length).toBeGreaterThan(0);
  });

  it("renders PlaceValueBundles component with 3D packets and badges correctly", () => {
    const { getByText } = render(
      <PlaceValueBundles
        bundles={[
          { count: 3, unitValue: 100000, unitLabel: "صدهزارتایی", theme: "purple" },
          { count: 5, unitValue: 10000, unitLabel: "ده‌هزارتایی", theme: "emerald" },
          { count: 8, unitValue: 1000, unitLabel: "هزارتایی", theme: "sky" },
        ]}
      />
    );
    expect(getByText("بسته صدهزارتایی")).toBeDefined();
    expect(getByText("بسته ده‌هزارتایی")).toBeDefined();
    expect(getByText("بسته هزارتایی")).toBeDefined();
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

  it("renders MatchstickPattern with triangle and square chain configurations and distinct sulfur tips", () => {
    // 1. Squares pattern
    const { container: squareContainer, getByText: getByTextSquare } = render(
      <MatchstickPattern
        patternKind="squares"
        stages={[
          { stageNumber: 1, count: 4, isTarget: false },
          { stageNumber: 2, count: 7, isTarget: false },
          { stageNumber: 3, count: 10, isTarget: false },
          { stageNumber: 4, count: 13, isTarget: true },
        ]}
        label="الگوی چوب‌کبریت‌های مربعی"
      />
    );
    expect(getByTextSquare("الگوی چوب‌کبریت‌های مربعی")).toBeDefined();
    expect(getByTextSquare("؟ چوب‌کبریت")).toBeDefined();
    const squareSvgs = squareContainer.querySelectorAll("svg");
    expect(squareSvgs.length).toBe(3);

    // Stage 1 (1 square): exactly 4 lines (wooden bodies) and 4 circles (sulfur heads)
    const stage1Lines = squareSvgs[0].querySelectorAll("line");
    const stage1Tips = squareSvgs[0].querySelectorAll("circle");
    expect(stage1Lines.length).toBe(4);
    expect(stage1Tips.length).toBe(4);

    // Verify all 4 distinct corners are covered by sulfur tips
    const coords = Array.from(stage1Tips).map((c) => `${c.getAttribute("cx")},${c.getAttribute("cy")}`);
    const uniqueCoords = new Set(coords);
    expect(uniqueCoords.size).toBe(4); // 4 distinct corners, no overlap!

    // Stage 2 (2 squares): 7 lines and 7 tips
    const stage2Lines = squareSvgs[1].querySelectorAll("line");
    const stage2Tips = squareSvgs[1].querySelectorAll("circle");
    expect(stage2Lines.length).toBe(7);
    expect(stage2Tips.length).toBe(7);

    // 2. Triangles pattern
    const { container: triContainer, getByText: getByTextTri } = render(
      <MatchstickPattern
        patternKind="triangles"
        stages={[
          { stageNumber: 1, count: 3, isTarget: false },
          { stageNumber: 2, count: 5, isTarget: false },
          { stageNumber: 3, count: 7, isTarget: true },
        ]}
        label="الگوی چوب‌کبریت‌های مثلثی"
      />
    );
    expect(getByTextTri("الگوی چوب‌کبریت‌های مثلثی")).toBeDefined();
    const triSvgs = triContainer.querySelectorAll("svg");
    expect(triSvgs.length).toBe(2);

    // Stage 1 (1 triangle): exactly 3 lines and 3 tips at 3 distinct corners
    const triStage1Tips = triSvgs[0].querySelectorAll("circle");
    expect(triStage1Tips.length).toBe(3);
    const triCoords = Array.from(triStage1Tips).map((c) => `${c.getAttribute("cx")},${c.getAttribute("cy")}`);
    expect(new Set(triCoords).size).toBe(3);
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
    expect(types).toContain("PlaceValueBundles");
  });

  it("verifies parametric dynamic generators produce items with visual templates", () => {
    const item1 = DYNAMIC_GENERATORS["KC-MATH4-C01-01"](0);
    expect(item1.visual_template).toBeDefined();
    expect(["PlaceValueTable", "AbacusVisualizer", "PlaceValueBundles"]).toContain(item1.visual_template?.type);

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

  it("renders FractionStrip with unequal segments for MIS-UNEQUAL-PARTITIONS diagnostic item", () => {
    const { container } = render(
      <FractionStrip
        segmentRatios={[45, 18, 37]}
        coloredSegments={[1]}
      />
    );

    const rects = container.querySelectorAll("rect");
    expect(rects.length).toBe(3);

    // Verify widths are unequal (e.g. middle segment width is much smaller than first)
    const widths = Array.from(rects).map((r) => parseFloat(r.getAttribute("width") || "0"));
    expect(widths[0]).toBeGreaterThan(widths[1]); // 45% > 18%
    expect(widths[2]).toBeGreaterThan(widths[1]); // 37% > 18%

    // Verify middle segment is colored with indigo fill
    expect(rects[1].getAttribute("fill")).toBe("#6366f1");
    // Verify first and third segments are uncolored
    expect(rects[0].getAttribute("fill")).toBe("#f8fafc");
    expect(rects[2].getAttribute("fill")).toBe("#f8fafc");

    // Unequal partitions must NOT have misleading fraction text or 0..1 slider
    expect(container.querySelectorAll("text").length).toBe(0);
  });

  it("renders AreaGrid with shaded cells without misleading checkmarks and supports columnRatios", () => {
    const { container, rerender } = render(
      <AreaGrid rows={1} cols={3} initialColored={1} hideBadge={true} />
    );

    const buttons = container.querySelectorAll("button");
    expect(buttons.length).toBe(3);

    // Verify buttons have no checkmark text
    buttons.forEach((btn) => {
      expect(btn.textContent?.trim()).toBe("");
    });

    // Test unequal column ratios support
    rerender(
      <AreaGrid rows={1} cols={3} columnRatios={[45, 18, 37]} initialColored={1} hideBadge={true} />
    );
    const gridDiv = container.querySelector(".grid") as HTMLElement;
    expect(gridDiv.style.gridTemplateColumns).toBe("45fr 18fr 37fr");
  });

  it("renders AreaGrid with coloredCount prop and correct proportion (e.g. 9/12 for equivalent fractions)", () => {
    // 4 rows x 3 cols = 12 total cells, coloredCount = 9 (representing 3/4 = 9/12)
    const { container, rerender } = render(
      <AreaGrid rows={4} cols={3} coloredCount={9} hideBadge={true} />
    );

    const buttons = container.querySelectorAll("button");
    expect(buttons.length).toBe(12);

    const coloredButtons = Array.from(buttons).filter((b) =>
      b.className.includes("bg-indigo-600")
    );
    expect(coloredButtons.length).toBe(9);

    // Verify dynamic update via rerender (e.g. when moving between carousel questions)
    rerender(
      <AreaGrid rows={4} cols={3} coloredCount={6} hideBadge={true} />
    );
    const updatedColored = Array.from(container.querySelectorAll("button")).filter((b) =>
      b.className.includes("bg-indigo-600")
    );
    expect(updatedColored.length).toBe(6);

    // Verify VisualTemplateRenderer correctly passes coloredCount and color
    const { container: vtContainer } = render(
      <VisualTemplateRenderer
        template={{
          type: "AreaGrid",
          props: {
            rows: 10,
            cols: 10,
            coloredCount: 35,
            color: "emerald",
          },
        }}
      />
    );
    const vtButtons = vtContainer.querySelectorAll("button");
    expect(vtButtons.length).toBe(100);
    const emeraldButtons = Array.from(vtButtons).filter((b) =>
      b.className.includes("bg-emerald-600")
    );
    expect(emeraldButtons.length).toBe(35);
  });

  it("renders NumberLine with circle directly on the line and correctly selects 5th tick for 5/6", () => {
    const { container, rerender } = render(
      <NumberLine
        min={0}
        max={1}
        partitions={6}
        targetPoint={0.833}
        targetLabel="نقطه مورد نظر"
        hideFractions={true}
      />
    );

    // 1. Circle must sit on axis line (cy="60", NOT floating at top or using y)
    const circle = container.querySelector("circle");
    expect(circle).toBeDefined();
    expect(circle?.getAttribute("cy")).toBe("60");
    expect(circle?.getAttribute("y")).toBeNull();

    // 2. Usable width is 380 (460 - 2*40). For 6 partitions, step width is 380/6 = 63.33.
    // For tick 5 (5/6), cx should be 40 + 5 * (380 / 6) = 356.666...
    const cx = parseFloat(circle?.getAttribute("cx") || "0");
    const expectedCx = 40 + (5 * (460 - 80)) / 6;
    expect(Math.abs(cx - expectedCx)).toBeLessThan(1);

    // 3. Question mark text must be rendered at tick 5
    const questionText = Array.from(container.querySelectorAll("text")).find((t) => t.textContent === "؟");
    expect(questionText).toBeDefined();
    expect(parseFloat(questionText?.getAttribute("x") || "0")).toBeCloseTo(expectedCx, 0);

    // 4. Test re-rendering with new targetPoint (state sync)
    rerender(
      <NumberLine
        min={0}
        max={1}
        partitions={6}
        targetPoint={0.166} // 1/6 (tick 1)
        hideFractions={true}
      />
    );

    const updatedCircle = container.querySelector("circle");
    const updatedCx = parseFloat(updatedCircle?.getAttribute("cx") || "0");
    const expectedTick1Cx = 40 + (1 * (460 - 80)) / 6;
    expect(Math.abs(updatedCx - expectedTick1Cx)).toBeLessThan(1);
  });

  it("verifies ProtractorVisualizer renders dual scale and angle rays accurately", () => {
    const { container, getByText } = render(
      <ProtractorVisualizer
        angleDegree={50}
        showProtractor={true}
        startRayAngle={0}
        showClassification={false}
        showDegreeLabel={false}
        showDualScale={true}
        vertexLabel="ب"
        label="نقاله و زاویه اندازه گرفته شده:"
      />
    );

    expect(getByText("نقاله و زاویه اندازه گرفته شده:")).toBeDefined();
    expect(getByText("راس (ب)")).toBeDefined();
    // In dual scale, both 50 and 130 are rendered on the protractor face
    const svgTexts = Array.from(container.querySelectorAll("text")).map((t) => t.textContent);
    expect(svgTexts.some((t) => t?.includes("۵۰") || t?.includes("50"))).toBe(true);
    expect(svgTexts.some((t) => t?.includes("۱۳۰") || t?.includes("130"))).toBe(true);
  });

  it("verifies ClockVisualizer renders digital time and elapsed arc for time interval questions", () => {
    const { getByText, getAllByText } = render(
      <ClockVisualizer
        hours={10}
        minutes={45}
        elapsedMinutes={40}
        showDigital={true}
        label="ساعت شروع زنگ ورزش (۱۰:۴۵) با چرخش ۴۰ دقیقه‌ای:"
      />
    );

    expect(getByText("ساعت شروع زنگ ورزش (۱۰:۴۵) با چرخش ۴۰ دقیقه‌ای:")).toBeDefined();
    expect(getAllByText(/۱۰:۴۵/).length).toBeGreaterThanOrEqual(1);
    expect(getByText(/زمان سپری‌شده: ۴۰ دقیقه/)).toBeDefined();
  });

  it("verifies FractionCircle renders whole units and partial fractional slices", () => {
    const { container, getByText, queryByText } = render(
      <FractionCircle
        totalSlices={5}
        shadedSlices={2}
        wholeUnits={3}
        colorTheme="indigo"
        showFractionBadge={false}
        showSliceLabels={false}
        label="شکل رو‌به‌رو با ۳ واحد کامل و ۲ قسمت از ۵ قسمت:"
      />
    );

    expect(getByText("شکل رو‌به‌رو با ۳ واحد کامل و ۲ قسمت از ۵ قسمت:")).toBeDefined();
    // 3 whole circles + 1 partial circle = 4 svg elements
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBe(4);
    // Since showSliceLabels is false, "۲ از ۵" shouldn't spoil the question
    expect(queryByText("۲ از ۵")).toBeNull();
  });

  it("verifies BrokenLineGraph renders coordinate points and polyline for continuous data", () => {
    const { container, getByText, getAllByText } = render(
      <BrokenLineGraph
        xLabels={["۳", "۶", "۹", "۱۲", "۱۵", "۱۸", "۲۱", "۲۴"]}
        yValues={[38, 38.5, 39, 38.8, 38.2, 37.8, 37.2, 37]}
        yMin={36}
        yMax={40}
        yStep={1}
        xTitle="ساعت سنجش"
        yTitle="دمای بدن (درجه سانتی‌گراد)"
        label="نمودار خط شکسته تغییرات دمای بدن:"
      />
    );

    expect(getByText("نمودار خط شکسته تغییرات دمای بدن:")).toBeDefined();
    expect(getByText(/ساعت سنجش/)).toBeDefined();
    expect(getAllByText(/دمای بدن/).length).toBeGreaterThanOrEqual(1);
    const polyline = container.querySelector("polyline");
    expect(polyline).toBeDefined();
    expect(polyline?.getAttribute("points")).toBeTruthy();
  });

  it("verifies ProbabilitySpinner renders proportional sectors and legend", () => {
    const { container, getByText } = render(
      <ProbabilitySpinner
        sectors={[
          { color: "#10b981", fraction: 0.5, label: "سبز" },
          { color: "#f59e0b", fraction: 0.25, label: "زرد" },
          { color: "#f97316", fraction: 0.25, label: "نارنجی" },
        ]}
        pointerAngle={45}
        showLegend={true}
        label="نمودار دایره‌ای بخش‌های رنگی:"
      />
    );

    expect(getByText("نمودار دایره‌ای بخش‌های رنگی:")).toBeDefined();
    expect(getByText(/سبز:/)).toBeDefined();
    expect(getByText(/زرد:/)).toBeDefined();
    expect(getByText(/نارنجی:/)).toBeDefined();
    // Needle line
    const needleLine = container.querySelector("line");
    expect(needleLine).toBeDefined();
  });

  it("confirms canonical items in Chapters 1, 2, 4, and 5 have verified non-leaking visual templates", () => {
    const ch1 = getCanonicalCartridge("grade4_math_ch1.json");
    const ch2 = getCanonicalCartridge("grade4_math_ch2.json");
    const ch4 = getCanonicalCartridge("grade4_math_ch4.json");
    const ch5 = getCanonicalCartridge("grade4_math_ch5.json");

    // Chapter 1 verified items
    const ch1Item4 = ch1.diagnostic_items.find((i: any) => i.id === "ITEM-MATH4-CH01-004");
    expect(ch1Item4?.visual_template?.type).toBe("PlaceValueTable");

    const ch1Item6 = ch1.diagnostic_items.find((i: any) => i.id === "ITEM-MATH4-CH01-006");
    expect(ch1Item6?.visual_template?.type).toBe("PlaceValueTable");

    const ch1Item14 = ch1.diagnostic_items.find((i: any) => i.id === "ITEM-MATH4-CH01-014");
    // Word problem numeral identification: visual_template null to prevent number leak
    expect(ch1Item14?.visual_template).toBeNull();

    // Chapter 2 verified items
    // Arithmetic & spoiler items must have visual_template null
    const ch2Item3 = ch2.diagnostic_items.find((i: any) => i.id === "ITEM-MATH4-CH02-003");
    expect(ch2Item3?.visual_template).toBeNull();

    const ch2Item7 = ch2.diagnostic_items.find((i: any) => i.id === "ITEM-MATH4-CH02-007");
    expect(ch2Item7?.visual_template).toBeNull();

    const ch2Item11 = ch2.diagnostic_items.find((i: any) => i.id === "ITEM-MATH4-CH02-011");
    expect(ch2Item11?.visual_template).toBeNull();

    // Legitimate visual stimuli in Chapter 2
    const ch2Item4 = ch2.diagnostic_items.find((i: any) => i.id === "ITEM-MATH4-CH02-004");
    expect(ch2Item4?.visual_template?.type).toBe("NumberLine");

    const ch2Item6 = ch2.diagnostic_items.find((i: any) => i.id === "ITEM-MATH4-CH02-006");
    expect(ch2Item6?.visual_template?.type).toBe("FractionStrip");

    const ch2Item15 = ch2.diagnostic_items.find((i: any) => i.id === "ITEM-MATH4-CH02-015");
    expect(ch2Item15?.visual_template?.type).toBe("NumberLine");

    // Chapter 4 verified items
    const ch4Item1 = ch4.diagnostic_items.find((i: any) => i.id === "ITEM-MATH4-CH04-001");
    expect(ch4Item1?.visual_template?.type).toBe("ProtractorVisualizer");
    expect(ch4Item1?.visual_template?.props?.showClassification).toBe(false);
    expect(ch4Item1?.visual_template?.props?.showDegreeLabel).toBe(false);

    const ch4Item2 = ch4.diagnostic_items.find((i: any) => i.id === "ITEM-MATH4-CH04-002");
    expect(ch4Item2?.visual_template?.type).toBe("ProtractorVisualizer");
    expect(ch4Item2?.visual_template?.props?.showClassification).toBe(false);
    expect(ch4Item2?.visual_template?.props?.showDegreeLabel).toBe(false);

    const ch4Item3 = ch4.diagnostic_items.find((i: any) => i.id === "ITEM-MATH4-CH04-003");
    expect(ch4Item3?.visual_template?.type).toBe("ClockVisualizer");

    const ch4Item4 = ch4.diagnostic_items.find((i: any) => i.id === "ITEM-MATH4-CH04-004");
    expect(ch4Item4?.visual_template).toBeNull();

    // Chapter 5 verified items
    const ch5Item1 = ch5.diagnostic_items.find((i: any) => i.id === "ITEM-MATH4-CH05-001");
    expect(ch5Item1?.visual_template?.type).toBe("FractionCircle");
    expect(ch5Item1?.visual_template?.props?.showFractionBadge).toBe(false);
    expect(ch5Item1?.visual_template?.props?.showSliceLabels).toBe(false);

    const ch5Item3 = ch5.diagnostic_items.find((i: any) => i.id === "ITEM-MATH4-CH05-003");
    expect(ch5Item3?.visual_template?.type).toBe("AreaGrid");
  });
});
