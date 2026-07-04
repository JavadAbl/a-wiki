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
    <Link className={cn("test", className)} to={to} {...props}>
      {children}
    </Link>
  );
}
