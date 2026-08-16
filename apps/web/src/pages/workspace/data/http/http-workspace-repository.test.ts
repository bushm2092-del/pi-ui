import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import type { Conversation } from "../../domain";
import { HttpWorkspaceRepository } from "./http-workspace-repository";

const baseUrl = "https://workspace.test/api";
const conversation: Conversation = {
  id: "conversation/1",
  title: "Contract test",
  processingLabel: "Done",
  summary: { sectionLabel: "Output", actionLabel: "Create" },
  messages: [],
};

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("HttpWorkspaceRepository", () => {
  it("loads an encoded conversation resource", async () => {
    server.use(
      http.get(`${baseUrl}/conversations/conversation%2F1`, () =>
        HttpResponse.json(conversation),
      ),
    );

    const repository = new HttpWorkspaceRepository(baseUrl);
    await expect(repository.getConversation(conversation.id)).resolves.toEqual(
      conversation,
    );
  });

  it("posts message content and returns the reply", async () => {
    server.use(
      http.post(
        `${baseUrl}/conversations/conversation%2F1/messages`,
        async ({ request }) => {
          expect(await request.json()).toEqual({ content: "Hello" });
          return HttpResponse.json({ reply: "World" });
        },
      ),
    );

    const repository = new HttpWorkspaceRepository(baseUrl);
    await expect(
      repository.sendMessage(conversation.id, "Hello"),
    ).resolves.toBe("World");
  });

  it("turns non-success responses into repository errors", async () => {
    server.use(
      http.post(
        `${baseUrl}/conversations/conversation%2F1/messages`,
        () => new HttpResponse(null, { status: 503 }),
      ),
    );

    const repository = new HttpWorkspaceRepository(baseUrl);
    await expect(repository.sendMessage(conversation.id, "Hello")).rejects.toThrow(
      "Workspace request failed with status 503",
    );
  });
});
