export const CATEGORIES = [
  "Breakfast",
  "Appetizer",
  "Main Dish",
  "Side Dish",
  "Dessert",
] as const;

export type Category = (typeof CATEGORIES)[number];

export type RecipeImage = {
  src: string; // site-relative path under /images/recipes/, e.g. "/images/recipes/<id>/<file>.jpg"
  is_primary: boolean;
};

// One entry in data/recipes.json.
export type Recipe = {
  id: string;
  title: string;
  category: string;
  description: string | null;
  notes: string | null;
  source_page: number | null;
  created_at: string;
  updated_at: string;
  ingredients: string[];
  steps: string[];
  images: RecipeImage[];
};

// Shape used on the browse grid — just enough to render a card.
export type RecipeCardData = Pick<Recipe, "id" | "title" | "category"> & {
  image: string | null;
};
