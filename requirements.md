# Requirements Document

## Introduction

A static, client-side web application that serves as a personal curated index of recipes from physical recipe books. The application loads recipe data from a CSV file bundled at build time, provides instant text search across recipe titles and descriptions, and supports filtering by book. This is Phase 1 — a lightweight personal tool with no backend or database.

## Glossary

- **App**: The static client-side web application for browsing the recipe index
- **Recipe_Index**: The in-memory data structure holding all parsed recipe entries from the CSV file
- **CSV_File**: A comma-separated values file committed to the repository containing recipe data, exportable from Google Sheets
- **Search_Input**: The text field where the user types search queries to filter recipes
- **Book_Filter**: A dropdown control that allows the user to scope visible recipes to a single book
- **Recipe_Entry**: A single row from the CSV file representing one recipe, containing book title, recipe title, page number, and an optional description
- **Build_Process**: The Vite-based build pipeline that bundles the CSV file as a static asset

## Requirements

### Requirement 1: CSV Data Loading

**User Story:** As a user, I want the app to load my recipe data from a CSV file so that I can maintain the data easily via Google Sheets export.

#### Acceptance Criteria

1. THE Build_Process SHALL bundle the CSV_File as a static asset during the build step.
2. WHEN the App loads in the browser, THE App SHALL parse the bundled CSV_File into the Recipe_Index.
3. THE CSV_File SHALL contain the following columns: book_title, recipe_title, page_number, and description.
4. WHEN a Recipe_Entry has an empty description field, THE App SHALL treat the description as optional and display the entry without a description.
5. IF the CSV_File contains malformed rows, THEN THE App SHALL skip the malformed rows and load all valid Recipe_Entry records.

### Requirement 2: Recipe Display

**User Story:** As a user, I want to see all my recipes listed so that I can browse which book has which recipe and on what page.

#### Acceptance Criteria

1. WHEN the App finishes loading the Recipe_Index, THE App SHALL display all Recipe_Entry records in a list.
2. THE App SHALL display the book_title, recipe_title, and page_number for each Recipe_Entry.
3. WHEN a Recipe_Entry has a description value, THE App SHALL display the description alongside the other fields.
4. THE App SHALL present Recipe_Entry records in a readable, scannable layout.

### Requirement 3: Instant Text Search

**User Story:** As a user, I want to search across recipe titles and descriptions as I type so that I can quickly find the recipe I'm looking for.

#### Acceptance Criteria

1. THE App SHALL provide a Search_Input text field.
2. WHEN the user types into the Search_Input, THE App SHALL filter the displayed Recipe_Entry records to those whose recipe_title or description contains the typed text.
3. THE App SHALL perform filtering on each keystroke without requiring a submit action.
4. THE App SHALL perform case-insensitive matching when filtering Recipe_Entry records.
5. WHEN the Search_Input is empty, THE App SHALL display all Recipe_Entry records (subject to the Book_Filter selection).

### Requirement 4: Book Filter

**User Story:** As a user, I want to filter recipes by book so that I can see only recipes from a specific physical book.

#### Acceptance Criteria

1. THE App SHALL provide a Book_Filter dropdown control.
2. THE App SHALL populate the Book_Filter dropdown with the distinct book_title values from the Recipe_Index.
3. THE App SHALL include an "All Books" option in the Book_Filter dropdown that shows recipes from every book.
4. WHEN the user selects a specific book_title from the Book_Filter, THE App SHALL display only Recipe_Entry records with a matching book_title.
5. WHEN the user selects "All Books" from the Book_Filter, THE App SHALL display all Recipe_Entry records (subject to the Search_Input filter).

### Requirement 5: Combined Filtering

**User Story:** As a user, I want the search and book filter to work together so that I can narrow results by both text and book simultaneously.

#### Acceptance Criteria

1. WHEN both the Search_Input contains text and the Book_Filter has a specific book selected, THE App SHALL display only Recipe_Entry records that match both the text search and the selected book_title.
2. WHEN no Recipe_Entry records match the active filters, THE App SHALL display a message indicating no results were found.

### Requirement 6: Static Deployment

**User Story:** As a user, I want the app to work as a static site with no backend so that it is simple to host and maintain.

#### Acceptance Criteria

1. THE App SHALL operate entirely client-side with no server-side processing or database dependencies.
2. THE Build_Process SHALL produce static assets (HTML, CSS, JavaScript) suitable for deployment to any static hosting provider.
3. THE App SHALL use a Vite-based lightweight JavaScript framework for the frontend build pipeline.
