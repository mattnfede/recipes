import { RecipeEntry } from '@/types/recipe';

/**
 * Pure function that applies both search and book filters as a conjunction.
 * - If `selectedBook` is non-null, keeps only entries where `bookTitle === selectedBook`
 * - If `searchText` is non-empty, keeps only entries where `recipeTitle` or `description`
 *   contains `searchText` (case-insensitive)
 * - Returns the intersection of both filters
 */
export function filterRecipes(
  recipes: RecipeEntry[],
  searchText: string,
  selectedBook: string | null
): RecipeEntry[] {
  const query = searchText.toLowerCase().trim();

  return recipes.filter((entry) => {
    // Book filter
    if (selectedBook && entry.bookTitle !== selectedBook) {
      return false;
    }
    // Text search
    if (query) {
      const titleMatch = entry.recipeTitle.toLowerCase().includes(query);
      const descMatch = entry.description?.toLowerCase().includes(query) ?? false;
      if (!titleMatch && !descMatch) {
        return false;
      }
    }
    return true;
  });
}

/**
 * Extracts sorted unique book titles from the recipe list.
 */
export function getDistinctBooks(recipes: RecipeEntry[]): string[] {
  const books = new Set(recipes.map((r) => r.bookTitle));
  return Array.from(books).sort();
}
