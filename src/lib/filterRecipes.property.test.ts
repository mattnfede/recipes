import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { filterRecipes, getDistinctBooks } from './filterRecipes';
import { RecipeEntry } from '@/types/recipe';

/**
 * Property tests for filterRecipes and getDistinctBooks.
 * Validates: Requirements 3.2, 3.4, 4.2, 4.4, 5.1
 */

const safeString = fc
  .stringOf(
    fc.char().filter((c) => c !== '"'),
    { minLength: 1, maxLength: 40 }
  )
  .map((s) => s.trim())
  .filter((s) => s.length > 0);

const recipeEntry = fc.record<RecipeEntry>({
  bookTitle: safeString,
  recipeTitle: safeString,
  pageNumber: fc.integer({ min: 1, max: 999 }),
  description: fc.oneof(safeString, fc.constant(undefined as unknown as string)),
});

describe('Property 3: Text Search Correctness', () => {
  it('all results contain the search string in title or description', () => {
    fc.assert(
      fc.property(
        fc.array(recipeEntry, { minLength: 0, maxLength: 30 }),
        safeString,
        (recipes, query) => {
          const results = filterRecipes(recipes, query, null);
          const q = query.toLowerCase().trim();

          for (const entry of results) {
            const inTitle = entry.recipeTitle.toLowerCase().includes(q);
            const inDesc = entry.description?.toLowerCase().includes(q) ?? false;
            expect(inTitle || inDesc).toBe(true);
          }
        }
      ),
      { numRuns: 200 }
    );
  });

  it('no matching entry is excluded from results', () => {
    fc.assert(
      fc.property(
        fc.array(recipeEntry, { minLength: 0, maxLength: 30 }),
        safeString,
        (recipes, query) => {
          const results = filterRecipes(recipes, query, null);
          const q = query.toLowerCase().trim();

          const expectedMatches = recipes.filter(
            (r) =>
              r.recipeTitle.toLowerCase().includes(q) ||
              (r.description?.toLowerCase().includes(q) ?? false)
          );

          expect(results).toHaveLength(expectedMatches.length);
        }
      ),
      { numRuns: 200 }
    );
  });
});

describe('Property 4: Book Filter Correctness', () => {
  it('all results have bookTitle matching the selected book exactly', () => {
    fc.assert(
      fc.property(
        fc.array(recipeEntry, { minLength: 1, maxLength: 30 }),
        (recipes) => {
          const books = getDistinctBooks(recipes);
          if (books.length === 0) return;

          // Pick the first book deterministically
          const selectedBook = books[0];
          const results = filterRecipes(recipes, '', selectedBook);

          for (const entry of results) {
            expect(entry.bookTitle).toBe(selectedBook);
          }
        }
      ),
      { numRuns: 200 }
    );
  });
});

describe('Property 5: Combined Filter Conjunction', () => {
  it('combined result equals intersection of text-only and book-only results', () => {
    fc.assert(
      fc.property(
        fc.array(recipeEntry, { minLength: 0, maxLength: 30 }),
        safeString,
        (recipes, query) => {
          const books = getDistinctBooks(recipes);
          const selectedBook = books.length > 0 ? books[0] : null;

          const combined = filterRecipes(recipes, query, selectedBook);
          const textOnly = filterRecipes(recipes, query, null);
          const bookOnly = filterRecipes(recipes, '', selectedBook);

          // Intersection: entries present in both individual filters
          const intersection = textOnly.filter((r) => bookOnly.includes(r));

          expect(combined).toHaveLength(intersection.length);
          expect(combined).toEqual(expect.arrayContaining(intersection));
        }
      ),
      { numRuns: 200 }
    );
  });
});

describe('Property 6: Distinct Book Extraction', () => {
  it('returns exactly the unique bookTitle values', () => {
    fc.assert(
      fc.property(
        fc.array(recipeEntry, { minLength: 0, maxLength: 30 }),
        (recipes) => {
          const result = getDistinctBooks(recipes);
          const expected = [...new Set(recipes.map((r) => r.bookTitle))].sort();

          expect(result).toEqual(expected);
        }
      ),
      { numRuns: 200 }
    );
  });

  it('has no duplicates', () => {
    fc.assert(
      fc.property(
        fc.array(recipeEntry, { minLength: 0, maxLength: 30 }),
        (recipes) => {
          const result = getDistinctBooks(recipes);
          const unique = new Set(result);
          expect(result).toHaveLength(unique.size);
        }
      ),
      { numRuns: 200 }
    );
  });
});
