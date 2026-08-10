export function EmptyState() {
  return (
    <div className="empty-state" role="status" aria-live="polite">
      <div className="empty-icon" aria-hidden="true">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
          <line x1="8" y1="11" x2="14" y2="11" />
        </svg>
      </div>
      <h2 className="empty-title">No recipes found</h2>
      <p className="empty-body">Try a different search term or select a different book.</p>
    </div>
  );
}
