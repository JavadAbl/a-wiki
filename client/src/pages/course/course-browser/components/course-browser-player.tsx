import { useAppSelector } from "#hooks/redux-hooks";
import { cn } from "#lib/utils";
import { skipToken } from "@reduxjs/toolkit/query";
import { useContentGetURLByIdQuery } from "../../../../features/course/course-api";
import { useEffect, useRef, useState } from "react";
import { Play, Pause, Maximize, Minimize, Video, Volume2 } from "lucide-react";
import { formatSeconds } from "../../../../utils/app-utils";

const PLAYBACK_SPEEDS = [1, 1.25, 1.5, 2];

export default function CourseBrowserPlayer() {
  const {
    courseBrowserSelectedContent: selectedContent,
    courseBrowserSelectedCourse: selectedCourse,
  } = useAppSelector((s) => s.course);

  const {
    data: urlRes,
    isLoading,
    isError,
    refetch,
  } = useContentGetURLByIdQuery(
    selectedContent ? selectedContent.id : skipToken,
    {
      refetchOnMountOrArgChange: true,
    },
  );

  const url = urlRes?.url;
  const mediaType = selectedContent?.mediaType;
  const thumbnailUrl =
    selectedCourse?.thumbnailUrl || "/images/course-cover.webp";
  const title = selectedContent?.title;

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  const containerRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);

  // State to track recovery during a TTL expiration
  const [resumeTime, setResumeTime] = useState<number | null>(null);
  const [hasRetried, setHasRetried] = useState(false);

  // Reset states when the lesson changes
  useEffect(() => {
    setIsPlaying(false);
    setHasRetried(false);
    setResumeTime(null);
    setCurrentTime(0);
    setDuration(0);
    setPlaybackRate(1); // Reset speed on new lesson
  }, [selectedContent?.id]);

  // Sync playback rate with media element when it changes or URL loads
  useEffect(() => {
    if (mediaRef.current) {
      mediaRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate, url]);

  // Listen for native fullscreen changes (e.g., user presses ESC)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const togglePlay = () => {
    if (mediaRef.current) {
      if (isPlaying) {
        mediaRef.current.pause();
      } else {
        mediaRef.current.play();
      }
    }
  };

  const handleTimeUpdate = () => {
    if (mediaRef.current) {
      setCurrentTime(mediaRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (mediaRef.current) {
      setDuration(mediaRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (mediaRef.current) {
      mediaRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const cyclePlaybackSpeed = () => {
    const currentIndex = PLAYBACK_SPEEDS.indexOf(playbackRate);
    const nextSpeed =
      PLAYBACK_SPEEDS[(currentIndex + 1) % PLAYBACK_SPEEDS.length];
    setPlaybackRate(nextSpeed);
  };

  // Handle the TTL Expiration Error
  const handleMediaError = () => {
    if (!hasRetried && mediaRef.current) {
      console.warn("Media error detected. Attempting to refresh URL...");
      setResumeTime(mediaRef.current.currentTime);
      setHasRetried(true);
      refetch();
    }
  };

  // Resume playback once the fresh URL is loaded
  const handleLoadedData = () => {
    if (resumeTime !== null && mediaRef.current) {
      mediaRef.current.currentTime = resumeTime;
      setCurrentTime(resumeTime);
      setResumeTime(null);
      mediaRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "group relative flex items-center justify-center bg-surface-100 p-[16px_12px] rounded-[20px] gap-[16px] text-content-secondary h-full w-full overflow-hidden",
        isFullscreen && "rounded-none p-0", // Remove padding/radius in fullscreen
      )}
    >
      {/* Handle States */}
      {!selectedContent && (
        <p className="z-50 text-white">Please select a lesson to begin.</p>
      )}
      {selectedContent && isLoading && (
        <p className="z-50 text-white">Loading media...</p>
      )}
      {selectedContent && isError && (
        <p className="z-50 text-white">Failed to load media.</p>
      )}

      {/* 1. Thumbnail Background */}
      {(!url || selectedContent?.mediaType === "Audio") && (
        <img
          src={thumbnailUrl}
          alt="Course thumbnail"
          className={cn(
            "absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-300 bg-surface-100",
            mediaType === "Video" && isPlaying ? "opacity-0" : "opacity-100",
          )}
        />
      )}

      {/* Main Player UI */}
      {url && (
        <>
          {/* Light Shadow Overlay */}
          <div
            className={cn(
              "absolute inset-0 bg-black/40 z-10 transition-opacity duration-300",
              isPlaying ? "opacity-100 group-hover:opacity-60" : "opacity-100",
            )}
          />

          {/* Media Elements (Video / Audio) */}
          {mediaType === "Video" ? (
            <video
              ref={mediaRef as React.RefObject<HTMLVideoElement>}
              src={url}
              onClick={togglePlay} // Added onClick to pause/play
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onError={handleMediaError}
              onLoadedData={handleLoadedData}
              className="absolute inset-0 w-full h-full object-contain z-20 cursor-pointer" // Added cursor-pointer
            />
          ) : (
            <audio
              ref={mediaRef as React.RefObject<HTMLAudioElement>}
              src={url}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onError={handleMediaError}
              onLoadedData={handleLoadedData}
            />
          )}

          {/* Center Play Button (Only when paused) */}
          {!isPlaying && (
            <button
              onClick={togglePlay}
              className="absolute z-40 flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/40 transition-all duration-200 group/play"
              aria-label="Play media"
            >
              <Play
                size={32}
                className="text-white ml-1 group-hover/play:scale-110 transition-transform"
                fill="white"
              />
            </button>
          )}

          {/* Custom Controls Bar */}
          <div
            className={cn(
              "absolute bottom-0 left-0 right-0 p-4 z-30 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-opacity duration-300",
              isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100",
            )}
          >
            {/* Progress Bar (Forced LTR for correct left-to-right seeking) */}
            <input
              type="range"
              dir="ltr"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-white/30 rounded-full appearance-none cursor-pointer accent-primary-500 mb-3 hover:h-2 transition-all"
              aria-label="Seek media"
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Time Display */}
                <span
                  className="text-white text-sm font-medium font-mono"
                  dir="ltr"
                >
                  {formatSeconds(duration)} / {formatSeconds(currentTime)}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* Playback Speed Toggle */}
                <button
                  onClick={cyclePlaybackSpeed}
                  className="flex items-center justify-center px-2 h-8 bg-white/20 backdrop-blur-md rounded-md hover:bg-white/40 transition-all text-white text-xs font-bold min-w-[40px]"
                  aria-label="Change playback speed"
                  title="Playback Speed"
                >
                  {playbackRate}x
                </button>

                {/* Fullscreen Toggle */}
                <button
                  onClick={toggleFullscreen}
                  className="flex items-center justify-center w-10 h-10 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/40 transition-all"
                  aria-label={
                    isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"
                  }
                >
                  {isFullscreen ? (
                    <Minimize size={20} className="text-white" />
                  ) : (
                    <Maximize size={20} className="text-white" />
                  )}
                </button>

                {/* Play/Pause Toggle */}
                <button
                  onClick={togglePlay}
                  className="flex items-center justify-center w-10 h-10 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/40 transition-all"
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <Pause size={20} className="text-white" fill="white" />
                  ) : (
                    <Play
                      size={20}
                      className="text-white ml-0.5"
                      fill="white"
                    />
                  )}
                </button>

                {/* Title and Media Type Badges */}
                <div className="hidden sm:flex items-center gap-[4px] p-[4px] bg-surface-100 text-sm rounded-[6px]">
                  <div
                    className={cn(
                      "flex items-center gap-[4px] p-[4px_8px] text-content-primary",
                      selectedContent?.mediaType === "Video" &&
                        "bg-primary-300 rounded-[6px] text-content-secondary",
                    )}
                  >
                    <Video size={16} />
                    <span>{"ویدیو"}</span>
                  </div>

                  <div
                    className={cn(
                      "flex items-center gap-[4px] p-[4px_8px] text-content-primary",
                      selectedContent?.mediaType === "Audio" &&
                        "bg-primary-300 rounded-[6px] text-content-secondary",
                    )}
                  >
                    <Volume2 size={16} />
                    <span>{"صوتی"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
const CameraLight = () => (
  <svg
    width="18"
    height="11"
    viewBox="0 0 18 11"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12.1667 6.33315L16.5192 9.23481C16.5819 9.27657 16.6548 9.30052 16.7301 9.30412C16.8054 9.30772 16.8802 9.29084 16.9467 9.25526C17.0131 9.21969 17.0687 9.16676 17.1074 9.10211C17.1461 9.03746 17.1666 8.96352 17.1667 8.88815V2.05815C17.1667 1.98483 17.1474 1.91281 17.1106 1.84935C17.0739 1.7859 17.0211 1.73325 16.9576 1.69673C16.894 1.66021 16.8219 1.64111 16.7486 1.64136C16.6753 1.64161 16.6033 1.6612 16.54 1.69815L12.1667 4.24981M2.16667 0.5H10.5C11.4205 0.5 12.1667 1.24619 12.1667 2.16667V8.83333C12.1667 9.75381 11.4205 10.5 10.5 10.5H2.16667C1.24619 10.5 0.5 9.75381 0.5 8.83333V2.16667C0.5 1.24619 1.24619 0.5 2.16667 0.5Z"
      stroke="#EBEBEB"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);

const CameraDark = () => (
  <svg
    width="18"
    height="11"
    viewBox="0 0 18 11"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12.1667 6.33315L16.5192 9.23481C16.5819 9.27657 16.6548 9.30052 16.7301 9.30412C16.8054 9.30772 16.8802 9.29084 16.9467 9.25526C17.0131 9.21969 17.0687 9.16676 17.1074 9.10211C17.1461 9.03746 17.1666 8.96352 17.1667 8.88815V2.05815C17.1667 1.98483 17.1474 1.91281 17.1106 1.84935C17.0739 1.7859 17.0211 1.73325 16.9576 1.69673C16.894 1.66021 16.8219 1.64111 16.7486 1.64136C16.6753 1.64161 16.6033 1.6612 16.54 1.69815L12.1667 4.24981M2.16667 0.5H10.5C11.4205 0.5 12.1667 1.24619 12.1667 2.16667V8.83333C12.1667 9.75381 11.4205 10.5 10.5 10.5H2.16667C1.24619 10.5 0.5 9.75381 0.5 8.83333V2.16667C0.5 1.24619 1.24619 0.5 2.16667 0.5Z"
      stroke="#4A5565"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);

const SoundLight = () => (
  <svg
    width="14"
    height="18"
    viewBox="0 0 14 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M7.16667 13.8333C7.16667 15.6743 5.67428 17.1667 3.83333 17.1667C1.99238 17.1667 0.5 15.6743 0.5 13.8333C0.5 11.9924 1.99238 10.5 3.83333 10.5C5.67428 10.5 7.16667 11.9924 7.16667 13.8333ZM7.16667 13.8333V0.5L13 3.83333"
      stroke="#EBEBEB"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);

const SoundDark = () => (
  <svg
    width="14"
    height="18"
    viewBox="0 0 14 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M7.16667 13.8333C7.16667 15.6743 5.67428 17.1667 3.83333 17.1667C1.99238 17.1667 0.5 15.6743 0.5 13.8333C0.5 11.9924 1.99238 10.5 3.83333 10.5C5.67428 10.5 7.16667 11.9924 7.16667 13.8333ZM7.16667 13.8333V0.5L13 3.83333"
      stroke="#4A5565"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);
