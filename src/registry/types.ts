export interface Starter {
  name: string;
  displayName: string;
  description: string;
  repository: string;
  category: string;
  requirements?: {
    node?: string;
    python?: string;
    packageManager?: string;
  };
  setup?: {
    install?: string;
  };
}
