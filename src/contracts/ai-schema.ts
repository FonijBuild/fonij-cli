export const PRODUCT_REQUIREMENTS_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["name", "idea", "stage", "targets", "requirements"],
  properties: {
    name: { type: "string", minLength: 1 },
    idea: { type: "string" },
    stage: { type: "string", enum: ["prototype", "mvp", "production"] },
    targets: {
      type: "array",
      minItems: 1,
      uniqueItems: true,
      items: {
        type: "string",
        enum: ["web", "mobile", "api", "browser-extension", "service"],
      },
    },
    requirements: {
      type: "object",
      additionalProperties: false,
      required: [
        "seo",
        "authentication",
        "database",
        "realtime",
        "offline",
        "backgroundJobs",
        "ai",
        "uploads",
      ],
      properties: {
        seo: { type: "boolean" },
        authentication: { type: "boolean" },
        database: { type: "boolean" },
        realtime: { type: "boolean" },
        offline: { type: "boolean" },
        backgroundJobs: { type: "boolean" },
        ai: { type: "boolean" },
        uploads: { type: "boolean" },
      },
    },
  },
} as const;
