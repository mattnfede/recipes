import { useState, useMemo } from 'react';
import csvText from '../data/recipes.csv?raw';
import { parseCSV } from './lib/parseCSV';
import { filterRecipes, getDistinctBooks } from './lib/filterRecipes';
import { SearchBar } from './components/SearchBar';
import { BookFilter } from './components/BookFilter';
import { RecipeList } from './components/RecipeList';
import { EmptyState } from './components/EmptyState';
import './App.css';

export function App() {
  // Parse once at mount — CSV is a static bundled asset, no async needed
  const recipes = useMemo(() => parseCSV(csvText), []);

  const [searchText, setSearchText] = useState('');
  const [selectedBook, setSelectedBook] = useState<string | null>(null);

  const books = useMemo(() => getDistinctBooks(recipes), [recipes]);

  const filtered = useMemo(
    () => filterRecipes(recipes, searchText, selectedBook),
    [recipes, searchText, selectedBook]
  );

  const hasActiveFilter = searchText.trim() !== '' || selectedBook !== null;

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="header-eyebrow">Personal collection</div>
          <h1 className="app-title">Recipe Index</h1>
          <p className="app-subtitle">
            {recipes.length} recipes across {books.length} books
          </p>
          <div className="header-divider" aria-hidden="true">
            <div className="header-divider-line" />
            <div className="header-divider-dot" />
            <div className="header-divider-dot" />
            <div className="header-divider-dot" />
            <div className="header-divider-line" />
          </div>
        </div>
      </header>

      <main className="main" id="main-content">
        <div className="controls">
          <SearchBar value={searchText} onChange={setSearchText} />
          <BookFilter books={books} selected={selectedBook} onChange={setSelectedBook} />
        </div>

        <div className="results-meta" aria-live="polite">
          {hasActiveFilter ? (
            <>
              <span className="results-count">
                {filtered.length} {filtered.length === 1 ? 'recipe' : 'recipes'}
              </span>
              {selectedBook && (
                <span className="results-qualifier">
                  {' '}in <strong>{selectedBook}</strong>
                </span>
              )}
              {searchText.trim() && (
                <span className="results-qualifier">
                  {' '}matching &ldquo;<strong>{searchText.trim()}</strong>&rdquo;
                </span>
              )}
            </>
          ) : (
            <span className="results-count">
              {filtered.length} {filtered.length === 1 ? 'recipe' : 'recipes'}
            </span>
          )}
        </div>

        {filtered.length > 0 ? (
          <RecipeList recipes={filtered} books={books} />
        ) : (
          <EmptyState />
        )}
      </main>
    </div>
  );
}
