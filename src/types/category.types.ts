export interface Category {
  id: string;
  name: string;
  slug: string;
  emoji?: string;
  icon?: string | null;
  description?: string | null;
  isActive?: boolean;
  order?: number;
}

// Alias for unified usage
export type ICategory = Category;
