import { useState } from "react";
import {
  ArrowUpRight,
  BookOpen,
  Cpu,
  BriefcaseBusiness,
  FlaskConical,
  GraduationCap,
  Pill,
  ExternalLink,
} from "lucide-react";
import { Link } from "react-router-dom";
import { photos, schoolName } from "../data/university";
export const schoolIcons = {
  engineering: Cpu,
  business: BriefcaseBusiness,
  "arts-sciences": FlaskConical,
  education: GraduationCap,
  pharmacy: Pill,
  freshman: BookOpen,
};
export function SectionHeading({ eyebrow, title, children, action }) {
  return (
    <div className="public-section-heading">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h2>{title}</h2>
        {children && <p>{children}</p>}
      </div>
      {action}
    </div>
  );
}
export function CampusGraphic() {
  return (
    <svg
      viewBox="0 0 600 420"
      className="campus-graphic"
      role="img"
      aria-label="Illustration of an academic courtyard"
    >
      <circle cx="440" cy="100" r="48" fill="#d5bd8a" />
      <path d="M0 345 600 300v120H0Z" fill="#b9cbbf" />
      <path d="m160 390 140-90 150 120H110Z" fill="#e8e4d9" />
      <path d="M60 140h220v205H60ZM310 180h230v145H310Z" fill="#f5f1e7" />
      <path d="M45 140 170 75l125 65ZM295 180l130-65 130 65Z" fill="#254c61" />
      {[85, 130, 175, 220].map((x) => (
        <g key={x}>
          {[165, 220, 275].map((y) => (
            <rect
              key={y}
              x={x}
              y={y}
              width="25"
              height="35"
              rx="12"
              fill="#4f727c"
            />
          ))}
        </g>
      ))}
      {[340, 385, 430, 475].map((x) => (
        <g key={x}>
          {[200, 250].map((y) => (
            <rect key={y} x={x} y={y} width="25" height="30" fill="#4f727c" />
          ))}
        </g>
      ))}
      <path d="M18 355v-90m550 70v-100" stroke="#546e54" strokeWidth="7" />
      <circle cx="18" cy="258" r="35" fill="#637d63" />
      <circle cx="550" cy="230" r="42" fill="#637d63" />
    </svg>
  );
}
export function Photo({ kind = "campus", className = "", eager = false }) {
  const [failed, setFailed] = useState(false);
  const photo = photos[kind];
  return (
    <figure className={`editorial-photo ${className}`}>
      {failed ? (
        <CampusGraphic />
      ) : (
        <img
          src={photo.url}
          alt={photo.alt}
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "high" : "auto"}
          onError={() => setFailed(true)}
        />
      )}
      <figcaption>
        {failed
          ? "Learning, imagined."
          : "Campus life · illustrative photography"}
      </figcaption>
    </figure>
  );
}
export function ProgramCard({ program }) {
  const Icon = schoolIcons[program.school];
  return (
    <Link className="program-card" to={`/programs/${program.id}`}>
      <div className="program-card-meta">
        <span>{program.level}</span>
        <Icon size={21} />
      </div>
      <h3>{program.name}</h3>
      <p>{schoolName(program.school)}</p>
      <div className="program-card-bottom">
        <span>
          {program.credits == null
            ? "Information not yet available"
            : `${program.school === "freshman" ? "Minimum " : ""}${program.credits} credits`}
        </span>
        <span className="round-arrow">
          <ArrowUpRight size={17} />
        </span>
      </div>
    </Link>
  );
}
export function PublicHero({ eyebrow, title, children }) {
  return (
    <section className="public-inner-hero">
      <div className="public-container">
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{children}</p>
      </div>
      <span className="hero-orbit" aria-hidden="true" />
    </section>
  );
}
