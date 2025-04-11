import { type TaskYieldUpdate } from "../../server/handler.js";
import {
  type TaskContext,
  A2AServer,
} from "../../server/index.js";
import * as schema from "../../schema.js";
import { CodeHandler } from "./code-handler.js";

const codeHandler = new CodeHandler();

async function* coderAgent({
  task,
  history,
}: TaskContext): AsyncGenerator<TaskYieldUpdate, schema.Task | void, unknown> {
  const messages = (history ?? [])
    .map((m) => ({
      role: m.role === "agent" ? "assistant" : "user",
      content: m.parts
        .filter((p): p is schema.TextPart => !!(p as schema.TextPart).text)
        .map((p) => p.text)
        .join("\n"),
    }))
    .filter((m) => m.content.length > 0);

  if (messages.length === 0) {
    console.warn(`[CoderAgent] No history/messages found for task ${task.id}`);
    yield {
      state: "failed",
      message: {
        role: "agent",
        parts: [{ text: "No input message found." }],
      },
    };
    return;
  }

  yield {
    state: "working",
    message: {
      role: "agent",
      parts: [{ type: "text", text: "Generating code..." }],
    },
  };

  try {
    const stream = await codeHandler.generateCodeStream(messages);
    const fileContents = new Map<string, string>();
    const fileOrder: string[] = [];
    let emittedFileCount = 0;

    for await (const codeMessage of stream) {
      for (const file of codeMessage.files) {
        if (!file.filename) continue;

        const key = file.filename;
        if (!fileContents.has(key)) {
          fileOrder.push(key);
        }
        fileContents.set(key, file.content);

        if (file.done && emittedFileCount < fileOrder.length) {
          const filename = fileOrder[emittedFileCount];
          const content = fileContents.get(filename) || "";
          console.log('content', content);
          yield {
            state: "working",
            message: {
              role: "agent",
              parts: [
                {
                  type: "file",
                  name: filename,
                  content: content,
                  done: true,
                },
              ],
            },
          };
          emittedFileCount++;
        }
      }
    }

    yield {
      state: "completed",
      message: {
        role: "agent",
        parts: [{ text: "Code generation completed." }],
      },
    };
  } catch (error) {
    console.error("[CoderAgent] Error:", error);
    yield {
      state: "failed",
      message: {
        role: "agent",
        parts: [{ text: `Error generating code: ${error.message}` }],
      },
    };
  }
}

const coderAgentCard: schema.AgentCard = {
  name: "Coder Agent",
  description:
    "An agent that generates code based on natural language instructions and streams file outputs.",
  url: "http://localhost:41241",
  provider: {
    organization: "A2A Samples",
  },
  version: "0.0.1",
  capabilities: {
    streaming: true,
    pushNotifications: false,
    stateTransitionHistory: true,
  },
  authentication: null,
  defaultInputModes: ["text"],
  defaultOutputModes: ["text", "file"],
  skills: [
    {
      id: "code_generation",
      name: "Code Generation",
      description:
        "Generates code snippets or complete files based on user requests, streaming the results.",
      tags: ["code", "development", "programming"],
      examples: [
        "Write a python function to calculate fibonacci numbers.",
        "Create an HTML file with a basic button that alerts 'Hello!' when clicked.",
        "Generate a TypeScript class for a user profile with name and email properties.",
        "Refactor this Java code to be more efficient.",
        "Write unit tests for the following Go function.",
      ],
    },
  ],
};

const server = new A2AServer(coderAgent, {
  card: coderAgentCard,
});

server.start();