export default function Loading() {
  return (
    <div
      className="shell loading-page"
      role="status"
      aria-label="Loading / 読み込み中 / 加载中"
    >
      <div className="skeleton skeleton-line" />
      <div className="skeleton skeleton-title" />
      <div className="skeleton-layout">
        <div className="skeleton" />
        <div className="skeleton" />
      </div>
    </div>
  );
}
