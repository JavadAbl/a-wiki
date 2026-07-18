import { useAppSelector } from "#hooks/redux-hooks";
import { cn } from "#lib/utils";
import { skipToken } from "@reduxjs/toolkit/query";
import { useContentGetURLByIdQuery } from "../../../../features/course/course-api";
import { useEffect, useRef, useState } from "react";

export default function CourseBrowserPlayer() {
  const {
    courseBrowserSelectedContent: selectedContent,
    courseBrowserSelectedCourse: selectedCourse,
  } = useAppSelector((s) => s.course);

  // 1. Extract `refetch` from the hook
  const {
    data: urlRes,
    isLoading,
    isError,
    refetch,
  } = useContentGetURLByIdQuery(
    selectedContent ? selectedContent.id : skipToken,
    {
      refetchOnMountOrArgChange: true, // Forces fresh URL on mount/lesson change
    },
  );

  const url = urlRes?.url;
  const mediaType = selectedContent?.mediaType;
  const thumbnailUrl =
    selectedCourse?.thumbnailUrl || "/images/course-cover.webp";
  const title = selectedContent?.title;

  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);

  // 2. State to track recovery during a TTL expiration
  const [resumeTime, setResumeTime] = useState<number | null>(null);
  const [hasRetried, setHasRetried] = useState(false);

  // Reset states when the lesson changes
  useEffect(() => {
    setIsPlaying(false);
    setHasRetried(false);
    setResumeTime(null);
  }, [selectedContent?.id]);

  const handlePlay = () => {
    if (mediaRef.current) {
      mediaRef.current.play();
    }
  };

  const handlePause = () => {
    if (mediaRef.current?.seeking) return;
    setIsPlaying(false);
  };

  // 3. Handle the TTL Expiration Error
  const handleMediaError = () => {
    // Only retry once to prevent infinite error loops
    if (!hasRetried && mediaRef.current) {
      console.warn("Media error detected. Attempting to refresh URL...");
      setResumeTime(mediaRef.current.currentTime); // Save current timestamp
      setHasRetried(true); // Prevent future retries for this session
      refetch(); // Fetch a fresh URL from the server
    }
  };

  // 4. Resume playback once the fresh URL is loaded
  const handleLoadedData = () => {
    if (resumeTime !== null && mediaRef.current) {
      mediaRef.current.currentTime = resumeTime; // Seek to saved time
      setResumeTime(null); // Clear the saved time
      mediaRef.current.play(); // Resume playing
      setIsPlaying(true);
    }
  };

  return (
    <div
      className={cn(
        "relative flex items-center justify-center bg-primary-500 p-[16px_12px] rounded-[20px] gap-[16px] text-content-secondary h-full w-full overflow-hidden",
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

      {/* Main Player UI */}
      {url && (
        <>
          {/* 1. Thumbnail Background */}
          <img
            src={thumbnailUrl}
            alt="Course thumbnail"
            className={cn(
              "absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-300 bg-black",
              mediaType === "Video" && isPlaying ? "opacity-0" : "opacity-100",
            )}
          />

          {/* 2. Light Shadow Overlay */}
          <div
            className={cn(
              "absolute inset-0 bg-black/40 z-10 transition-opacity duration-300",
              isPlaying ? "opacity-0" : "opacity-100",
            )}
          />

          {/* 3. Media Elements (Video / Audio) */}
          {mediaType === "Video" ? (
            <video
              ref={mediaRef as React.RefObject<HTMLVideoElement>}
              src={url}
              controls={isPlaying}
              onPlay={() => setIsPlaying(true)}
              onPause={handlePause}
              onEnded={() => setIsPlaying(false)}
              onError={handleMediaError} // <-- Attached Error Handler
              onLoadedData={handleLoadedData} // <-- Attached Resume Handler
              className="absolute inset-0 w-full h-full object-contain z-20"
            />
          ) : (
            <audio
              ref={mediaRef as React.RefObject<HTMLAudioElement>}
              src={url}
              controls={isPlaying}
              onPlay={() => setIsPlaying(true)}
              onPause={handlePause}
              onEnded={() => setIsPlaying(false)}
              onError={handleMediaError} // <-- Attached Error Handler
              onLoadedData={handleLoadedData} // <-- Attached Resume Handler
              className={cn(
                "absolute left-1/2 -translate-x-1/2 w-[90%] z-30 transition-all duration-300",
                isPlaying
                  ? "bottom-4 opacity-100"
                  : "-bottom-20 opacity-0 pointer-events-none",
              )}
            />
          )}

          {/* 4. Center Play Button */}
          {!isPlaying && (
            <button
              onClick={handlePlay}
              className="absolute z-40 flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/40 transition-all duration-200 group"
              aria-label="Play media"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="white"
                className="ml-1 group-hover:scale-110 transition-transform"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          )}

          {/* 5. Title Footer (Replaced by native controls when playing) */}
          {!isPlaying && (
            <div className="absolute bottom-0 left-0 right-0 p-4 z-20 bg-gradient-to-t from-black/80 to-transparent">
              <p className="text-white font-medium truncate text-lg">{title}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
