/// <reference types="@testing-library/jest-dom/vitest" />
import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import LandingPage from "../app/page";

describe("Landing Page Component", () => {
  it("renders role selection cards for both student and teacher", () => {
    render(<LandingPage />);

    // Title and Hero
    expect(screen.getByText("یادگیری مفهومی و سنجش هوشمند کسرها")).toBeInTheDocument();
    
    // Student portal card
    expect(screen.getByText("ویژه دانش‌آموزان")).toBeInTheDocument();
    expect(screen.getByText("ورود به بخش دانش‌آموز")).toBeInTheDocument();
    
    // Teacher portal card
    expect(screen.getByText("ویژه آموزگاران")).toBeInTheDocument();
    expect(screen.getByText("ورود به میز آموزگار")).toBeInTheDocument();

    // Verify links
    const studentLink = screen.getByRole("link", { name: /ورود به بخش دانش‌آموز/i });
    expect(studentLink).toHaveAttribute("href", "/student");

    const teacherLink = screen.getByRole("link", { name: /ورود به میز آموزگار/i });
    expect(teacherLink).toHaveAttribute("href", "/teacher");
  });
});
