import { describe, expect, it, vi } from "vitest";
import { createMessage } from "./message";

describe("createMessage", () => {
  it("creates a complete message by default", () => {
    vi.spyOn(crypto, "randomUUID").mockReturnValue(
      "00000000-0000-4000-8000-000000000001",
    );

    const message = createMessage("user", "hello");

    expect(message).toMatchObject({
      id: "00000000-0000-4000-8000-000000000001",
      role: "user",
      content: "hello",
      status: "complete",
    });
    expect(Date.parse(message.createdAt)).not.toBeNaN();
  });

  it("accepts pending assistant messages", () => {
    expect(createMessage("assistant", "", "pending").status).toBe("pending");
  });
});
