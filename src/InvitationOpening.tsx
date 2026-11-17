import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useIsPresent, useReducedMotion } from "motion/react";

export function InvitationOpening({
  onOpen,
  onStart,
  dissolveDuration,
}: {
  onOpen: () => void;
  onStart: () => void;
  dissolveDuration: number;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isPresent = useIsPresent();
  const reducedMotion = useReducedMotion();
  const finished = useRef(false);
  const playbackRequested = useRef(false);
  const [phase, setPhase] = useState<"idle" | "starting" | "playing">("idle");
  const [mediaFailed, setMediaFailed] = useState(false);

  const finishOpening = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    videoRef.current?.pause();
    onOpen();
  }, [onOpen]);

  useEffect(() => {
    if (phase === "idle") return;
    // A failed connection or suspended mobile decoder must never trap the guest.
    const timeout = window.setTimeout(finishOpening, phase === "starting" ? 8000 : 30000);
    return () => window.clearTimeout(timeout);
  }, [phase, finishOpening]);

  const playVideo = () => {
    const video = videoRef.current;
    if (finished.current || playbackRequested.current) return;
    // Call audio.play() synchronously from the tap, before awaiting video playback.
    onStart();
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (!video || mediaFailed || reducedMotion || connection?.saveData) {
      finishOpening();
      return;
    }
    video.currentTime = 0;
    video.playbackRate = 1;
    playbackRequested.current = true;
    setPhase("starting");
    // Remain inside the guest's gesture so inline playback works on Safari.
    const playback = video.play();
    void playback.catch(() => {
      if (finished.current) return;
      finishOpening();
    });
  };

  return (
    <motion.section
      className="video-opening"
      data-phase={phase}
      aria-label="Wedding invitation opening"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: dissolveDuration, ease: [0.4, 0, 0.2, 1] }}
    >
      <video
        ref={videoRef}
        className="envelope-video"
        src="/assets/envelope-opening-mobile-v1.mp4"
        poster="/assets/envelope-poster-mobile-v1.jpg"
        muted
        playsInline
        preload="none"
        disablePictureInPicture
        tabIndex={-1}
        aria-label="Wedding invitation opening video"
        onPlaying={() => setPhase("playing")}
        onEnded={finishOpening}
        onError={() => {
          setMediaFailed(true);
          if (playbackRequested.current) finishOpening();
        }}
      />
      {phase !== "playing" && (
        <img
          className="envelope-poster"
          src="/assets/envelope-poster-mobile-v1.jpg"
          alt=""
          aria-hidden="true"
          fetchPriority="high"
        />
      )}
      {phase !== "playing" && (
        <button
          type="button"
          className="envelope-open-trigger focus-ring"
          aria-label="Tap to open"
          onClick={playVideo}
          disabled={phase === "starting" || !isPresent}
        >
          <span className="simple-open-label">{phase === "starting" ? "Opening…" : "Tap to open"}</span>
        </button>
      )}
    </motion.section>
  );
}
