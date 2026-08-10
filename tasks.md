# Implementation Plan: Recipe Book Index

## Overview

Incrementally build a static React + TypeScript application that loads recipe data from a bundled CSV file and provides instant client-side search and filtering. Tasks progress from project scaffolding → data types → parsing logic → filter engine → UI components → wiring everything together → CI/CD deployment → user guide for adding new books via AI-assisted index photo extraction.

## Tasks

- [x] 1. Set up project structure and configuration
  - [x] 1.1 Initialize Vite + React + TypeScript project
    - Create `package.json` with dependencies: react, react-dom, papaparse, and dev dependencies: vite, @vitejs/plugin-react, typescript, vitest, fast-check, @types/react, @types/react-dom, @testing-library/react, @testing-library/jest-dom, jsdom
    - Create `vite.config.ts` with React plugin and test configuration (vitest with jsdom environment)
    - Create `tsconfig.json` with strict mode, JSX support, and path resolution
    - Create `index.html` entry point referencing `src/main.tsx`
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 1.2 Create data types and sample CSV
    - Create `src/types/recipe.ts` with the `RecipeEntry` interface (`bookTitle: string`, `recipeTitle: string`, `pageNumber: number`, `description?: string`)
    - Create `data/recipes.csv` with sample entries covering multiple books, with and without descriptions
    - Add a Vite type declaration for `*.csv?raw` imports
    - _Requirements: 1.3, 1.4_

- [x] 2. Implement CSV parsing logic
  - [x] 2.1 Implement `parseCSV` function
    - Create `src/lib/parseCSV.ts`
    - Use PapaParse with `header: true` and `skipEmptyLines: true`
    - Map CSV columns (`book_title`, `recipe_title`, `page_number`, `description`) to camelCase `RecipeEntry` fields
    - Skip rows missing required fields or with non-integer `page_number`
    - Trim all string values; treat empty description as `undefined`
    - _Requirements: 1.2, 1.3, 1.4, 1.5_

  - [x] 2.2 Write property test: CSV Parsing Preserves Valid Entries
    - **Property 1: CSV Parsing Preserves Valid Entries**
    - Generate arbitrary valid CSV strings with `book_title`, `recipe_title`, `page_number`, and optional `description` columns using fast-check arbitraries
    - Assert that each valid row produces a `RecipeEntry` with matching trimmed values
    - Assert that entries with empty descriptions have `description` as `undefined`
    - **Validates: Requirements 1.2, 1.3, 1.4**

  - [ ]* 2.3 Write property test: Malformed Row Resilience
    - **Property 2: Malformed Row Resilience**
    - Generate CSV strings with a mix of valid and malformed rows (missing required fields, non-integer page numbers)
    - Assert that the result count equals the count of valid rows only
    - Assert no malformed row data appears in the output
    - **Validates: Requirements 1.5**

- [x] 3. Implement filter engine
  - [x] 3.1 Implement `filterRecipes` and `getDistinctBooks` functions
    - Create `src/lib/filterRecipes.ts`
    - Implement `filterRecipes(recipes, searchText, selectedBook)` as a pure function applying both filters as conjunction
    - Implement `getDistinctBooks(recipes)` returning sorted unique book titles
    - _Requirements: 3.2, 3.4, 4.2, 4.4, 5.1_

  - [ ]* 3.2 Write property test: Text Search Correctness
    - **Property 3: Text Search Correctness**
    - Generate arbitrary recipe lists and non-empty search strings
    - Assert all returned entries contain the search string (case-insensitive) in `recipeTitle` or `description`
    - Assert no entry containing the search string is excluded from results
    - **Validates: Requirements 3.2, 3.4**

  - [ ]* 3.3 Write property test: Book Filter Correctness
    - **Property 4: Book Filter Correctness**
    - Generate arbitrary recipe lists; select a book title that exists in the list
    - Assert all returned entries have `bookTitle` matching the selected value exactly
    - **Validates: Requirements 4.4**

  - [ ]* 3.4 Write property test: Combined Filter Conjunction
    - **Property 5: Combined Filter Conjunction**
    - Generate arbitrary recipe lists, a search string, and a book selection
    - Assert the combined filter result equals the intersection of applying text search alone and book filter alone
    - **Validates: Requirements 5.1**

  - [ ]* 3.5 Write property test: Distinct Book Extraction
    - **Property 6: Distinct Book Extraction**
    - Generate arbitrary recipe lists
    - Assert `getDistinctBooks` returns exactly the unique `bookTitle` values with no duplicates and no missing values
    - **Validates: Requirements 4.2**

- [~] 4. Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implement UI components
  - [~] 5.1 Create `SearchBar` component
    - Create `src/components/SearchBar.tsx`
    - Controlled text input with placeholder text
    - Calls `onChange` callback on every keystroke passing the current value
    - _Requirements: 3.1, 3.3_

  - [~] 5.2 Create `BookFilter` component
    - Create `src/components/BookFilter.tsx`
    - Dropdown `<select>` element populated from `getDistinctBooks()` output
    - Include a leading "All Books" option with value representing `null`
    - Calls `onChange` callback with the selected book or `null`
    - _Requirements: 4.1, 4.2, 4.3_

  - [~] 5.3 Create `RecipeCard` and `RecipeList` components
    - Create `src/components/RecipeCard.tsx` displaying book title, recipe title, page number, and optional description
    - Create `src/components/RecipeList.tsx` that maps a filtered `RecipeEntry[]` array to `RecipeCard` components
    - _Requirements: 2.2, 2.3, 2.4_

  - [~] 5.4 Create `EmptyState` component
    - Create `src/components/EmptyState.tsx` displaying a friendly "No recipes found" message
    - _Requirements: 5.2_

- [ ] 6. Wire everything together in App
  - [~] 6.1 Implement `App` component with state management
    - Create `src/App.tsx` that imports `recipes.csv?raw` and calls `parseCSV` on mount
    - Store full recipe list in state via `useState`
    - Store `searchText` and `selectedBook` in state
    - Compute filtered recipes with `useMemo` using `filterRecipes`
    - Render `SearchBar`, `BookFilter`, and conditionally `RecipeList` or `EmptyState`
    - _Requirements: 1.1, 1.2, 2.1, 3.5, 4.5, 5.1, 5.2_

  - [~] 6.2 Create `main.tsx` entry point and styles
    - Create `src/main.tsx` rendering `App` into the root DOM element
    - Create `src/App.css` with clean, readable layout styles for the recipe list
    - _Requirements: 2.4, 6.1, 6.2_

- [x] 7. Set up GitHub Pages CI/CD deployment
  - [x] 7.1 Create GitHub Actions workflow for GitHub Pages
    - Create `.github/workflows/deploy.yml` at the repository root
    - Use the `actions/checkout`, `actions/setup-node`, `actions/upload-pages-artifact`, and `actions/deploy-pages` actions
    - Install dependencies with `npm ci`
    - Run the Vite build with `npm run build`
    - Upload `dist/` as the Pages artifact
    - Configure the job to run only on pushes to the default branch (`main`)
    - Grant the workflow `pages: write` and `id-token: write` permissions
    - Ensure `vite.config.ts` sets the correct `base` path for GitHub Pages (typically `/<repo-name>/`)
    - _Requirements: 6.2_

- [x] 8. Write user guide for adding recipes via AI-assisted index photo extraction
  - [x] 8.1 Create `GUIDE.md` at the repository root
    - Write a detailed markdown guide covering the full workflow for converting a physical book's index page into CSV rows using AI image recognition
    - **Section: Taking a Good Photo of the Index Page** — tips on lighting (even, natural light preferred), angle (flat/overhead to avoid distortion), clarity (ensure text is sharp and fully in frame), and avoiding glare or shadows on the page
    - **Section: Choosing an AI Tool** — recommend tools that support image input (ChatGPT with GPT-4o, Claude with vision, Google Gemini, etc.) and briefly note how to upload an image in each
    - **Section: Prompt Template** — provide a ready-to-copy prompt: "Here's a photo of a recipe book index. Extract the recipe names and page numbers. Format them as CSV rows with these columns: book_title, recipe_title, page_number, description. The book title is [BOOK NAME]. Leave description empty unless the index provides additional context."
    - **Section: Expected CSV Format** — document the column order (`book_title,recipe_title,page_number,description`), quoting rules (quote fields containing commas or special characters, UTF-8 encoding), and show an example of well-formed output rows
    - **Section: Appending to the CSV File** — explain how to open `data/recipes.csv`, paste the AI output at the end (without repeating the header row), and verify the result looks correct
    - **Section: Rebuilding and Redeploying** — explain that pushing to `main` triggers the GitHub Actions CI pipeline automatically; optionally run `npm run build` locally to verify before pushing
    - _Requirements: 1.3_

- [~] 9. Final checkpoint
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The CSV file is imported at build time via Vite's `?raw` suffix — no runtime fetch needed
- The GitHub Actions workflow builds the Vite app and deploys static output to GitHub Pages automatically on push to `main`
- Task 8 produces a contributor-facing guide (`GUIDE.md`) that documents the workflow for adding new books to the index using AI photo extraction — this is a documentation-only task with no application code changes

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2"] },
    { "id": 2, "tasks": ["2.1", "3.1"] },
    { "id": 3, "tasks": ["2.2", "2.3", "3.2", "3.3", "3.4", "3.5"] },
    { "id": 4, "tasks": ["5.1", "5.2", "5.3", "5.4"] },
    { "id": 5, "tasks": ["6.1"] },
    { "id": 6, "tasks": ["6.2", "7.1", "8.1"] }
  ]
}
```
