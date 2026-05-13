import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CanvasSequence from "../components/CanvasSequence.jsx";
import { contacts, experiences, projects, skillGroups } from "../data/siteData.js";

gsap.registerPlugin(ScrollTrigger);

const HERO_FRAMES = 241;
const SCOPE_FRAMES = 76;

const coursework = ["Computer Architecture", "Digital Design", "Circuit Analysis", "Signals & Systems"];
const selectedProjects = projects.slice(0, 3);
const featuredExperience = experiences.slice(0, 2);

const mapHeroFrameProgress = (progress) => Math.min(Math.max(progress, 0), 1);

function usePauseVideoWhenHidden(videoRef, disabled) {
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    if (disabled) {
      video.pause();
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.18 },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [disabled, videoRef]);
}

function useCrossfadeVideoLoop(primaryVideoRef, secondaryVideoRef, disabled) {
  useEffect(() => {
    const videoRefs = [primaryVideoRef, secondaryVideoRef];
    const videos = videoRefs.map((videoRef) => videoRef.current).filter(Boolean);
    if (videos.length < 2) return undefined;

    const fadeSeconds = 1.2;
    let activeIndex = 0;
    let isFading = false;
    let isVisible = false;
    let fadeTimer;

    const setLayerState = () => {
      videos.forEach((video, index) => {
        video.loop = false;
        video.muted = true;
        video.playsInline = true;
        video.style.opacity = index === activeIndex ? "1" : "0";
      });
    };

    const pauseAll = () => videos.forEach((video) => video.pause());

    const playActive = () => {
      if (disabled || !isVisible) return;
      videos[activeIndex]?.play().catch(() => {});
    };

    const startFade = () => {
      if (isFading || disabled || !isVisible) return;

      const activeVideo = videos[activeIndex];
      const nextIndex = (activeIndex + 1) % videos.length;
      const nextVideo = videos[nextIndex];
      if (!activeVideo?.duration || !nextVideo) return;

      isFading = true;
      nextVideo.currentTime = 0;
      nextVideo.play().catch(() => {});
      nextVideo.style.opacity = "1";
      activeVideo.style.opacity = "0";

      fadeTimer = window.setTimeout(() => {
        activeVideo.pause();
        activeVideo.currentTime = 0;
        activeIndex = nextIndex;
        isFading = false;
      }, fadeSeconds * 1000);
    };

    const handleTimeUpdate = (event) => {
      const video = event.currentTarget;
      if (video !== videos[activeIndex] || !video.duration) return;
      if (video.duration - video.currentTime <= fadeSeconds) {
        startFade();
      }
    };

    setLayerState();
    videos.forEach((video, index) => {
      video.currentTime = 0;
      video.addEventListener("timeupdate", handleTimeUpdate);
      if (index !== activeIndex) video.pause();
    });

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          playActive();
        } else {
          pauseAll();
        }
      },
      { threshold: 0.18 },
    );

    observer.observe(videos[0]);

    return () => {
      window.clearTimeout(fadeTimer);
      observer.disconnect();
      videos.forEach((video) => {
        video.removeEventListener("timeupdate", handleTimeUpdate);
        video.pause();
      });
    };
  }, [disabled, primaryVideoRef, secondaryVideoRef]);
}

export default function LandingPage() {
  const rootRef = useRef(null);
  const heroRef = useRef(null);
  const heroCanvasLayerRef = useRef(null);
  const heroSequenceRef = useRef(null);
  const heroBlackoutRef = useRef(null);
  const heroBeatRefs = useRef([]);

  const aboutRef = useRef(null);
  const aboutVideoRef = useRef(null);
  const aboutVideoLoopRef = useRef(null);
  const aboutCopyRef = useRef(null);
  const aboutBlackoutRef = useRef(null);

  const scopeRef = useRef(null);
  const scopeSequenceRef = useRef(null);
  const scopeConsoleRef = useRef(null);
  const skillModuleRefs = useRef([]);

  useCrossfadeVideoLoop(aboutVideoRef, aboutVideoLoopRef, false);

  // hasScrolledRef: true once the user (or a restore) has produced a real scroll event.
  // isUnmountingRef: set true in useLayoutEffect cleanup so the scroll listener stops
  //   writing to sessionStorage before context.revert() fires its own scroll events.
  const hasScrolledRef = useRef(false);
  const isUnmountingRef = useRef(false);

  // Persist scroll position on every tick. Ignored while unmounting so that the
  // synthetic scroll event emitted by context.revert() (which collapses pin spacers
  // back to 0) cannot overwrite the good saved value.
  useEffect(() => {
    let raf = null;
    const save = () => {
      raf = null;
      if (isUnmountingRef.current) return;
      const y = window.__kzLenis?.animatedScroll ?? window.scrollY;
      sessionStorage.setItem("kz-home-scroll", String(Math.round(y)));
      hasScrolledRef.current = true;
    };
    const onScroll = () => {
      if (isUnmountingRef.current || raf) return;
      raf = window.requestAnimationFrame(save);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.__kzLenis?.on?.("scroll", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.__kzLenis?.off?.("scroll", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  // Restore scroll position after returning from another route.
  useEffect(() => {
    const saved = sessionStorage.getItem("kz-home-scroll");
    if (!saved || saved === "0") return undefined;

    // Wait until SmoothScroll's deferred ScrollTrigger.refresh() (120ms) has recalculated
    // pin-spacer heights before scrolling. Call lenis.resize() first to ensure Lenis has
    // up-to-date scroll bounds before clamping the target.
    const timer = window.setTimeout(() => {
      const y = Number(saved);
      const lenis = window.__kzLenis;
      if (lenis) {
        lenis.resize();
        lenis.scrollTo(y, { immediate: true, force: true });
      } else {
        window.scrollTo({ top: y, behavior: "instant" });
      }
    }, 160);

    return () => window.clearTimeout(timer);
  }, []);

  const setHeroBeatRef = useCallback(
    (index) => (element) => {
      heroBeatRefs.current[index] = element;
    },
    [],
  );

  const setSkillModuleRef = useCallback(
    (index) => (element) => {
      skillModuleRefs.current[index] = element;
    },
    [],
  );

  useLayoutEffect(() => {
    hasScrolledRef.current = false;
    isUnmountingRef.current = false;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      const heroBeats = heroBeatRefs.current.filter(Boolean);
      const skillModules = skillModuleRefs.current.filter(Boolean);
      gsap.set(heroBeats[0], { autoAlpha: 1, y: 0, scale: 1 });
      gsap.set(heroCanvasLayerRef.current, { autoAlpha: 1 });
      gsap.set(heroBlackoutRef.current, { autoAlpha: 0 });
      gsap.set(aboutCopyRef.current, { autoAlpha: 1, y: 0 });
      gsap.set(aboutBlackoutRef.current, { autoAlpha: 0 });
      gsap.set(scopeConsoleRef.current, { autoAlpha: 1, y: 0 });
      gsap.set(skillModules, { autoAlpha: 1, y: 0 });
      heroSequenceRef.current?.setProgress(0);
      scopeSequenceRef.current?.setProgress(1);
      return () => {
        isUnmountingRef.current = true;
      };
    }

    const isMobile = window.matchMedia("(max-width: 760px)").matches;
    let removeHeroSequenceDriver = () => {};
    let removeScopeSequenceDriver = () => {};

    const context = gsap.context(() => {
      const heroBeats = heroBeatRefs.current.filter(Boolean);
      const skillModules = skillModuleRefs.current.filter(Boolean);
      const heroEnd = isMobile ? "+=300%" : "+=520%";
      const aboutEnd = isMobile ? "+=120%" : "+=165%";
      const scopeEnd = isMobile ? "+=210%" : "+=285%";

      gsap.set(heroBeats, { autoAlpha: 0, y: 36, scale: 0.985 });
      gsap.set(heroBeats[0], { autoAlpha: 1, y: 0, scale: 1 });
      gsap.set(heroCanvasLayerRef.current, { autoAlpha: 1 });
      gsap.set(heroBlackoutRef.current, { autoAlpha: 0 });
      gsap.set(aboutCopyRef.current, { autoAlpha: 0, y: 26 });
      gsap.set(aboutBlackoutRef.current, { autoAlpha: 1 });
      gsap.set(scopeConsoleRef.current, { autoAlpha: 0, y: 22 });
      gsap.set(skillModules, { autoAlpha: 0, y: 18 });

      const heroTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: heroEnd,
          scrub: 0.95,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          fastScrollEnd: true,
        },
      });

      let heroSequenceRaf = null;
      const updateHeroSequence = () => {
        heroSequenceRaf = null;
        const activeScroll = window.__kzLenis?.animatedScroll ?? window.scrollY;
        const start = heroTimeline.scrollTrigger?.start ?? 0;
        const end = heroTimeline.scrollTrigger?.end ?? (start + window.innerHeight);
        const progress = Math.min(Math.max((activeScroll - start) / (end - start || 1), 0), 1);
        const frameProgress = mapHeroFrameProgress(progress);
        heroSequenceRef.current?.setProgress(frameProgress);
      };
      const scheduleHeroSequenceUpdate = () => {
        if (heroSequenceRaf) return;
        heroSequenceRaf = window.requestAnimationFrame(updateHeroSequence);
      };

      window.__kzHeroSequenceCleanup?.();
      window.addEventListener("scroll", scheduleHeroSequenceUpdate, { passive: true });
      window.__kzLenis?.on?.("scroll", scheduleHeroSequenceUpdate);
      scheduleHeroSequenceUpdate();

      removeHeroSequenceDriver = () => {
        window.removeEventListener("scroll", scheduleHeroSequenceUpdate);
        window.__kzLenis?.off?.("scroll", scheduleHeroSequenceUpdate);
        if (heroSequenceRaf) window.cancelAnimationFrame(heroSequenceRaf);
        if (window.__kzHeroSequenceCleanup === removeHeroSequenceDriver) {
          delete window.__kzHeroSequenceCleanup;
        }
      };
      window.__kzHeroSequenceCleanup = removeHeroSequenceDriver;

      heroTimeline
        .to(heroBeats[0], { autoAlpha: 0, y: -26, scale: 1.01, duration: 0.05, ease: "power2.inOut" }, 0.17)
        .to(heroBeats[1], { autoAlpha: 1, y: 0, scale: 1, duration: 0.055, ease: "power2.out" }, 0.18)
        .to(heroBeats[1], { autoAlpha: 0, y: -26, scale: 1.01, duration: 0.05, ease: "power2.inOut" }, 0.36)
        .to(heroBeats[2], { autoAlpha: 1, y: 0, scale: 1, duration: 0.055, ease: "power2.out" }, 0.37)
        .to(heroBeats[2], { autoAlpha: 0, y: -26, scale: 1.01, duration: 0.05, ease: "power2.inOut" }, 0.53)
        .to(heroBeats[3], { autoAlpha: 1, y: 0, scale: 1, duration: 0.055, ease: "power2.out" }, 0.54)
        .to(heroBeats[3], { autoAlpha: 0, y: -24, scale: 1.01, duration: 0.08, ease: "power2.inOut" }, 0.74)
        .to(heroBlackoutRef.current, { autoAlpha: 1, duration: 0.05, ease: "none" }, 0.955);

      const aboutTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: aboutRef.current,
          start: "top top",
          end: aboutEnd,
          scrub: 0.85,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          fastScrollEnd: true,
        },
      });

      aboutTimeline
        .to(aboutBlackoutRef.current, { autoAlpha: 0, duration: 0.18, ease: "none" }, 0.06)
        .to(aboutCopyRef.current, { autoAlpha: 1, y: 0, duration: 0.24, ease: "power2.out" }, 0.22)
        .to(aboutCopyRef.current, { autoAlpha: 0, y: -20, duration: 0.18, ease: "power2.out" }, 0.72)
        .to(aboutBlackoutRef.current, { autoAlpha: 1, duration: 0.22, ease: "none" }, 0.78);

      const scopeTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: scopeRef.current,
          start: "top top",
          end: scopeEnd,
          scrub: 0.9,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          fastScrollEnd: true,
        },
      });

      let scopeSequenceRaf = null;
      const updateScopeSequence = () => {
        scopeSequenceRaf = null;
        const activeScroll = window.__kzLenis?.animatedScroll ?? window.scrollY;
        const scopePin = scopeRef.current?.parentElement;
        const pinHeight = scopePin?.classList.contains("pin-spacer") ? scopePin.offsetHeight : 0;
        const sceneHeight = scopeRef.current?.offsetHeight ?? window.innerHeight;
        const start = scopePin?.classList.contains("pin-spacer") ? scopePin.offsetTop : (scopeTimeline.scrollTrigger?.start ?? 0);
        const end = pinHeight > sceneHeight ? start + pinHeight - sceneHeight : (scopeTimeline.scrollTrigger?.end ?? start + window.innerHeight);
        const progress = Math.min(Math.max((activeScroll - start) / (end - start || 1), 0), 1);
        scopeSequenceRef.current?.setProgress(progress);
      };
      const scheduleScopeSequenceUpdate = () => {
        if (scopeSequenceRaf) return;
        scopeSequenceRaf = window.requestAnimationFrame(updateScopeSequence);
      };

      window.__kzScopeSequenceCleanup?.();
      window.addEventListener("scroll", scheduleScopeSequenceUpdate, { passive: true });
      window.__kzLenis?.on?.("scroll", scheduleScopeSequenceUpdate);
      scheduleScopeSequenceUpdate();

      removeScopeSequenceDriver = () => {
        window.removeEventListener("scroll", scheduleScopeSequenceUpdate);
        window.__kzLenis?.off?.("scroll", scheduleScopeSequenceUpdate);
        if (scopeSequenceRaf) window.cancelAnimationFrame(scopeSequenceRaf);
        if (window.__kzScopeSequenceCleanup === removeScopeSequenceDriver) {
          delete window.__kzScopeSequenceCleanup;
        }
      };
      window.__kzScopeSequenceCleanup = removeScopeSequenceDriver;

      scopeTimeline
        .to(scopeConsoleRef.current, { autoAlpha: 1, y: 0, duration: 0.04, ease: "power2.out" }, 0.96)
        .to(skillModules, { autoAlpha: 1, y: 0, duration: 0.035, stagger: 0.012, ease: "power2.out" }, 0.985);

      ScrollTrigger.refresh();
    }, rootRef);

    return () => {
      // Save position before context.revert() so we capture the real scroll value.
      // Then set isUnmountingRef so the scroll listener ignores the synthetic scroll
      // event that fires when GSAP removes pin spacers and the page collapses.
      if (hasScrolledRef.current) {
        const y = window.__kzLenis?.animatedScroll ?? window.scrollY;
        sessionStorage.setItem("kz-home-scroll", String(Math.round(y)));
      }
      isUnmountingRef.current = true;
      removeHeroSequenceDriver();
      removeScopeSequenceDriver();
      context.revert();
    };
  }, []);

  return (
    <div className="cinematic-home" ref={rootRef}>
      <section className="cinematic-scene cinematic-hero" ref={heroRef} aria-label="Homepage introduction">
        <div className="sequence-layer hero-sequence-layer" ref={heroCanvasLayerRef} aria-hidden="true">
          <CanvasSequence
            ref={heroSequenceRef}
            basePath="/cinematic/hero-workbench-frames"
            frameCount={HERO_FRAMES}
            fallbackSrc="/cinematic/posters/hero-workbench.jpg"
            fit="cover"
            eagerFrames={HERO_FRAMES}
          />
        </div>
        <div className="scene-vignette" aria-hidden="true" />
        <div className="scene-blackout" ref={heroBlackoutRef} aria-hidden="true" />

        <div className="hero-beats" aria-label="Hi, I'm Kelvin, EE undergrad, welcome to my portfolio">
          <h1>
            {["Hi", "I'm Kelvin", "EE undergrad", "welcome to my portfolio =)"].map((beat, index) => (
              <span className="hero-beat" ref={setHeroBeatRef(index)} key={beat}>
                {beat}
              </span>
            ))}
          </h1>
        </div>
      </section>

      <section className="cinematic-scene cinematic-about" ref={aboutRef} aria-labelledby="about-title">
        <div className="about-video-stack" aria-hidden="true">
          <video
            ref={aboutVideoRef}
            className="about-waves-video"
            src="/cinematic/about-waves.mp4"
            poster="/cinematic/posters/about.jpg"
            autoPlay
            muted
            playsInline
            preload="auto"
          />
          <video
            ref={aboutVideoLoopRef}
            className="about-waves-video about-waves-video-duplicate"
            src="/cinematic/about-waves.mp4"
            poster="/cinematic/posters/about.jpg"
            muted
            playsInline
            preload="auto"
          />
        </div>
        <div className="scene-vignette about-vignette" aria-hidden="true" />
        <div className="scene-blackout" ref={aboutBlackoutRef} aria-hidden="true" />

        <div className="about-content-plane" ref={aboutCopyRef}>
          <div className="about-copy-plane">
            <h2 id="about-title">About me</h2>
            <p>
              I'm an electrical engineering undergrad who loves building hardware projects and exploring the systems
              behind them. I also enjoy vibe coding and building with AI agents. Outside of school, I'm usually around
              music as a sound technician and drummer at my church. Every day, I'm learning to grow in skill,
              discipline, and Christlike character.
            </p>
          </div>
          <figure className="about-portrait-frame" aria-label="Portrait of Kelvin Zigah">
            <picture>
              <source srcSet="/cinematic/kelvin-portrait.webp" type="image/webp" />
              <img src="/cinematic/kelvin-portrait.png" alt="Kelvin Zigah" width="800" loading="lazy" decoding="async" />
            </picture>
          </figure>
        </div>
      </section>

      <section className="cinematic-scene scope-skills-scene" ref={scopeRef} aria-labelledby="skills-title">
        <div className="scope-reveal-layer" aria-hidden="true">
          <CanvasSequence
            ref={scopeSequenceRef}
            basePath="/cinematic/oscilloscope-reveal"
            frameCount={SCOPE_FRAMES}
            fallbackSrc="/cinematic/posters/skills-oscilloscope-clean.png"
            fit="contain"
            eagerFrames={4}
            fetchPriority="auto"
          />
        </div>
        <div className="scene-vignette scope-vignette" aria-hidden="true" />

        <div className="scope-console" ref={scopeConsoleRef}>
          <div className="scope-console-heading">
            <h2 id="skills-title">Skills & tools.</h2>
          </div>
          <div className="skill-readout-grid">
            {skillGroups.map((group, index) => (
              <article className="skill-readout" key={group.label} ref={setSkillModuleRef(index)} tabIndex={0}>
                <h3>{group.label}</h3>
                <ul>
                  {group.skills.map((skill) => (
                    <li key={skill}>{skill}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-support-section experience-bridge-section" aria-labelledby="experience-bridge-title">
        <div className="support-shell experience-bridge-shell">
          <div className="support-heading">
            <h2 id="experience-bridge-title">Experience</h2>
          </div>
          <div className="experience-preview-grid">
            {featuredExperience.map((item) => (
              <article className="experience-preview-card" key={`${item.role}-${item.org}`}>
                <div className="timeline-meta mono">
                  <span>{item.dates}</span>
                  <span>{item.org}</span>
                </div>
                <h3>{item.role}</h3>
                <p>{item.summary[0]}</p>
              </article>
            ))}
          </div>
          <div className="section-actions">
            <Link to="/experience">View full experience</Link>
            <Link to="/projects">View projects</Link>
          </div>
        </div>
      </section>

      <section className="home-support-section selected-work-section" aria-labelledby="selected-work-title">
        <div className="support-shell selected-work-shell">
          <div className="support-heading selected-work-heading">
            <h2 id="selected-work-title">Projects</h2>
          </div>
          <div className="selected-work-grid">
            {selectedProjects.map((project) => (
              <Link className="selected-work-card" to="/projects" key={project.name}>
                <span className="mono">{project.category}</span>
                <h3>{project.name}</h3>
                <p>{project.summary[0]}</p>
                <div className="selected-work-tags">
                  {project.tags.slice(0, 3).map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
                <strong>View project</strong>
              </Link>
            ))}
          </div>
          <div className="section-actions">
            <Link to="/projects">View all projects</Link>
            <Link to="/experience">View experience</Link>
          </div>
        </div>
      </section>

      <section className="home-support-section academics-section" aria-labelledby="academics-title">
        <div className="support-shell">
          <div className="support-heading">
            <p className="mono section-kicker">Academics</p>
            <h2 id="academics-title">Bachelor of Electrical Engineering, Co-op</h2>
          </div>
          <div className="academic-panel">
            <div className="academic-primary">
              <p>Concordia University, Montreal, QC</p>
              <dl>
                <div>
                  <dt>Expected graduation</dt>
                  <dd>May 2028</dd>
                </div>
                <div>
                  <dt>GPA</dt>
                  <dd>3.3</dd>
                </div>
              </dl>
            </div>
            <div className="coursework-panel">
              <h3>Relevant coursework</h3>
              <ul>
                {coursework.map((course) => (
                  <li key={course}>{course}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="home-support-section contact-section" id="contact" aria-labelledby="contact-title">
        <div className="support-shell contact-form-shell">
          <div className="contact-social-row" aria-label="Social links">
            <a href={contacts.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn">
              <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
                <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V8.98h3.42v1.57h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.29ZM5.32 7.41a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14Zm1.78 13.04H3.54V8.98H7.1v11.47ZM22.22 0H1.77C.8 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0Z" />
              </svg>
            </a>
            <a href={contacts.github} target="_blank" rel="noreferrer" aria-label="GitHub">
              <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
                <path d="M12 2C6.48 2 2 6.58 2 12.24c0 4.52 2.87 8.35 6.84 9.71.5.09.68-.22.68-.49 0-.24-.01-1.04-.01-1.88-2.78.62-3.37-1.22-3.37-1.22-.45-1.18-1.1-1.49-1.1-1.49-.9-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.36-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.27 9.27 0 0 1 12 6.98c.85 0 1.7.12 2.5.35 1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.79-4.57 5.05.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.59.69.49A10.16 10.16 0 0 0 22 12.24C22 6.58 17.52 2 12 2Z" />
              </svg>
            </a>
          </div>
          <div className="contact-divider" aria-hidden="true" />
          <h2 id="contact-title">Contact Me</h2>
          <form
            className="contact-form"
            action={`mailto:${contacts.email}`}
            method="post"
            encType="text/plain"
          >
            <label>
              <span>Email</span>
              <input name="Email" type="email" placeholder="Email" autoComplete="email" required />
            </label>
            <label>
              <span>Subject</span>
              <input name="Subject" type="text" placeholder="Subject" required />
            </label>
            <label>
              <span>Message</span>
              <textarea name="Message" placeholder="Leave a message..." rows={7} required />
            </label>
            <button type="submit">
              <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
                <path d="M21.7 3.29a1 1 0 0 0-1.04-.23l-18 7a1 1 0 0 0 .03 1.88l7.54 2.72 2.72 7.54a1 1 0 0 0 .92.66h.02a1 1 0 0 0 .92-.61l7-18a1 1 0 0 0-.11-.96ZM14 18.94l-1.95-5.4 4.28-4.28a1 1 0 0 0-1.42-1.42l-4.28 4.28-5.4-1.95 13.85-5.39L14 18.94Z" />
              </svg>
              Send
            </button>
          </form>
          <div className="contact-action-row" aria-label="Recruiter actions">
            <a href={`mailto:${contacts.email}`}>Email me</a>
            <a href={contacts.resume} target="_blank" rel="noreferrer">
              Download resume
            </a>
            <Link to="/projects">View projects</Link>
            <Link to="/experience">View experience</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
