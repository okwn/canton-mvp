import { describe, it, expect } from "vitest";
import { PACKAGE_NAME } from "./index.js";

describe("shared-types", () => {
  it("exports PACKAGE_NAME", () => {
    expect(PACKAGE_NAME).toBe("@canton-mvp/shared-types");
  });
});
