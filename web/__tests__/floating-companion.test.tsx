import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { FloatingCompanion } from "../components/companion/FloatingCompanion";

describe("FloatingCompanion Component (Smart Roaming Pedagogical Companion)", () => {
  it("renders floating companion with accessible aria label", () => {
    render(<FloatingCompanion mood="idle" />);
    const companion = screen.getByLabelText(/همیار دانا/);
    expect(companion).toBeDefined();
    expect(companion.getAttribute("aria-label")).toContain("همیار دانا");
  });

  it("automatically opens speech bubble with animated spring pop-in when speechText is provided", async () => {
    render(
      <FloatingCompanion
        mood="celebrating"
        speechText="آفرین قهرمان! عالی پیش رفتی."
        autoOpenSpeech={true}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("آفرین قهرمان! عالی پیش رفتی.")).toBeDefined();
    });
  });

  it("allows student to close the speech bubble via dismiss button", async () => {
    render(
      <FloatingCompanion
        mood="thinking"
        speechText="به الگوهای شکل‌ها دقت کن!"
        autoOpenSpeech={true}
      />
    );

    expect(screen.getByText("به الگوهای شکل‌ها دقت کن!")).toBeDefined();

    const closeBtn = screen.getByLabelText("بستن گفت‌وگوی دانا");
    fireEvent.click(closeBtn);

    await waitFor(() => {
      expect(screen.queryByText("به الگوهای شکل‌ها دقت کن!")).toBeNull();
    });
  });

  it("toggles peeking mode when toggle button is clicked and expands back on tap", () => {
    render(<FloatingCompanion mood="idle" />);

    const peekBtn = screen.getByText("کنار بایست");
    expect(peekBtn).toBeDefined();
    fireEvent.click(peekBtn);

    const peekingElement = screen.getByLabelText(/همیار دانا در حال سرک کشیدن/);
    expect(peekingElement).toBeDefined();

    // Tapping the peeking tab restores full companion view
    fireEvent.click(peekingElement);
    const restoredCompanion = screen.getByLabelText(/همیار دانا در حالت/);
    expect(restoredCompanion).toBeDefined();
  });

  it("triggers onCompanionClick when companion is tapped", () => {
    const handleClick = vi.fn();
    render(<FloatingCompanion mood="idle" onCompanionClick={handleClick} />);

    const companion = screen.getByLabelText(/همیار دانا/);
    fireEvent.pointerDown(companion, { clientX: 100, clientY: 200, button: 0 });
    fireEvent.pointerUp(companion, { clientX: 100, clientY: 200 });

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
