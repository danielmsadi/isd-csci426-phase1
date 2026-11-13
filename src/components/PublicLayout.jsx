import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { ChevronDown, ArrowUpRight, Menu, X } from "lucide-react";
import Brand from "./Brand";
import { brand } from "../data/brand";
export function RouteEffects() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    document
      .querySelectorAll(
        "details.nav-dropdown[open], details.public-dropdown[open]",
      )
      .forEach((d) => (d.open = false));
    if (hash)
      requestAnimationFrame(() =>
        document.getElementById(hash.slice(1))?.scrollIntoView(),
      );
    else window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}
export default function PublicLayout() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { pathname } = useLocation();
  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  useEffect(() => {
    const close = (e) => {
      if (e.type === "keydown" && e.key !== "Escape") return;
      if (e.type === "pointerdown" && ref.current?.contains(e.target)) return;
      ref.current
        ?.querySelectorAll("details[open]")
        .forEach((d) => (d.open = false));
      if (e.type === "keydown") setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", close);
    };
  }, []);
  return (
    <div className="public-site">
      <a className="skip-link" href="#public-main">
        Skip to content
      </a>
      <header className="public-header" ref={ref}>
        <div className="public-container public-nav">
          <Brand />
          <button
            className="public-menu-button"
            aria-label="Toggle public navigation"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
          <nav aria-label="Main navigation" className={open ? "is-open" : ""}>
            <NavLink to="/" end>
              Home
            </NavLink>
            <details className="public-dropdown">
              <summary>
                Discover <ChevronDown size={13} />
              </summary>
              <div>
                <NavLink to="/about">About us</NavLink>
                <NavLink to="/schools">Schools</NavLink>
                <NavLink to="/courses">Course catalog</NavLink>
                <NavLink to="/campuses">Campuses</NavLink>
                <NavLink to="/contact">Contact</NavLink>
              </div>
            </details>
            <NavLink to="/programs">Programs</NavLink>
            <details className="public-dropdown">
              <summary>
                Admissions <ChevronDown size={13} />
              </summary>
              <div>
                <NavLink to="/admissions">How to apply</NavLink>
                <NavLink to="/tuition">Tuition & fees</NavLink>
                <NavLink to="/#faq" onClick={() => setOpen(false)}>
                  Common questions
                </NavLink>
              </div>
            </details>
            <Link className="portal-entry" to="/login">
              Student portal <ArrowUpRight size={15} />
            </Link>
          </nav>
        </div>
      </header>
      <main id="public-main" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="public-footer">
        <div className="public-container">
          <div className="footer-top">
            <div>
              <Brand compact />
              <p>
                {brand.tagline}
                <br />
                Find your path. Plan your next chapter.
              </p>
            </div>
            <div>
              <b>Explore</b>
              <Link to="/programs">Programs</Link>
              <Link to="/schools">Schools</Link>
              <Link to="/campuses">Campuses</Link>
            </div>
            <div>
              <b>Plan your journey</b>
              <Link to="/admissions">Admissions</Link>
              <Link to="/tuition">Tuition & fees</Link>
              <Link to="/contact">Contact us</Link>
            </div>
            <div>
              <b>University services</b>
              <Link to="/policies">Registration policies</Link>
              <Link to="/login">Student services</Link>
              <Link to="/contact">Get in touch</Link>
            </div>
          </div>
          <div className="footer-bottom">
            <span>{brand.name} · Independent university guide</span>
            <span>
              <Link to="/contact">Contact & support</Link>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
