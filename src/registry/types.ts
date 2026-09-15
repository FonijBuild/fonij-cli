export interface Starter {
  name: string;
  displayName: string;
  description: string;
  repository: string;
  version: string;
  category: string;
}

export interface Registry {
  version: string;
  updatedAt: string;
  starters: Starter[];
}
