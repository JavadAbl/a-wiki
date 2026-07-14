import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
} from "lucide-react";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          // Base toast (uses your CSS variables)
          toast:
            "cn-toast border shadow-lg rounded-[var(--border-radius)] bg-[var(--normal-bg)] text-[var(--normal-text)] border-[var(--normal-border)]",
          // Variant styles – light backgrounds only, no dark mode
          success: "!bg-green-100 !text-green-800 !border-green-400",
          error: "!bg-red-100 !text-red-800 !border-red-400",
          warning: "!bg-yellow-100 !text-yellow-800 !border-yellow-400",
          info: "!bg-blue-100 !text-blue-800 !border-blue-400",
          loading: "!bg-gray-100 !text-gray-800 !border-gray-400",
          // Optional: title & description styling
          title: "font-medium",
          description: "text-sm opacity-90",
          actionButton:
            "bg-primary text-primary-foreground hover:bg-primary/90",
          cancelButton: "bg-muted text-muted-foreground hover:bg-muted/90",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
