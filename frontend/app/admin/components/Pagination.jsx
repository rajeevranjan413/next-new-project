import s from '../admin.module.css';

// Prev / page-info / Next control. Renders nothing when there's only one page.
// `onPage` receives the next page number.
export function Pagination({ page, pages, onPage }) {
  if (pages <= 1) return null;
  return (
    <div className={s.pagination}>
      <button className={s.pageBtn} onClick={() => onPage(Math.max(1, page - 1))} disabled={page === 1}>← Prev</button>
      <span className={s.pageInfo}>Page {page} of {pages}</span>
      <button className={s.pageBtn} onClick={() => onPage(Math.min(pages, page + 1))} disabled={page === pages}>Next →</button>
    </div>
  );
}
