import { useAppSelector } from "#hooks/redux-hooks";
import { cn } from "#lib/utils";
import { skipToken } from "@reduxjs/toolkit/query";
import { useContentGetURLByIdQuery } from "../../../../features/course/course-api";
import { useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  Maximize,
  Minimize,
  Video,
  Volume2,
  Volume1,
  VolumeX,
} from "lucide-react";
import { formatSeconds } from "../../../../utils/app-utils";

const PLAYBACK_SPEEDS = [1, 1.25, 1.5, 2];

export default function CourseBrowserPlayer() {
  const {
    courseBrowserSelectedContent: selectedContent,
    courseBrowserSelectedCourse: selectedCourse,
  } = useAppSelector((s) => s.course);

  const {
    data: urlRes,
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
  const [isBuffering, setIsBuffering] = useState(false); // ADDED: Buffering state
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  // Volume states
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // ADDED: Controls visibility state and timer
  const [areControlsVisible, setAreControlsVisible] = useState(true);
  const hideControlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);

  // State to track recovery during a TTL expiration
  const [resumeTime, setResumeTime] = useState<number | null>(null);
  const [hasRetried, setHasRetried] = useState(false);

  // Calculate the percentage of the current time for the seekbar fill
  const seekPercentage = duration ? (currentTime / duration) * 100 : 0;
  const volumePercentage = (isMuted ? 0 : volume) * 100;

  // Reset states when the lesson changes
  useEffect(() => {
    setIsPlaying(false);
    setHasRetried(false);
    setResumeTime(null);
    setCurrentTime(0);
    setDuration(0);
    setPlaybackRate(1); // Reset speed on new lesson
    setIsBuffering(true); // Set buffering true initially when lesson changes
  }, [selectedContent?.id]);

  // Sync playback rate and volume with media element when they change or URL loads
  useEffect(() => {
    if (mediaRef.current) {
      mediaRef.current.playbackRate = playbackRate;
      mediaRef.current.volume = isMuted ? 0 : volume;
    }
  }, [playbackRate, volume, isMuted, url]);

  // Listen for native fullscreen changes (e.g., user presses ESC)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // ADDED: useEffect to manage auto-hiding controls based on play state
  useEffect(() => {
    if (isPlaying) {
      // Start the timer to hide controls
      hideControlsTimer.current = setTimeout(() => {
        setAreControlsVisible(false);
      }, 3000); // 3 seconds delay
    } else {
      // If paused, clear timer and ensure controls are visible
      if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
      setAreControlsVisible(true);
    }

    return () => {
      if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    };
  }, [isPlaying]);

  // ADDED: Function to handle mouse movement
  const handleMouseMove = () => {
    setAreControlsVisible(true);
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);

    if (isPlaying) {
      hideControlsTimer.current = setTimeout(() => {
        setAreControlsVisible(false);
      }, 3000); // Hide again after 3 seconds of inactivity
    }
  };

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

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value);
    setVolume(newVolume);
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
    if (mediaRef.current) {
      mediaRef.current.volume = newVolume;
    }
  };

  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    if (mediaRef.current) {
      mediaRef.current.volume = newMutedState ? 0 : volume;
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

  // Dynamic volume icon based on state
  const VolumeIcon =
    isMuted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={cn(
        "group relative flex items-center justify-center bg-surface-100 p-[16px_12px] rounded-[20px] gap-[16px] text-content-secondary h-full w-full overflow-hidden",
        isFullscreen && "rounded-none p-0",
        isPlaying && !areControlsVisible && "cursor-none",
      )}
    >
      {/* Handle States */}
      {!selectedContent && (
        <p className="z-50 text-white">Please select a lesson to begin.</p>
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
              areControlsVisible ? "opacity-100" : "opacity-0",
            )}
          />

          {/* Media Elements (Video / Audio) */}
          {mediaType === "Video" ? (
            <video
              ref={mediaRef as React.RefObject<HTMLVideoElement>}
              src={url}
              onClick={togglePlay}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onError={handleMediaError}
              onLoadedData={handleLoadedData}
              // ADDED: Buffering events
              onWaiting={() => setIsBuffering(true)}
              onPlaying={() => setIsBuffering(false)}
              onCanPlay={() => setIsBuffering(false)}
              className="absolute inset-0 w-full h-full object-contain z-20 cursor-pointer"
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
              // ADDED: Buffering events
              onWaiting={() => setIsBuffering(true)}
              onPlaying={() => setIsBuffering(false)}
              onCanPlay={() => setIsBuffering(false)}
            />
          )}

          {/* ADDED: Center Buffering Spinner */}
          {isBuffering && (
            <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
              <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
            </div>
          )}

          {/* Center Play Button (Only when paused and not buffering) */}
          {!isPlaying && !isBuffering && (
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
              areControlsVisible
                ? "opacity-100"
                : "opacity-0 pointer-events-none",
            )}
          >
            {/* Progress Bar */}
            <input
              type="range"
              dir="ltr"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              style={{
                backgroundSize: `${seekPercentage}% 100%`,
              }}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer mb-3 hover:h-2 transition-all bg-white/30 bg-gradient-to-r from-primary-500 to-primary-500 bg-no-repeat bg-left [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary-500 [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:transition-transform [&::-moz-range-thumb]:hover:scale-125"
              aria-label="Seek media"
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Volume Control */}
                <div className="group/volume flex items-center gap-2">
                  <span className="truncate grow shrink">{title}</span>

                  <button
                    onClick={toggleMute}
                    className="flex items-center justify-center w-8 h-8 hover:bg-white/20 rounded-full transition-all"
                    aria-label={isMuted ? "Unmute" : "Mute"}
                  >
                    <VolumeIcon size={20} className="text-white" />
                  </button>
                  <input
                    type="range"
                    dir="ltr"
                    min={0}
                    max={1}
                    step={0.05}
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    style={{
                      backgroundSize: `${volumePercentage}% 100%`,
                    }}
                    className="w-16 md:group-hover/volume:w-24 h-1 rounded-full appearance-none cursor-pointer transition-all duration-300 bg-white/30 bg-gradient-to-r from-primary-500 to-primary-500 bg-no-repeat bg-left [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-2.5 [&::-moz-range-thumb]:h-2.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary-500 [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:cursor-pointer"
                    aria-label="Volume"
                  />
                </div>

                {/* Time Display */}
                <span className="text-white text-sm font-medium " dir="ltr">
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
