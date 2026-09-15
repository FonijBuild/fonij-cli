import type { ProductRequirements } from "../contracts/index.js";

export interface IdeaAnalyzer {
  analyze(idea: string, projectName: string): Promise<ProductRequirements>;
}
