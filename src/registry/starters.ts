export type Starter = {
  name: string;
  description: string;
  repository: string;
  install?: string;
};

export const starters: Starter[] = [
  {
    name: "django-api",
    description: "Django REST API starter",
    repository: "FonijBuild/easy-django-api-starter",
    install: "uv sync"
  },
  {
    name: "vite-react",
    description: "Vite React SPA starter",
    repository: "FonijBuild/easy-starter-vite-react-spa",
    install: "pnpm install"
  }
];
