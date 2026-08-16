import { describe, expect, it } from "vitest";
import { shouldSubmitComposer } from "./composer-keyboard";

describe("shouldSubmitComposer", () => {
  it("submits a plain Enter key", () => {
    expect(
      shouldSubmitComposer({ key: "Enter", shiftKey: false, isComposing: false }),
    ).toBe(true);
  });

  it("keeps Shift+Enter as a newline", () => {
    expect(
      shouldSubmitComposer({ key: "Enter", shiftKey: true, isComposing: false }),
    ).toBe(false);
  });

  it("does not submit during IME composition", () => {
    expect(
      shouldSubmitComposer({ key: "Enter", shiftKey: false, isComposing: true }),
    ).toBe(false);
  });
});
