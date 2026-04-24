export function BrandLogo({ footer = false }) {
  return (
    <span className={`brand-lockup ${footer ? "brand-lockup-footer" : ""}`}>
      <span className="brand-mark">Romanketing</span>
    </span>
  );
}
