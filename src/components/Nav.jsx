import { NavLink, useLocation } from "react-router-dom";
import { contacts } from "../data/siteData.js";

export default function Nav({ visible }) {
  const { pathname } = useLocation();

  const handleHomeClick = (e) => {
    if (pathname === "/") {
      // Already on home — scroll to top instead of navigating
      e.preventDefault();
      if (window.__kzLenis) {
        window.__kzLenis.scrollTo(0);
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else {
      // Explicit nav click — clear saved position so the page starts fresh at top
      sessionStorage.removeItem("kz-home-scroll");
    }
  };

  return (
    <header className={`nav-shell ${visible ? "is-visible" : ""}`}>
      <nav aria-label="Primary navigation">
        <NavLink to="/" end onClick={handleHomeClick}>Home</NavLink>
        <NavLink to="/experience">Experience</NavLink>
        <NavLink to="/projects">Projects</NavLink>
      </nav>
      <div className="nav-actions" aria-label="Profile links">
        <a href={contacts.resume} target="_blank" rel="noreferrer">
          Resume
        </a>
        <a href={contacts.github} target="_blank" rel="noreferrer">
          GitHub
        </a>
        <a href={contacts.linkedin} target="_blank" rel="noreferrer">
          LinkedIn
        </a>
      </div>
    </header>
  );
}
