import { Link } from "react-router";
import type { ComponentProps } from "react";
import { cn } from "#lib/utils";

interface Props extends ComponentProps<"a"> {
  to: string;
}

export default function NavbarLink({
  to,
  className,
  children,
  ...props
}: Props) {
  return (
    <Link
      className={cn(
        "font-b1 text-content-primary px-3 py-2 hover:text-primary",
        className,
      )}
      to={to}
      {...props}
    >
      {children}
    </Link>
  );
}
