import Papa from 'papaparse';
import { RecipeEntry } from '@/types/recipe';

export function parseCSV(csvText: string): RecipeEntry[] {
  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  return result.data
    .filter((row) => row.book_title && row.recipe_title && row.page_number)
    .filter((row) => !isNaN(parseInt(row.page_number, 10)))
    .map((row) => ({
      bookTitle: row.book_title.trim(),
      recipeTitle: row.recipe_title.trim(),
      pageNumber: parseInt(row.page_number, 10),
      description: row.description?.trim() || undefined,
    }));
}
