import { useState } from "react";
import { projects } from "../data/siteData.js";

export default function ProjectDisplay() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const active = projects[activeIndex];
  const isCompactDetail = active.name !== "STM32 PCB Design";

  return (
    <section className="project-stage" aria-label="Project selector">
      <div className={`project-visual ${active.imageClass}`}>
        <div className="project-schematic" />
      </div>
      <article className={`project-detail ${isCompactDetail ? "is-compact" : ""}`}>
        <span className="mono">{active.category} / {active.status}</span>
        <h1>{active.name}</h1>
        <p>{active.summary[0]}</p>
        <div className="project-tags">
          {active.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <a href={active.github} target="_blank" rel="noreferrer">
          GitHub repo
        </a>
      </article>

      <div
        className={`project-selector ${expanded ? "is-expanded" : ""}`}
        role={expanded ? "group" : "button"}
        aria-label={expanded ? "Project selector" : "Expand project stack"}
        tabIndex={expanded ? -1 : 0}
        onClick={() => {
          if (!expanded) setExpanded(true);
        }}
        onKeyDown={(event) => {
          if (!expanded && (event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
            setExpanded(true);
          }
        }}
      >
        <div className="project-cards">
          {projects.map((project, index) => (
            <button
              className={`project-card ${index === activeIndex ? "is-active" : ""}`}
              type="button"
              key={project.name}
              aria-label={expanded ? `Select ${project.name}` : "Expand project stack"}
              onClick={(event) => {
                event.stopPropagation();
                if (!expanded) {
                  setExpanded(true);
                  return;
                }
                setActiveIndex(index);
                setExpanded(false);
              }}
            >
              <span className="mono">{project.type}</span>
              <strong>{project.name}</strong>
              <small>{project.date}</small>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
