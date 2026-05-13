import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <section className="not-found-page page-shell">
      <div className="page-background" />
      <div className="not-found-inner">
        <p className="mono not-found-code">404</p>
        <h1>Signal lost.</h1>
        <p className="not-found-sub">This page doesn&rsquo;t exist or was moved.</p>
        <Link to="/" className="not-found-link">Return home</Link>
      </div>
    </section>
  );
}
