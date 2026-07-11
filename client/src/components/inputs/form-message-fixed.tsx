// components/ui/form-message-fixed.tsx

import { FieldError } from "#components/ui/field";
import clsx from "clsx";

interface Props {
  className?: string;
}

export function FormMessageFixed({ className }: Props) {
  return (
    <div className={clsx("min-h-[25px]", className)}>
      <FieldError />
    </div>
  );
}
