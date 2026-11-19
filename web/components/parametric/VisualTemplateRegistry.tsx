"use client";

import React from "react";
import { FractionStrip } from "./FractionStrip";
import { NumberLine } from "./NumberLine";
import { AreaGrid } from "./AreaGrid";
import { BalanceScale } from "./BalanceScale";
import { BucketSort } from "./BucketSort";
import { PlaceValueTable } from "./PlaceValueTable";
import { AbacusVisualizer } from "./AbacusVisualizer";
import { InputOutputMachine } from "./InputOutputMachine";
import { MatchstickPattern } from "./MatchstickPattern";
import { DotPatternVisualizer } from "./DotPatternVisualizer";
import { ProtractorVisualizer } from "./ProtractorVisualizer";
import { ClockVisualizer } from "./ClockVisualizer";
import { FractionCircle } from "./FractionCircle";
import { ProbabilitySpinner } from "./ProbabilitySpinner";
import { BrokenLineGraph } from "./BrokenLineGraph";
import { PlaceValueBundles } from "./PlaceValueBundles";
import { VolumePrismVisualizer } from "./VolumePrismVisualizer";
import { SymmetryPlayground } from "./SymmetryPlayground";
import { FractionAreaMultiplier } from "./FractionAreaMultiplier";
import { PolygonAreaDecomposer } from "./PolygonAreaDecomposer";
import { CircleMeasurementVisualizer } from "./CircleMeasurementVisualizer";
import { CompoundUnitCalculator } from "./CompoundUnitCalculator";
import { CoordinateGridVisualizer } from "./CoordinateGridVisualizer";
import { IntegerNumberLine } from "./IntegerNumberLine";
import { AngleRelationshipVisualizer } from "./AngleRelationshipVisualizer";
import { FractionDivisionVisualizer } from "./FractionDivisionVisualizer";
import { CylinderVolumeVisualizer } from "./CylinderVolumeVisualizer";

export interface VisualTemplateData {
  type: string;
  props: Record<string, any>;
}

export interface VisualTemplateRendererProps {
  template?: VisualTemplateData | null;
}

/**
 * Universal Pedagogical Visual Manipulative Dispatcher.
 * Maps any canonical or dynamic visual template to its React/SVG component.
 */
export const VisualTemplateRenderer: React.FC<VisualTemplateRendererProps> = ({ template }) => {
  if (!template || !template.type) return null;
  const { type, props = {} } = template;
  const p = props as any;

  switch (type) {
    // Phase 1 Existing Models
    case "FractionStrip":
      return <FractionStrip {...p} hideCounter={p.hideCounter ?? true} />;
    case "NumberLine":
      return <NumberLine {...p} hideFractions={p.hideFractions ?? true} />;
    case "AreaGrid":
      return <AreaGrid {...p} hideBadge={p.hideBadge ?? true} />;
    case "BalanceScale":
      return <BalanceScale {...p} hideBadge={p.hideBadge ?? true} />;
    case "BucketSort":
      return <BucketSort {...p} />;

    // Grade 4 Canonical Textbook Manipulatives
    case "PlaceValueTable":
      return <PlaceValueTable {...p} />;
    case "PlaceValueBundles":
      return <PlaceValueBundles {...p} />;
    case "AbacusVisualizer":
      return <AbacusVisualizer {...p} />;
    case "InputOutputMachine":
      return <InputOutputMachine {...p} />;
    case "MatchstickPattern":
      return <MatchstickPattern {...p} />;
    case "DotPatternVisualizer":
      return <DotPatternVisualizer {...p} />;
    case "ProtractorVisualizer":
      return <ProtractorVisualizer {...p} />;
    case "ClockVisualizer":
      return <ClockVisualizer {...p} />;
    case "FractionCircle":
      return <FractionCircle {...p} />;
    case "ProbabilitySpinner":
      return <ProbabilitySpinner {...p} />;
    case "BrokenLineGraph":
      return <BrokenLineGraph {...p} />;

    // Grade 5 Advanced Mathematical Manipulatives
    case "VolumePrismVisualizer":
      return <VolumePrismVisualizer {...p} />;
    case "SymmetryPlayground":
      return <SymmetryPlayground {...p} />;
    case "FractionAreaMultiplier":
      return <FractionAreaMultiplier {...p} />;
    case "PolygonAreaDecomposer":
      return <PolygonAreaDecomposer {...p} />;
    case "CircleMeasurementVisualizer":
      return <CircleMeasurementVisualizer {...p} />;
    case "CompoundUnitCalculator":
      return <CompoundUnitCalculator {...p} />;

    // Grade 6 Rigorous Spatial & Diagnostic Manipulatives
    case "CoordinateGridVisualizer":
      return <CoordinateGridVisualizer {...p} />;
    case "IntegerNumberLine":
      return <IntegerNumberLine {...p} />;
    case "AngleRelationshipVisualizer":
      return <AngleRelationshipVisualizer {...p} />;
    case "FractionDivisionVisualizer":
      return <FractionDivisionVisualizer {...p} />;
    case "CylinderVolumeVisualizer":
      return <CylinderVolumeVisualizer {...p} />;

    default:
      console.warn(`[VisualTemplateRenderer] Unknown visual template type: ${type}`);
      return null;
  }
};
