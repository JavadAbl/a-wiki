// components/utils/show.tsx
interface ShowProps {
  when: unknown;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function Show({ when, children, fallback = null }: ShowProps) {
  return !!when ? <>{children}</> : <>{fallback}</>;
}
