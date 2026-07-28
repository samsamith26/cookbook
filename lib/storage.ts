const BUCKET = "recipe-images";

/**
 * The bucket is public-read, so we can construct the URL directly
 * without an extra client round trip.
 */
export function recipeImageUrl(storagePath: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return `${base}/storage/v1/object/public/${BUCKET}/${storagePath}`;
}

export const RECIPE_IMAGES_BUCKET = BUCKET;
