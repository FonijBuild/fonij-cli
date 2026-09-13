export interface Starter {
  name: string;
  version: string;
  displayName: string;
  description: string;
  repository: string;
  language: "python" | "typescript" | "javascript";
  packageManager?: "npm" | "pnpm" | "yarn" | "uv";
  variables?: string[];
  commands?: {
    install?: string;
    dev?: string;
  };
  hooks?: {
    afterCreate?: string;
  };
}
