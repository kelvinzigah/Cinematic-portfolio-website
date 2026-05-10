import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from "react";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const frameName = (index, prefix, extension, pad) =>
  `${prefix}${String(index).padStart(pad, "0")}.${extension.replace(".", "")}`;

const drawCover = (context, image, width, height, fit) => {
  const scale = fit === "contain" ? Math.min(width / image.width, height / image.height) : Math.max(width / image.width, height / image.height);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  const x = (width - drawWidth) / 2;
  const y = (height - drawHeight) / 2;

  context.clearRect(0, 0, width, height);
  context.fillStyle = "#020405";
  context.fillRect(0, 0, width, height);
  context.drawImage(image, x, y, drawWidth, drawHeight);
};

const getNearestLoadedFrame = (cache, target, frameCount) => {
  for (let offset = 1; offset < frameCount; offset += 1) {
    const previous = target - offset;
    const next = target + offset;
    if (previous >= 1 && cache.get(previous)?.loaded) return { index: previous, record: cache.get(previous) };
    if (next <= frameCount && cache.get(next)?.loaded) return { index: next, record: cache.get(next) };
  }

  return null;
};

const CanvasSequence = forwardRef(function CanvasSequence(
  {
    basePath,
    frameCount,
    framePrefix = "frame-",
    extension = "jpg",
    pad = 3,
    fit = "cover",
    fallbackSrc,
    className = "",
    eagerFrames = 18,
    preloadAhead = 24,
    preloadAll = true,
    fetchPriority = "auto",
    ariaLabel,
  },
  ref,
) {
  const canvasRef = useRef(null);
  const imageCacheRef = useRef(new Map());
  const activeFrameRef = useRef(1);
  const pendingFrameRef = useRef(1);
  const rafRef = useRef(null);

  const getFrameSrc = useCallback(
    (index) => `${basePath.replace(/\/$/, "")}/${frameName(index, framePrefix, extension, pad)}`,
    [basePath, extension, framePrefix, pad],
  );

  const loadFrame = useCallback(
    (index) => {
      const normalized = clamp(Math.round(index), 1, frameCount);
      const cached = imageCacheRef.current.get(normalized);
      if (cached) return cached;

      const image = new Image();
      const record = { image, loaded: false, failed: false };
      image.decoding = "async";
      image.fetchPriority = fetchPriority;
      image.onload = () => {
        record.loaded = true;
        const pendingFrame = pendingFrameRef.current;
        const activeFrame = activeFrameRef.current;
        const isCloserToPending = Math.abs(normalized - pendingFrame) < Math.abs(activeFrame - pendingFrame);

        if (pendingFrame === normalized || isCloserToPending) {
          rafRef.current = window.requestAnimationFrame(() => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const context = canvas.getContext("2d");
            context.imageSmoothingEnabled = true;
            context.imageSmoothingQuality = "high";
            const ratio = Math.min(window.devicePixelRatio || 1, 2);
            const width = Math.max(1, Math.floor(canvas.clientWidth * ratio));
            const height = Math.max(1, Math.floor(canvas.clientHeight * ratio));

            if (canvas.width !== width || canvas.height !== height) {
              canvas.width = width;
              canvas.height = height;
            }

            drawCover(context, image, width, height, fit);
            activeFrameRef.current = normalized;
            canvas.dataset.frame = String(normalized);
          });
        }
      };
      image.onerror = () => {
        record.failed = true;
      };
      image.src = getFrameSrc(normalized);
      imageCacheRef.current.set(normalized, record);
      return record;
    },
    [fetchPriority, fit, frameCount, getFrameSrc],
  );

  const drawFrame = useCallback(
    (index) => {
      const normalized = clamp(Math.round(index), 1, frameCount);
      pendingFrameRef.current = normalized;
      const record = loadFrame(normalized);

      const start = Math.max(1, normalized - 2);
      const end = Math.min(frameCount, normalized + preloadAhead);
      for (let frame = start; frame <= end; frame += 1) {
        loadFrame(frame);
      }

      const drawable = record.loaded && !record.failed
        ? { index: normalized, record }
        : getNearestLoadedFrame(imageCacheRef.current, normalized, frameCount);

      if (!drawable) return;

      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
      rafRef.current = window.requestAnimationFrame(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext("2d");
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        const width = Math.max(1, Math.floor(canvas.clientWidth * ratio));
        const height = Math.max(1, Math.floor(canvas.clientHeight * ratio));

        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
        }

        drawCover(context, drawable.record.image, width, height, fit);
        activeFrameRef.current = drawable.index;
        canvas.dataset.frame = String(drawable.index);
      });
    },
    [fit, frameCount, loadFrame, preloadAhead],
  );

  useImperativeHandle(
    ref,
    () => ({
      setProgress(progress) {
        const nextFrame = 1 + clamp(progress, 0, 1) * (frameCount - 1);
        drawFrame(nextFrame);
      },
      drawFrame,
      getLoadedCount() {
        let loaded = 0;
        imageCacheRef.current.forEach((record) => {
          if (record.loaded) loaded += 1;
        });
        return loaded;
      },
    }),
    [drawFrame, frameCount],
  );

  useEffect(() => {
    const limit = Math.min(frameCount, Math.max(1, eagerFrames));
    const firstPass = Math.min(frameCount, 24);
    for (let index = 1; index <= firstPass; index += 1) {
      loadFrame(index);
    }
    for (let index = 1; index <= limit; index += 1) {
      loadFrame(index);
    }
    drawFrame(activeFrameRef.current);

    let cancelled = false;
    const preloadRemaining = () => {
      if (!preloadAll) return;
      let frame = limit + 1;
      const batch = () => {
        if (cancelled) return;
        const end = Math.min(frameCount, frame + 8);
        for (; frame <= end; frame += 1) {
          loadFrame(frame);
        }
        if (frame <= frameCount) {
          const schedule = window.requestIdleCallback || ((callback) => window.setTimeout(callback, 24));
          schedule(batch, { timeout: 180 });
        }
      };
      batch();
    };

    preloadRemaining();

    const handleResize = () => drawFrame(activeFrameRef.current);
    window.addEventListener("resize", handleResize);

    return () => {
      cancelled = true;
      window.removeEventListener("resize", handleResize);
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
      imageCacheRef.current.clear();
    };
  }, [drawFrame, eagerFrames, frameCount, loadFrame, preloadAll]);

  return <canvas ref={canvasRef} className={`canvas-sequence ${className}`} aria-label={ariaLabel} />;
});

export default CanvasSequence;
