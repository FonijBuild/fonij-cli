import type { ResolvedCatalog } from "../../src/contracts/index.js";

export const TEST_CATALOG: ResolvedCatalog = {
  "schemaVersion": 1,
  "catalogVersion": "1.0.0",
  "updatedAt": "2026-09-15",
  "sourceUrl": "https://example.test/catalog.json",
  "foundations": [
    {
      "schemaVersion": 1,
      "status": "stable",
      "official": true,
      "manifestPath": ".fonij/starter.json",
      "id": "web-nextjs",
      "name": "Next.js Web",
      "description": "Next.js web foundation for public products, SaaS applications, portals, and SEO-sensitive experiences.",
      "target": "web",
      "source": {
        "repository": "FonijBuild/easy-nextjs-web-starter",
        "ref": "v1.0.0",
        "version": "1.0.0"
      },
      "runtime": {
        "language": "typescript",
        "framework": "nextjs",
        "packageManager": "pnpm"
      },
      "provides": [
        "web",
        "ssr",
        "seo",
        "server-rendering",
        "route-handlers"
      ],
      "compatibleWith": [
        "api-django",
        "app-expo",
        "python-service"
      ],
      "commands": {
        "install": {
          "command": "pnpm",
          "args": [
            "install"
          ]
        },
        "dev": {
          "command": "pnpm",
          "args": [
            "dev"
          ]
        },
        "check": {
          "command": "pnpm",
          "args": [
            "check"
          ]
        }
      }
    },
    {
      "schemaVersion": 1,
      "status": "stable",
      "official": true,
      "manifestPath": ".fonij/starter.json",
      "id": "web-spa",
      "name": "Vite React SPA",
      "description": "Vite + React foundation for dashboards, internal tools, portals, and API-driven single-page applications.",
      "target": "web",
      "source": {
        "repository": "FonijBuild/easy-vite-react-spa-starter",
        "ref": "v1.0.0",
        "version": "1.0.0"
      },
      "runtime": {
        "language": "typescript",
        "framework": "vite-react",
        "packageManager": "pnpm"
      },
      "provides": [
        "web",
        "spa",
        "client-rendering",
        "typed-routing",
        "api-driven"
      ],
      "compatibleWith": [
        "api-django",
        "app-expo",
        "browser-extension",
        "python-service"
      ],
      "commands": {
        "install": {
          "command": "pnpm",
          "args": [
            "install"
          ]
        },
        "dev": {
          "command": "pnpm",
          "args": [
            "dev"
          ]
        },
        "check": {
          "command": "pnpm",
          "args": [
            "check"
          ]
        }
      }
    },
    {
      "schemaVersion": 1,
      "status": "stable",
      "official": true,
      "manifestPath": ".fonij/starter.json",
      "id": "api-django",
      "name": "Django API",
      "description": "Django API foundation for maintainable domain logic, admin workflows, and multi-client products.",
      "target": "api",
      "source": {
        "repository": "FonijBuild/easy-django-api-starter",
        "ref": "v1.0.0",
        "version": "1.0.0"
      },
      "runtime": {
        "language": "python",
        "framework": "django",
        "packageManager": "uv"
      },
      "provides": [
        "api",
        "rest-api",
        "admin",
        "database",
        "postgres-ready",
        "openapi"
      ],
      "compatibleWith": [
        "web-nextjs",
        "web-spa",
        "app-expo",
        "browser-extension",
        "python-service"
      ],
      "commands": {
        "install": {
          "command": "uv",
          "args": [
            "sync"
          ]
        },
        "dev": {
          "command": "uv",
          "args": [
            "run",
            "python",
            "manage.py",
            "runserver"
          ]
        },
        "check": {
          "command": "uv",
          "args": [
            "run",
            "pytest"
          ]
        }
      }
    },
    {
      "schemaVersion": 1,
      "status": "stable",
      "official": true,
      "manifestPath": ".fonij/starter.json",
      "id": "app-expo",
      "name": "Expo App",
      "description": "Expo foundation for maintainable cross-platform Android, iOS, and web applications.",
      "target": "mobile",
      "source": {
        "repository": "FonijBuild/easy-expo-app-starter",
        "ref": "v1.0.0",
        "version": "1.0.0"
      },
      "runtime": {
        "language": "typescript",
        "framework": "expo",
        "packageManager": "pnpm"
      },
      "provides": [
        "mobile",
        "ios",
        "android",
        "cross-platform",
        "native-capabilities"
      ],
      "compatibleWith": [
        "api-django",
        "web-nextjs",
        "web-spa",
        "python-service"
      ],
      "commands": {
        "install": {
          "command": "pnpm",
          "args": [
            "install"
          ]
        },
        "dev": {
          "command": "pnpm",
          "args": [
            "dev"
          ]
        },
        "check": {
          "command": "pnpm",
          "args": [
            "check"
          ]
        }
      }
    },
    {
      "schemaVersion": 1,
      "status": "stable",
      "official": true,
      "manifestPath": ".fonij/starter.json",
      "id": "browser-extension",
      "name": "Browser Extension",
      "description": "React + TypeScript foundation for cross-browser extensions targeting Chrome, Edge, and Firefox.",
      "target": "browser-extension",
      "source": {
        "repository": "FonijBuild/easy-browser-extension-starter",
        "ref": "v1.0.0",
        "version": "1.0.0"
      },
      "runtime": {
        "language": "typescript",
        "framework": "extensionjs",
        "packageManager": "pnpm"
      },
      "provides": [
        "browser-extension",
        "content-scripts",
        "background",
        "popup",
        "cross-browser"
      ],
      "compatibleWith": [
        "api-django",
        "web-spa",
        "python-service"
      ],
      "commands": {
        "install": {
          "command": "pnpm",
          "args": [
            "install"
          ]
        },
        "dev": {
          "command": "pnpm",
          "args": [
            "dev"
          ]
        },
        "check": {
          "command": "pnpm",
          "args": [
            "check"
          ]
        }
      }
    },
    {
      "schemaVersion": 1,
      "status": "stable",
      "official": true,
      "manifestPath": ".fonij/starter.json",
      "id": "python-service",
      "name": "Python Service",
      "description": "Python service foundation for workers, webhooks, scheduled jobs, integrations, automation, and messaging workloads.",
      "target": "service",
      "source": {
        "repository": "FonijBuild/easy-python-service-starter",
        "ref": "v1.0.0",
        "version": "1.0.0"
      },
      "runtime": {
        "language": "python",
        "framework": "none",
        "packageManager": "uv"
      },
      "provides": [
        "service",
        "worker",
        "webhooks",
        "scheduled-jobs",
        "integrations",
        "bot-ready"
      ],
      "compatibleWith": [
        "api-django",
        "web-nextjs",
        "web-spa",
        "app-expo",
        "browser-extension"
      ],
      "commands": {
        "install": {
          "command": "uv",
          "args": [
            "sync"
          ]
        },
        "check": {
          "command": "uv",
          "args": [
            "run",
            "pytest"
          ]
        }
      }
    }
  ],
  "blueprints": [
    {
      "schemaVersion": 1,
      "id": "web",
      "name": "Web",
      "description": "Standalone web product with a client-first default and an SSR/SEO-capable alternative.",
      "status": "stable",
      "workspace": "standalone",
      "targets": [
        "web"
      ],
      "apps": [
        {
          "id": "web",
          "target": "web",
          "path": ".",
          "foundation": {
            "default": "web-spa",
            "alternatives": [
              "web-nextjs"
            ]
          }
        }
      ],
      "capabilities": [],
      "recommendedFor": [
        "prototype",
        "dashboard",
        "internal-tool",
        "authenticated-web-app",
        "public-web-app"
      ]
    },
    {
      "schemaVersion": 1,
      "id": "web-api",
      "name": "Web + API",
      "description": "Web frontend with a dedicated Django API in a monorepo.",
      "status": "stable",
      "workspace": "monorepo",
      "targets": [
        "web",
        "api"
      ],
      "apps": [
        {
          "id": "web",
          "target": "web",
          "path": "apps/web",
          "foundation": {
            "default": "web-spa",
            "alternatives": [
              "web-nextjs"
            ]
          }
        },
        {
          "id": "api",
          "target": "api",
          "path": "apps/api",
          "foundation": {
            "default": "api-django",
            "alternatives": []
          }
        }
      ],
      "capabilities": [
        "rest-api"
      ],
      "recommendedFor": [
        "business-application",
        "dashboard",
        "saas",
        "multi-client-ready",
        "domain-heavy-web-app"
      ]
    },
    {
      "schemaVersion": 1,
      "id": "mobile",
      "name": "Mobile",
      "description": "Standalone cross-platform Expo application for mobile-first products and prototypes.",
      "status": "stable",
      "workspace": "standalone",
      "targets": [
        "mobile"
      ],
      "apps": [
        {
          "id": "mobile",
          "target": "mobile",
          "path": ".",
          "foundation": {
            "default": "app-expo",
            "alternatives": []
          }
        }
      ],
      "capabilities": [],
      "recommendedFor": [
        "mobile-first",
        "prototype",
        "offline-capable-ui",
        "native-device-experience"
      ]
    },
    {
      "schemaVersion": 1,
      "id": "mobile-api",
      "name": "Mobile + API",
      "description": "Expo mobile application with a dedicated Django API in a monorepo.",
      "status": "stable",
      "workspace": "monorepo",
      "targets": [
        "mobile",
        "api"
      ],
      "apps": [
        {
          "id": "mobile",
          "target": "mobile",
          "path": "apps/mobile",
          "foundation": {
            "default": "app-expo",
            "alternatives": []
          }
        },
        {
          "id": "api",
          "target": "api",
          "path": "apps/api",
          "foundation": {
            "default": "api-django",
            "alternatives": []
          }
        }
      ],
      "capabilities": [
        "rest-api"
      ],
      "recommendedFor": [
        "mobile-product",
        "authenticated-mobile-app",
        "persistent-data",
        "admin-workflows"
      ]
    },
    {
      "schemaVersion": 1,
      "id": "web-mobile-api",
      "name": "Web + Mobile + API",
      "description": "Shared backend with web and mobile clients in one product monorepo.",
      "status": "stable",
      "workspace": "monorepo",
      "targets": [
        "web",
        "mobile",
        "api"
      ],
      "apps": [
        {
          "id": "web",
          "target": "web",
          "path": "apps/web",
          "foundation": {
            "default": "web-spa",
            "alternatives": [
              "web-nextjs"
            ]
          }
        },
        {
          "id": "mobile",
          "target": "mobile",
          "path": "apps/mobile",
          "foundation": {
            "default": "app-expo",
            "alternatives": []
          }
        },
        {
          "id": "api",
          "target": "api",
          "path": "apps/api",
          "foundation": {
            "default": "api-django",
            "alternatives": []
          }
        }
      ],
      "capabilities": [
        "rest-api"
      ],
      "recommendedFor": [
        "multi-surface-product",
        "customer-web-and-mobile",
        "shared-domain-backend"
      ]
    },
    {
      "schemaVersion": 1,
      "id": "extension",
      "name": "Browser Extension",
      "description": "Standalone browser extension product.",
      "status": "stable",
      "workspace": "standalone",
      "targets": [
        "browser-extension"
      ],
      "apps": [
        {
          "id": "extension",
          "target": "browser-extension",
          "path": ".",
          "foundation": {
            "default": "browser-extension",
            "alternatives": []
          }
        }
      ],
      "capabilities": [],
      "recommendedFor": [
        "browser-workflow",
        "content-script",
        "side-panel",
        "browser-assistant"
      ]
    },
    {
      "schemaVersion": 1,
      "id": "extension-api",
      "name": "Browser Extension + API",
      "description": "Browser extension backed by a dedicated Django API.",
      "status": "stable",
      "workspace": "monorepo",
      "targets": [
        "browser-extension",
        "api"
      ],
      "apps": [
        {
          "id": "extension",
          "target": "browser-extension",
          "path": "apps/extension",
          "foundation": {
            "default": "browser-extension",
            "alternatives": []
          }
        },
        {
          "id": "api",
          "target": "api",
          "path": "apps/api",
          "foundation": {
            "default": "api-django",
            "alternatives": []
          }
        }
      ],
      "capabilities": [
        "rest-api"
      ],
      "recommendedFor": [
        "authenticated-extension",
        "server-backed-extension",
        "shared-user-data"
      ]
    },
    {
      "schemaVersion": 1,
      "id": "service",
      "name": "Service",
      "description": "Standalone Python service for automation, workers, webhooks, integrations, and messaging workloads.",
      "status": "stable",
      "workspace": "standalone",
      "targets": [
        "service"
      ],
      "apps": [
        {
          "id": "service",
          "target": "service",
          "path": ".",
          "foundation": {
            "default": "python-service",
            "alternatives": []
          }
        }
      ],
      "capabilities": [],
      "recommendedFor": [
        "automation",
        "worker",
        "webhook-consumer",
        "scheduled-job",
        "integration-service",
        "messaging-bot"
      ]
    }
  ],
  "capabilities": [],
  "recipes": [],
  "evolutions": [
    {
      "schemaVersion": 1,
      "id": "web-to-web-api",
      "name": "Web \u2192 Web + API",
      "description": "Evolve a standalone web project into a web + Django API monorepo without rebuilding the web application.",
      "status": "stable",
      "fromBlueprint": "web",
      "toBlueprint": "web-api",
      "preconditions": [
        "fonij-project",
        "clean-git"
      ],
      "operations": [
        {
          "type": "move-app",
          "app": "web",
          "to": "apps/web"
        },
        {
          "type": "add-foundation",
          "app": "api",
          "target": "api",
          "foundation": "api-django",
          "path": "apps/api"
        },
        {
          "type": "create-workspace",
          "packageManager": "pnpm"
        }
      ]
    },
    {
      "schemaVersion": 1,
      "id": "mobile-to-mobile-api",
      "name": "Mobile \u2192 Mobile + API",
      "description": "Evolve a standalone Expo app into a mobile + Django API monorepo.",
      "status": "stable",
      "fromBlueprint": "mobile",
      "toBlueprint": "mobile-api",
      "preconditions": [
        "fonij-project",
        "clean-git"
      ],
      "operations": [
        {
          "type": "move-app",
          "app": "mobile",
          "to": "apps/mobile"
        },
        {
          "type": "add-foundation",
          "app": "api",
          "target": "api",
          "foundation": "api-django",
          "path": "apps/api"
        },
        {
          "type": "create-workspace",
          "packageManager": "pnpm"
        }
      ]
    },
    {
      "schemaVersion": 1,
      "id": "web-api-to-web-mobile-api",
      "name": "Web + API \u2192 Web + Mobile + API",
      "description": "Add an Expo mobile client to an existing web + API product monorepo.",
      "status": "stable",
      "fromBlueprint": "web-api",
      "toBlueprint": "web-mobile-api",
      "preconditions": [
        "fonij-project",
        "clean-git"
      ],
      "operations": [
        {
          "type": "add-foundation",
          "app": "mobile",
          "target": "mobile",
          "foundation": "app-expo",
          "path": "apps/mobile"
        }
      ]
    }
  ]
};
