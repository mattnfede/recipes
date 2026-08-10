import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { parseCSV } from './parseCSV';

/**
 * Property 2: Malformed Row Resilience
 * Validates: Requirement 1.5
 *
 * For any CSV containing a mix of valid and malformed rows, parseCSV SHALL
 * return exactly the valid rows and exclude all malformed ones.
 */

const safeString = fc
  .stringOf(
    fc.char().filter((c) => c !== ',' && c !== '\n' && c !== '\r' && c !== '"'),
    { minLength: 1 }
  )
  .map((s) => s.trim())
  .filter((s) => s.length > 0);

const validRow = fc.record({
  book_title: safeString,
  recipe_title: safeString,
  page_number: fc.integer({ min: 1, max: 9999 }).map(String),
  description: fc.oneof(safeString, fc.constant('')),
});

// Malformed: missing book_title
const missingBookTitle = validRow.map((r) => ({ ...r, book_title: '' }));
// Malformed: missing recipe_title
const missingRecipeTitle = validRow.map((r) => ({ ...r, recipe_title: '' }));
// Malformed: non-integer page_number
const badPageNumber = validRow.map((r) => ({ ...r, page_number: 'abc' }));
// Malformed: missing page_number
const missingPageNumber = validRow.map((r) => ({ ...r, page_number: '' }));

const malformedRow = fc.oneof(
  missingBookTitle,
  missingRecipeTitle,
  badPageNumber,
  missingPageNumber
);

type Row = { book_title: string; recipe_title: string; page_number: string; description: string };

function buildCSV(rows: Row[]): string {
  const header = 'book_title,recipe_title,page_number,description';
  const dataRows = rows.map(
    (r) => `${r.book_title},${r.recipe_title},${r.page_number},${r.description}`
  );
  return [header, ...dataRows].join('\n');
}

describe('Property 2: Malformed Row Resilience', () => {
  it('result count equals valid row count only', () => {
    fc.assert(
      fc.property(
        fc.array(fc.oneof(validRow, malformedRow), { minLength: 1, maxLength: 30 }),
        (rows) => {
          const validCount = rows.filter(
            (r) =>
              r.book_title.trim() !== '' &&
              r.recipe_title.trim() !== '' &&
              r.page_number.trim() !== '' &&
              !isNaN(parseInt(r.page_number, 10))
          ).length;

          const csv = buildCSV(rows);
          const result = parseCSV(csv);

          expect(result).toHaveLength(validCount);
        }
      ),
      { numRuns: 200 }
    );
  });

  it('no malformed row data appears in output', () => {
    fc.assert(
      fc.property(
        fc.array(malformedRow, { minLength: 1, maxLength: 20 }),
        (rows) => {
          const csv = buildCSV(rows);
          const result = parseCSV(csv);
          expect(result).toHaveLength(0);
        }
      ),
      { numRuns: 200 }
    );
  });
});
