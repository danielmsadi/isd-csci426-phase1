import { Link } from "react-router-dom";
import { brand } from "../data/brand";
export default function Brand({ to = "/", compact = false }) {
  return (
    <Link
      className={`brand identity ${compact ? "compact" : ""}`}
      to={to}
      aria-label={`${brand.name} home`}
    >
      {brand.logo ? (
        <img className="identity-mark" src={brand.logo} alt="" />
      ) : (
        <svg className="identity-mark" viewBox="0 0 52 60" aria-hidden="true">
          <path
            d="M2 2h48v34c0 11-24 22-24 22S2 47 2 36Z"
            fill="currentColor"
          />
          <path
            d="m26 10-8 9h5l-10 9h9l-12 9h14v7h4v-7h14L30 28h9l-10-9h5Z"
            fill="#fff"
          />
          <path
            d="M11 44c7-2 10-1 15 2 5-3 8-4 15-2"
            fill="none"
            stroke="#c5aa76"
            strokeWidth="2"
          />
        </svg>
      )}
      <span>
        <b>
          {brand.shortName}
          <span className="brand-period">.</span>
        </b>
        <small>{compact ? "UNIVERSITY SERVICES" : brand.tagline}</small>
      </span>
    </Link>
  );
}
