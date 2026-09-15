import { PRODUCT_REQUIREMENTS_JSON_SCHEMA } from "../contracts/ai-schema.js";
import { ProductRequirementsSchema, type ProductRequirements } from "../contracts/index.js";
import { CliError } from "../utils/errors.js";
import type { IdeaAnalyzer } from "./provider.js";

export class OpenAIIdeaAnalyzer implements IdeaAnalyzer {
  constructor(
    private readonly apiKey: string,
    private readonly model = process.env.FONIJ_OPENAI_MODEL ?? "gpt-5.6-luna",
  ) {}

  async analyze(idea: string, projectName: string): Promise<ProductRequirements> {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        authorization: `Bearer ${this.apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        store: false,
        input: [
          {
            role: "system",
            content: [
              {
                type: "input_text",
                text:
                  "You convert product ideas into conservative technical requirements. Do not choose frameworks. Prefer prototype simplicity. Add an API target only when server-side state, authentication, persistence, secrets, payments, uploads, admin workflows, or integrations actually require it. Model bots, workers, webhooks, scheduled jobs, and automation as the service target. Return only the requested structured output.",
              },
            ],
          },
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: `Project name: ${projectName}\n\nIdea:\n${idea}`,
              },
            ],
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "product_requirements",
            strict: true,
            schema: PRODUCT_REQUIREMENTS_JSON_SCHEMA,
          },
        },
      }),
      signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) {
      const message = await response.text();
      throw new CliError(
        `OpenAI request failed (${response.status}): ${message.slice(0, 300)}`,
        "AI_PROVIDER_ERROR",
      );
    }

    const payload = (await response.json()) as { output_text?: string };
    if (!payload.output_text) {
      throw new CliError("OpenAI returned no structured output.", "AI_EMPTY_RESPONSE");
    }

    return ProductRequirementsSchema.parse(JSON.parse(payload.output_text));
  }
}
