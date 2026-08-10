import { RecipeEntry } from '@/types/recipe';

// Warm vintage palette — each book gets a consistent mid-century colour
const BOOK_COLORS: { bg: string; text: string; border: string }[] = [
  { bg: '#FAE5D0', text: '#8B3A1A', border: '#C25B33' }, // burnt sienna / terracotta
  { bg: '#EDF2D8', text: '#4A5A20', border: '#74843E' }, // avocado green
  { bg: '#FDF3D0', text: '#8B6914', border: '#DDA428' }, // harvest gold
  { bg: '#D8EAE9', text: '#255856', border: '#3E8C89' }, // turquoise (rare)
  { bg: '#F5E8D5', text: '#6B3A1E', border: '#A05A30' }, // warm chestnut
  { bg: '#E8DDD0', text: '#4A3424', border: '#7A5A40' }, // teak brown
];

interface RecipeCardProps {
  entry: RecipeEntry;
  bookIndex: number;
}

export function RecipeCard({ entry, bookIndex }: RecipeCardProps) {
  const color = BOOK_COLORS[bookIndex % BOOK_COLORS.length];

  return (
    <article className="recipe-card">
      <div className="recipe-card-top">
        <span
          className="book-badge"
          style={{
            backgroundColor: color.bg,
            color: color.text,
            borderColor: color.border,
          }}
        >
          {entry.bookTitle}
        </span>
        <span className="page-badge">p.&nbsp;{entry.pageNumber}</span>
      </div>
      <h2 className="recipe-title">{entry.recipeTitle}</h2>
      {entry.description && (
        <p className="recipe-description">{entry.description}</p>
      )}
    </article>
  );
}
