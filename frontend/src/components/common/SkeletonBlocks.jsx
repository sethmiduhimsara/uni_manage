import "./skeleton-blocks.css";

function SkeletonBlocks({ rows = 3, columns = 1, compact = false }) {
  return (
    <div
      className={`skeleton-grid ${compact ? "compact" : ""}`}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      aria-hidden="true"
    >
      {Array.from({ length: rows * columns }).map((_, index) => (
        <span key={index} className="skeleton-block" />
      ))}
    </div>
  );
}

export default SkeletonBlocks;
