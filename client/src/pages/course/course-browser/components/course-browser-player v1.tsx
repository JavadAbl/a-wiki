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
  console.log(selectedCourse?.thumbnailUrl);

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
        "relative flex items-center justify-center bg-surface-100 p-[16px_12px] rounded-[20px] gap-[16px] text-content-secondary h-full w-full overflow-hidden",
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
            <div className="flex items-center justify-between absolute bottom-0 left-0 right-0 p-4 z-20 bg-primary-500">
              <p className="text-content-secondary font-medium truncate text-lg">
                {title}
              </p>

              <div className="flex items-center gap-[4px] p-[4px] bg-surface-100 text-sm rounded-[6px]">
                <div
                  className={cn(
                    "flex items-center gap-[4px] p-[4px_8px] text-content-primary",
                    selectedContent?.mediaType === "Video" &&
                      "bg-primary-300 rounded-[6px] text-content-secondary",
                  )}
                >
                  {selectedContent?.mediaType === "Video" ? (
                    <>
                      <CameraLight />
                      <span>{"ویدیو"}</span>
                    </>
                  ) : (
                    <>
                      <CameraDark />
                    </>
                  )}
                </div>

                <div
                  className={cn(
                    "flex items-center gap-[4px] p-[4px_8px] text-content-primary",
                    selectedContent?.mediaType === "Audio" &&
                      "bg-primary-300 rounded-[6px] text-content-secondary",
                  )}
                >
                  {selectedContent?.mediaType === "Audio" ? (
                    <>
                      <SoundLight />

                      <span>{"صوتی"}</span>
                    </>
                  ) : (
                    <>
                      <SoundDark />
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
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
