import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { parseCSV } from './parseCSV';

/**
 * Property 1: CSV Parsing Preserves Valid Entries
 * Validates: Requirements 1.2, 1.3, 1.4
 *
 * For any valid CSV string containing rows with book_title, recipe_title,
 * page_number, and optional description columns, parsing the CSV SHALL produce
 * a RecipeEntry for each valid row with field values matching the original CSV
 * data (trimmed), and entries with empty descriptions SHALL have description
 * as undefined.
 */

// Arbitrary for non-empty strings that don't contain CSV-breaking characters
const safeString = fc
  .stringOf(
    fc.char().filter((c) => c !== ',' && c !== '\n' && c !== '\r' && c !== '"'),
    { minLength: 1 }
  )
  .map((s) => s.trim())
  .filter((s) => s.length > 0);

// Arbitrary for strings with optional leading/trailing whitespace
const paddedString = fc
  .tuple(
    fc.stringOf(fc.constant(' '), { minLength: 0, maxLength: 3 }),
    safeString,
    fc.stringOf(fc.constant(' '), { minLength: 0, maxLength: 3 })
  )
  .map(([prefix, core, suffix]) => `${prefix}${core}${suffix}`);

// Arbitrary for a positive integer page number
const pageNumber = fc.integer({ min: 1, max: 9999 });

// Arbitrary for an optional description: either a non-empty string or empty
const optionalDescription = fc.oneof(
  paddedString.map((d) => ({ raw: d, expected: d.trim() })),
  fc.constant({ raw: '', expected: undefined as string | undefined })
);

// Arbitrary for a single valid CSV row record
const validRow = fc.record({
  bookTitle: paddedString,
  recipeTitle: paddedString,
  pageNumber: pageNumber,
  description: optionalDescription,
});

// Build a CSV string from an array of row records
function buildCSV(
  rows: Array<{
    bookTitle: string;
    recipeTitle: string;
    pageNumber: number;
    description: { raw: string; expected: string | undefined };
  }>
): string {
  const header = 'book_title,recipe_title,page_number,description';
  const dataRows = rows.map(
    (row) =>
      `${row.bookTitle},${row.recipeTitle},${row.pageNumber},${row.description.raw}`
  );
  return [header, ...dataRows].join('\n');
}

describe('Property 1: CSV Parsing Preserves Valid Entries', () => {
  it('should produce a RecipeEntry for each valid row with matching trimmed values', () => {
    fc.assert(
      fc.property(
        fc.array(validRow, { minLength: 1, maxLength: 20 }),
        (rows) => {
          const csv = buildCSV(rows);
          const result = parseCSV(csv);

          // Each valid row should produce exactly one entry
          expect(result).toHaveLength(rows.length);

          // Each entry should have trimmed values matching the input
          for (let i = 0; i < rows.length; i++) {
            expect(result[i].bookTitle).toBe(rows[i].bookTitle.trim());
            expect(result[i].recipeTitle).toBe(rows[i].recipeTitle.trim());
            expect(result[i].pageNumber).toBe(rows[i].pageNumber);
          }
        }
      ),
      { numRuns: 200 }
    );
  });

  /**
   * Validates: Requirements 1.4
   */
  it('should treat empty descriptions as undefined', () => {
    fc.assert(
      fc.property(
        fc.array(validRow, { minLength: 1, maxLength: 20 }),
        (rows) => {
          const csv = buildCSV(rows);
          const result = parseCSV(csv);

          for (let i = 0; i < rows.length; i++) {
            const expectedDesc = rows[i].description.expected;
            expect(result[i].description).toBe(expectedDesc);
          }
        }
      ),
      { numRuns: 200 }
    );
  });
});
