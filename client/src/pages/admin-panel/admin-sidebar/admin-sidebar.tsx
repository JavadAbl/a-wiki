// src/components/sidebar.tsx
import { NavLink, useNavigate } from "react-router";
import { Button } from "#components/ui/button";
import {
  BookOpen,
  ChartBarIncreasingIcon,
  LogOut, // Changed from ChevronRightIcon for better UX
  Users,
} from "lucide-react";
import { cn } from "#lib/utils";
import { Separator } from "#components/ui/separator";

export function AdminSidebar() {
  const nav = useNavigate();

  // Helper function to generate classes for the NavLink
  const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex items-center w-full rounded-md text-sm font-medium transition-colors",
      isActive
        ? "bg-accent text-accent-foreground" // Visible active state
        : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground", // Muted inactive state
    );

  return (
    <aside className="w-56 h-screen border-l border-neutral-300 bg-surface-100 p-4 flex flex-col gap-2 shadow-xl">
      {/* Header / Brand */}
      <div className="flex-1 flex flex-col gap-1">
        <div className="font-bold text-lg mb-4 px-2 text-foreground">
          پنل ادمین
        </div>

        {/* Navigation Links */}
        <NavLink to="/Admin/Courses" className={getNavLinkClass}>
          {({ isActive }) => (
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-2",
                isActive && "bg-transparent hover:bg-transparent",
              )}
            >
              <BookOpen size={18} />
              <span>دوره ها</span>
            </Button>
          )}
        </NavLink>

        <NavLink to="/Admin/Categories" className={getNavLinkClass}>
          {({ isActive }) => (
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-2",
                isActive && "bg-transparent hover:bg-transparent",
              )}
            >
              <ChartBarIncreasingIcon size={18} />
              <span>دسته بندی ها</span>{" "}
            </Button>
          )}
        </NavLink>

        <NavLink to="/Admin/Users" className={getNavLinkClass}>
          {({ isActive }) => (
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-2",
                isActive && "bg-transparent hover:bg-transparent",
              )}
            >
              <Users size={18} />
              <span>کاربران</span>{" "}
            </Button>
          )}
        </NavLink>
      </div>

      {/* Footer */}
      <Separator className="my-2" />
      <div>
        <Button
          variant="outline" // Changed from destructive to outline for a cleaner footer
          size="sm"
          className="w-full justify-start gap-2 font-normal text-sm text-muted-foreground hover:text-destructive hover:border-destructive"
          onClick={() => nav("/")}
        >
          <LogOut size={16} />
          <span>بازگشت به سایت</span>
        </Button>
      </div>
    </aside>
  );
}
