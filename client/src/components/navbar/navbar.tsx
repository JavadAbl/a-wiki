import AtieLogo from "#components/icons/atie-logo";
import SearchIcon from "#components/icons/search-icon";
import { Separator } from "#components/ui/separator";
import { cn } from "#lib/utils";
import NavbarLink from "./navbar-link";

export default function Navbar() {
  return (
    <div className={cn("flex flex-col ")}>
      <div className={cn("flex items-center justify-between py-4 px-6")}>
        <AtieLogo />

        <SearchIcon />
      </div>

      <Separator />

      <div className={cn("flex items-center py-4 px-6")}>
        <NavbarLink to="/">{"test"}</NavbarLink>
      </div>
    </div>
  );
}
