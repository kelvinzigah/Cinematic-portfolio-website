import { motion } from "framer-motion";
import { experiences } from "../data/siteData.js";

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
            <motion.article
              className="timeline-item"
              key={`${item.role}-${item.org}`}
              initial={{ opacity: 0, x: index % 2 ? 32 : -32 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
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
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
