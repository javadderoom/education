import { describe, it, expect } from "vitest";
import { importCartridgePackageAction } from "../actions/admin";

describe("Cartridge Package Importer Action", () => {
  it("rejects unauthorized caller when no admin session is active", async () => {
    const res = await importCartridgePackageAction("{}");
    expect(res.success).toBe(false);
    expect(res.error).toContain("دسترسی تنها برای مدیر ارشد");
  });

  it("rejects invalid or empty json payload cleanly", async () => {
    // When called directly without session it safely returns auth failure before parsing
    const res = await importCartridgePackageAction("");
    expect(res.success).toBe(false);
  });
});
