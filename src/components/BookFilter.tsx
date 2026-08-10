interface BookFilterProps {
  books: string[];
  selected: string | null;
  onChange: (book: string | null) => void;
}

export function BookFilter({ books, selected, onChange }: BookFilterProps) {
  return (
    <div className="book-filter">
      <svg
        className="book-filter-icon"
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
      <select
        id="book-filter-select"
        className="book-filter-select"
        value={selected ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
        aria-label="Filter by book"
      >
        <option value="">All Books</option>
        {books.map((book) => (
          <option key={book} value={book}>
            {book}
          </option>
        ))}
      </select>
      <svg
        className="book-filter-chevron"
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  );
}
