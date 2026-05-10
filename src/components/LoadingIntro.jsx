import { useEffect, useState } from "react";
import usePrefersReducedMotion from "../hooks/usePrefersReducedMotion.js";

export default function LoadingIntro({ onComplete }) {
  const [hidden, setHidden] = useState(false);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) {
      setHidden(true);
      onComplete();
      return undefined;
    }

    const doneAt = window.setTimeout(() => {
      setHidden(true);
      onComplete();
    }, 900);

    return () => window.clearTimeout(doneAt);
  }, [onComplete, reduced]);

  if (reduced) return null;

  return (
    <div className={`loading-intro ${hidden ? "is-hidden" : ""}`} aria-hidden={hidden}>
      <div className="intro-circuit" />
      <div className="cloud cloud-left" />
      <div className="cloud cloud-right" />
      <div className="intro-center">
        <strong>Kelvin Zigah</strong>
      </div>
    </div>
  );
}
