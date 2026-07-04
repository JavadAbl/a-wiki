import { Link } from "react-router";
import { cn } from "../../utils/Cn";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-base-200 px-4">
      <div className="text-center">
        {/* 404 Number */}
        <h1
          className={cn(
            "text-[10rem] font-extrabold leading-none tracking-tighter",
            "bg-linear-to-b from-primary/80 to-primary/20 bg-clip-text text-transparent",
            "select-none sm:text-[14rem]",
          )}
        >
          404
        </h1>

        {/* Divider */}
        <div
          className={cn(
            "mx-auto mb-6 h-px w-24",
            "bg-linear-to-r from-transparent via-primary/50 to-transparent",
          )}
        />

        {/* Message */}
        <h2 className="mb-3 text-2xl font-semibold text-base-content sm:text-3xl">
          Page Not Found
        </h2>

        <p className="mx-auto mb-10 max-w-md text-base-content/60">
          The page you're looking for doesn't exist or has been moved. Let's get
          you back on track.
        </p>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3">
          <Link
            to="/"
            className={cn(
              "btn btn-primary btn-md gap-2 px-6 shadow-md",
              "hover:shadow-lg hover:shadow-primary/25",
              "active:scale-[0.97]",
              "transition-all duration-200",
            )}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            Back to Home
          </Link>

          <button
            onClick={() => window.history.back()}
            className={cn(
              "btn btn-ghost btn-md gap-2 px-6",
              "hover:bg-base-300",
              "active:scale-[0.97]",
              "transition-all duration-200",
            )}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
