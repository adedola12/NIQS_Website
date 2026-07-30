/**
 * Loading placeholders.
 *
 * 18 public pages gate their content behind `{!loading && …}`, so a section is
 * absent until data arrives and then appears at full height. The page jumps, and
 * anyone who had started reading loses their place. These hold the space at
 * roughly the right shape instead.
 *
 * Pure CSS — the shimmer animates background-position, so it stays on the
 * compositor and adds no JavaScript beyond these few elements. Styles live in
 * index.css under `.sk*`, including the reduced-motion treatment that replaces
 * the shimmer with a flat fill.
 *
 * `aria-hidden` throughout: a screen reader should hear the live region announce
 * "loading", not a description of grey rectangles. Wrap usage in whatever status
 * element the page already has.
 */

/** A single card: image area above, title and two text lines below. */
export function SkeletonCard({ media = 'img' }) {
  return (
    <div className="sk-card" aria-hidden="true">
      <div className={`sk ${media === 'avatar' ? 'sk-avatar' : 'sk-img'}`} style={{ borderRadius: 0 }} />
      <div className="sk-card-body">
        <div className="sk sk-title" />
        <div className="sk sk-line w90" />
        <div className="sk sk-line w60" />
      </div>
    </div>
  );
}

/**
 * A grid of cards. `count` should match the page's usual result count closely
 * enough that the layout does not jump when real data replaces it — matching the
 * grid's column count times two is usually right.
 */
export function SkeletonGrid({ count = 6, media = 'img', className = '' }) {
  return (
    <div className={className} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} media={media} />
      ))}
    </div>
  );
}

/** Loose paragraph lines, for prose sections rather than cards. */
export function SkeletonText({ lines = 3, title = false }) {
  const widths = ['w90', 'w75', 'w60'];
  return (
    <div aria-hidden="true">
      {title && <div className="sk sk-title" />}
      {Array.from({ length: lines }, (_, i) => (
        <div key={i} className={`sk sk-line ${widths[i % widths.length]}`} />
      ))}
    </div>
  );
}

export default SkeletonCard;
