// components/ui/drag-scroll-container.tsx
import React, { useRef, useState, useCallback, type ReactNode } from "react";
import { cn } from "#lib/utils";

interface DragScrollContainerProps {
  children: ReactNode;
  className?: string;
  classNameItem?: string;
}

export function DragScrollContainer({
  children,
  className,
  classNameItem,
}: DragScrollContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftStart, setScrollLeftStart] = useState(0);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeftStart(containerRef.current.scrollLeft);
    // Prevent text selection while dragging
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isDragging || !containerRef.current) return;
      const x = e.pageX - containerRef.current.offsetLeft;
      const walk = (x - startX) * 1.5; // scroll speed multiplier
      containerRef.current.scrollLeft = scrollLeftStart - walk;
      e.preventDefault();
    },
    [isDragging, startX, scrollLeftStart],
  );

  const handleMouseUpOrLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "overflow-x-auto scrollbar-hide cursor-grab select-none",
        isDragging && "cursor-grabbing",
        className,
      )}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave}
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }} // hide scrollbar
    >
      <div className={cn("flex gap-4 w-max", classNameItem)}>{children}</div>
    </div>
  );
}
