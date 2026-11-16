import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { RobotCompanion } from "../components/companion/RobotCompanion";

describe("RobotCompanion Component", () => {
  it("renders default idle mood with appropriate aria label", () => {
    render(<RobotCompanion />);
    const companion = screen.getByLabelText(/هم‌شاگردی ربات دانا - حالت: idle/);
    expect(companion).toBeDefined();
  });

  it("renders thinking mood with correct aria label", () => {
    render(<RobotCompanion mood="thinking" />);
    const companion = screen.getByLabelText(/هم‌شاگردی ربات دانا - حالت: thinking/);
    expect(companion).toBeDefined();
  });

  it("renders celebrating mood with correct aria label", () => {
    render(<RobotCompanion mood="celebrating" />);
    const companion = screen.getByLabelText(/هم‌شاگردی ربات دانا - حالت: celebrating/);
    expect(companion).toBeDefined();
  });

  it("renders reassuring mood with correct aria label", () => {
    render(<RobotCompanion mood="reassuring" />);
    const companion = screen.getByLabelText(/هم‌شاگردی ربات دانا - حالت: reassuring/);
    expect(companion).toBeDefined();
  });

  it("displays speech bubble with custom text when showSpeechBubble is true", () => {
    render(
      <RobotCompanion
        showSpeechBubble={true}
        speechText="سلام دوست من! آماده‌ای برای ریاضی؟"
      />
    );
    expect(screen.getByText("سلام دوست من! آماده‌ای برای ریاضی؟")).toBeDefined();
  });

  it("fires onClick handler when tapped", () => {
    const handleClick = vi.fn();
    render(<RobotCompanion onClick={handleClick} />);
    const companion = screen.getByRole("button");
    fireEvent.click(companion);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("applies highest z-index above all UI overlays by default and supports custom zIndex", () => {
    const { container, rerender } = render(<RobotCompanion showSpeechBubble={true} />);
    const rootElement = container.firstChild as HTMLElement;
    expect(rootElement.style.zIndex).toBe("60");

    rerender(<RobotCompanion showSpeechBubble={true} zIndex={100} />);
    expect(rootElement.style.zIndex).toBe("100");
  });
});
