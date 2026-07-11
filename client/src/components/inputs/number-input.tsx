import { Input } from "#components/ui/input";
import { type ControllerRenderProps } from "react-hook-form";

// Helper to clean value (reusable)
/* const cleanNumberValue = (value: string): number => {
  const cleaned = value.replace(/[^0-9]/g, "");
  return cleaned === "" ? NaN : Number(cleaned);
}; */

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  field: ControllerRenderProps<any, any>; // Accepts the 'field' prop from RHF
}

const NumberInput = ({
  field: { onChange, value, ...field },
  ...props
}: Props) => {
  // 1. Format the value for Display (e.g., 1000000 -> "1,000,000")
  // We handle the 'NaN' case (initial state) by showing an empty string
  const displayValue =
    value != null && !Number.isNaN(value) ? value.toLocaleString() : "";

  // 2. Handle Change: Parse string -> Number -> Pass to RHF
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;

    // Remove non-numeric characters
    const numericString = rawValue.replace(/[^0-9]/g, "");

    // Convert to number (or NaN if empty)
    const numberValue = numericString === "" ? NaN : Number(numericString);

    // Update RHF state with the NUMBER
    onChange(numberValue);
  };

  return (
    <Input
      {...props}
      {...field}
      value={displayValue}
      onChange={handleChange}
      inputMode="numeric"
    />
  );
};

export default NumberInput;
