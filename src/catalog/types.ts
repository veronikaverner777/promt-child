export interface PromptCategory {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}
export interface DeepSeekPrompt {
  id: string;
  title: string;
  category_id: string;
  description: string;
  content: string;
  cover_path: string | null;
  tags: string[];
  published: boolean;
  sort_order: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}
export interface CatalogPrompt extends DeepSeekPrompt {
  cover_url: string | null;
}
export interface PromptInput {
  title: string;
  category_id: string;
  description: string;
  content: string;
  tags: string[];
  cover_path: string | null;
}
