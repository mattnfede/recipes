import { RecipeEntry } from '@/types/recipe';
import { RecipeCard } from './RecipeCard';

interface RecipeListProps {
  recipes: RecipeEntry[];
  books: string[];
}

export function RecipeList({ recipes, books }: RecipeListProps) {
  return (
    <ul className="recipe-list" role="list">
      {recipes.map((entry) => (
        <li key={`${entry.bookTitle}::${entry.recipeTitle}::${entry.pageNumber}`}>
          <RecipeCard entry={entry} bookIndex={books.indexOf(entry.bookTitle)} />
        </li>
      ))}
    </ul>
  );
}
