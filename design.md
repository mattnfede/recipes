# Design Document

## Overview

A lightweight, static single-page application built with Vite and React that loads recipe data from a bundled CSV file and provides instant client-side search and filtering. The architecture is intentionally simple: CSV → parse → in-memory array → filter → render.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│  Build Time (Vite)                                  │
│  ┌───────────┐       ┌──────────────────┐          │
│  │ recipes.csv│──────▶│ Static asset bundle│         │
│  └───────────┘       └──────────────────┘          │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  Runtime (Browser)                                  │
│                                                     │
│  ┌──────────┐    ┌──────────┐    ┌──────────────┐  │
│  │ CSV Parse │───▶│ Store    │───▶│ Filter Engine│  │
│  └──────────┘    │(recipes[])│    └──────┬───────┘  │
│                  └──────────┘           │           │
│                                         ▼           │
│  ┌──────────────┐              ┌──────────────┐    │
│  │ Search Input  │─────────────▶│ Recipe List  │    │
│  │ Book Dropdown │─────────────▶│ (filtered)   │    │
│  └──────────────┘              └──────────────┘    │
└─────────────────────────────────────────────────────┘
```

## Technology Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Build tool | Vite | Fast HMR, zero-config for React |
| Framework | React | Widely known, simple component model |
| Language | TypeScript | Type safety for data structures |
| CSV parsing | PapaParse | Battle-tested CSV parser, handles edge cases |
| Styling | CSS Modules or plain CSS | Minimal overhead, no extra dependencies |
| Testing | Vitest + fast-check | Vite-native test runner with property-based testing |

## Components

### Data Layer

#### `RecipeEntry` (Type)

```typescript
interface RecipeEntry {
  bookTitle: string;
  recipeTitle: string;
  pageNumber: number;
  description?: string;
}
```

#### `parseCSV(csvText: string): RecipeEntry[]`

Parses raw CSV text into an array of `RecipeEntry` objects.

- Uses PapaParse with `header: true` for column-name access
- Maps CSV column names (`book_title`, `recipe_title`, `page_number`, `description`) to camelCase fields
- Skips rows missing required fields (`book_title`, `recipe_title`, `page_number`)
- Treats empty `description` as `undefined`
- Coerces `page_number` to a number; skips row if not a valid integer

```typescript
import Papa from 'papaparse';

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
```

### Filter Engine

#### `filterRecipes(recipes: RecipeEntry[], searchText: string, selectedBook: string | null): RecipeEntry[]`

Pure function that applies both search and book filters.

- If `selectedBook` is non-null (and not the "all" sentinel), keeps only entries where `bookTitle === selectedBook`
- If `searchText` is non-empty, keeps only entries where `recipeTitle` or `description` contains `searchText` (case-insensitive)
- Returns the intersection of both filters

```typescript
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
```

#### `getDistinctBooks(recipes: RecipeEntry[]): string[]`

Extracts sorted unique book titles from the recipe list.

```typescript
export function getDistinctBooks(recipes: RecipeEntry[]): string[] {
  const books = new Set(recipes.map((r) => r.bookTitle));
  return Array.from(books).sort();
}
```

### UI Components

#### `App`

Root component. On mount, imports the CSV asset text and calls `parseCSV`. Stores the full recipe list in state.

#### `SearchBar`

Controlled text input. Calls `onChange` handler on every keystroke, passing the current value up to `App`.

#### `BookFilter`

Dropdown `<select>` element. Options populated from `getDistinctBooks()` output plus a leading "All Books" option with value `null`.

#### `RecipeList`

Receives the filtered array. Maps each `RecipeEntry` to a `RecipeCard`.

#### `RecipeCard`

Displays a single entry: book title, recipe title, page number, and description (if present).

#### `EmptyState`

Shown when the filtered list is empty. Displays a friendly "No recipes found" message.

## Data Flow

1. **Build time**: Vite bundles `recipes.csv` as a raw text asset (`?raw` import).
2. **App mount**: `App` imports the raw CSV string, calls `parseCSV()`, stores result in `recipes` state.
3. **User interaction**: `searchText` and `selectedBook` state updated on input/change events.
4. **Render**: `filterRecipes(recipes, searchText, selectedBook)` computed on each render (or via `useMemo`). Result passed to `RecipeList`.
5. **Empty results**: If filtered list length is 0, render `EmptyState` instead.

## CSV Import Strategy

The CSV file is imported using Vite's raw asset import:

```typescript
import csvText from '../data/recipes.csv?raw';
```

This embeds the CSV content as a string in the JS bundle at build time. No runtime fetch is needed.

## File Structure

```
recipes/
├── data/
│   └── recipes.csv
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── components/
│   │   ├── SearchBar.tsx
│   │   ├── BookFilter.tsx
│   │   ├── RecipeList.tsx
│   │   ├── RecipeCard.tsx
│   │   └── EmptyState.tsx
│   ├── lib/
│   │   ├── parseCSV.ts
│   │   └── filterRecipes.ts
│   ├── types/
│   │   └── recipe.ts
│   └── App.css
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Error Handling

| Scenario | Behavior |
|----------|----------|
| Malformed CSV row (missing required fields) | Row skipped silently; valid rows still loaded |
| `page_number` not a valid integer | Row skipped |
| Empty CSV file | App renders empty state with no recipes |
| Empty description field | Entry rendered without description section |

## Performance Considerations

- The CSV is expected to be small (hundreds of entries at most for a personal collection). No virtualization or pagination needed.
- `filterRecipes` is a simple O(n) scan. With <1000 entries, this runs in microseconds per keystroke.
- `useMemo` with `[recipes, searchText, selectedBook]` dependencies avoids unnecessary re-filtering.

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: CSV Parsing Preserves Valid Entries

*For any* valid CSV string containing rows with `book_title`, `recipe_title`, `page_number`, and optional `description` columns, parsing the CSV SHALL produce a `RecipeEntry` for each valid row with field values matching the original CSV data (trimmed), and entries with empty descriptions SHALL have `description` as `undefined`.

**Validates: Requirements 1.2, 1.3, 1.4**

### Property 2: Malformed Row Resilience

*For any* CSV string containing a mix of valid and malformed rows (missing required fields or non-integer page numbers), parsing SHALL return exactly the valid rows and exclude all malformed rows.

**Validates: Requirements 1.5**

### Property 3: Text Search Correctness

*For any* recipe list and any non-empty search string, `filterRecipes` with that search string SHALL return only entries where `recipeTitle` or `description` contains the search string as a case-insensitive substring, and SHALL not exclude any entry that does contain the search string.

**Validates: Requirements 3.2, 3.4**

### Property 4: Book Filter Correctness

*For any* recipe list and any selected book title that exists in the list, `filterRecipes` with that book selection SHALL return only entries whose `bookTitle` matches the selected value exactly.

**Validates: Requirements 4.4**

### Property 5: Combined Filter Conjunction

*For any* recipe list, search string, and book selection applied simultaneously, the result of `filterRecipes` SHALL equal the intersection of applying the text search alone and the book filter alone—i.e., every result satisfies both conditions, and no entry satisfying both conditions is excluded.

**Validates: Requirements 5.1**

### Property 6: Distinct Book Extraction

*For any* recipe list, `getDistinctBooks` SHALL return a set of strings equal to the unique `bookTitle` values present in the input, with no duplicates and no missing values.

**Validates: Requirements 4.2**
