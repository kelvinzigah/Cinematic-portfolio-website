import { Routes, Route } from "react-router-dom";
import { Suspense, lazy, useCallback, useEffect, useState } from "react";
import Nav from "./components/Nav.jsx";
import LoadingIntro from "./components/LoadingIntro.jsx";
import SmoothScroll from "./components/SmoothScroll.jsx";

const LandingPage = lazy(() => import("./pages/LandingPage.jsx"));
const ExperiencePage = lazy(() => import("./pages/ExperiencePage.jsx"));
const ProjectsPage = lazy(() => import("./pages/ProjectsPage.jsx"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage.jsx"));

export default function App() {
  const [introDone, setIntroDone] = useState(false);
  const handleIntroComplete = useCallback(() => setIntroDone(true), []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  return (
    <>
      <LoadingIntro onComplete={handleIntroComplete} />
      <SmoothScroll />
      <Nav visible={introDone} />
      <main className={introDone ? "site-ready" : "site-waiting"}>
        <Suspense fallback={<div className="route-loading mono">Loading signal path...</div>}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/experience" element={<ExperiencePage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>
    </>
  );
}
