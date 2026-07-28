export const CATEGORIES = [
  "Breakfast",
  "Appetizer",
  "Main Dish",
  "Side Dish",
  "Dessert",
] as const;

export type Category = (typeof CATEGORIES)[number];

export type Recipe = {
  id: string;
  title: string;
  category: string;
  description: string | null;
  notes: string | null;
  source_page: number | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type RecipeIngredient = {
  id: string;
  text: string;
  sort_order: number;
};

export type RecipeStep = {
  id: string;
  step_number: number;
  text: string;
};

export type RecipeImage = {
  id: string;
  storage_path: string;
  is_primary: boolean;
};
