import type { ComponentProps } from "react";

export default function SearchIcon(props: ComponentProps<"svg">) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M14.667 3C21.1102 3.00018 26.333 8.22378 26.333 14.667C26.3329 17.5287 25.3008 20.1481 23.5908 22.1777L28.707 27.293C29.0975 27.6834 29.0974 28.3165 28.707 28.707C28.3165 29.0976 27.6835 29.0976 27.293 28.707L22.1768 23.5918C20.1473 25.3013 17.5282 26.3329 14.667 26.333C8.22378 26.333 3.00018 21.1102 3 14.667C3 8.22367 8.22367 3 14.667 3Z"
        stroke="#EBEBEB"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
}
