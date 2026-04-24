import logoImage from "../assets/romanketing-isologo.png";

export function BrandLogo({ footer = false }) {
  return (
    <span className={`brand-lockup ${footer ? "brand-lockup-footer" : ""}`}>
      <img
        alt="Romanketing"
        className={`brand-logo ${footer ? "brand-logo-footer" : ""}`}
        src={logoImage}
      />
      <span className="brand-mark">Romanketing</span>
    </span>
  );
}
