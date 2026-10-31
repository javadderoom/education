/// <reference types="@testing-library/jest-dom/vitest" />
import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import LandingPage from "../app/page";

describe("Landing Page Component (Multi-Course Hub)", () => {
  it("renders multi-course cards and role portals for student, teacher and admin", () => {
    render(<LandingPage />);

    // Title and Hero
    expect(screen.getByText("یادگیری مفهومی و سنجش هوشمند ریاضی")).toBeInTheDocument();
    
    // Grade 4 Course Card
    expect(screen.getByText("ریاضی چهارم: مفهوم و محاسبات کسرها")).toBeInTheDocument();
    
    // Grade 5 Course Card
    expect(screen.getByText("ریاضی پنجم: نسبت، تناسب و درصد")).toBeInTheDocument();

    // Educational Standards & Staff Portal Access
    expect(screen.getByText("ورود همکاران")).toBeInTheDocument();
    const staffLink = screen.getByRole("link", { name: /ورود همکاران/i });
    expect(staffLink).toHaveAttribute("href", "/login?role=staff");
  });
});
