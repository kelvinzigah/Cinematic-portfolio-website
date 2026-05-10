import { NavLink } from "react-router-dom";
import { contacts } from "../data/siteData.js";

export default function Nav({ visible }) {
  return (
    <header className={`nav-shell ${visible ? "is-visible" : ""}`}>
      <nav aria-label="Primary navigation">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/experience">Experience</NavLink>
        <NavLink to="/projects">Projects</NavLink>
      </nav>
      <div className="nav-actions" aria-label="Profile links">
        <a href={contacts.resume} download>
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
