import { Input } from "#components/ui/input";
import { cn } from "#lib/utils";
import { forwardRef } from "react";

// 1. Define an interface that allows 'null' for the value
interface FormInputProps extends Omit<
  React.ComponentProps<"input">,
  "value" | "onChange"
> {
  value?: string | number | null;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  nullable?: boolean;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ nullable = true, className, type, value, onChange, ...props }, ref) => {
    const isNumber = type === "number";

    return (
      <Input
        ref={ref}
        type={type}
        className={cn(
          "bg-white border border-gray rounded-[28px] p-[20px]",
          className,
        )}
        value={value ?? ""}
        onChange={(e) => {
          const inputValue = e.target.value;

          if (nullable) {
            if (inputValue === "") {
              // We construct a synthetic event to pass null back to react-hook-form
              onChange?.({
                ...e,
                target: {
                  ...e.target,
                  value: null as any,
                },
              });
            } else {
              const parsedValue = isNumber ? Number(inputValue) : inputValue;
              onChange?.({
                ...e,
                target: {
                  ...e.target,
                  value: parsedValue as any,
                },
              });
            }
          } else {
            // Standard behavior
            onChange?.(e);
          }
        }}
        {...props}
      />
    );
  },
);

FormInput.displayName = "FormInput";
