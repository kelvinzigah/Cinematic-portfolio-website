import { useEffect, useRef } from "react";
import { experiences } from "../data/siteData.js";

function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      el.dataset.revealed = "true";
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.dataset.revealed = "true";
          observer.disconnect();
        }
      },
      { rootMargin: "-10% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

function TimelineItem({ item, index }) {
  const ref = useReveal();
  return (
    <article
      className="timeline-item"
      ref={ref}
      data-direction={index % 2 ? "right" : "left"}
    >
      <div className="timeline-node mono">{String(index + 1).padStart(2, "0")}</div>
      <div className="timeline-card">
        <div className="timeline-meta mono">
          <span>{item.dates}</span>
          <span>{item.location}</span>
        </div>
        <h2>{item.role}</h2>
        <h3>{item.org}</h3>
        <ul>
          {item.summary.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </div>
    </article>
  );
}

export default function ExperiencePage() {
  return (
    <section className="experience-page page-shell">
      <div className="page-background" />
      <div className="section-inner">
        <div className="page-heading">
          <h1>Engineering work as a technical timeline.</h1>
          <p>Hardware testing, student leadership, PCB work, firmware concepts, and lab supervision.</p>
        </div>
        <div className="timeline">
          {experiences.map((item, index) => (
            <TimelineItem key={`${item.role}-${item.org}`} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
