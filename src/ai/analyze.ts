import type { ProductRequirements } from "../contracts/index.js";
import { logger } from "../utils/logger.js";
import { LocalIdeaAnalyzer } from "./local.js";
import { OpenAIIdeaAnalyzer } from "./openai.js";

export async function analyzeIdea(
  idea: string,
  projectName: string,
  options: { useAI?: boolean } = {},
): Promise<{ requirements: ProductRequirements; source: "openai" | "local" }> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (options.useAI !== false && apiKey) {
    try {
      const requirements = await new OpenAIIdeaAnalyzer(apiKey).analyze(idea, projectName);
      return { requirements, source: "openai" };
    } catch (error) {
      logger.warn(`AI analysis failed; falling back to local intent analysis: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  return {
    requirements: await new LocalIdeaAnalyzer().analyze(idea, projectName),
    source: "local",
  };
}
