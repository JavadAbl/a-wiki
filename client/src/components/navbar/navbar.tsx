import AtieLogo from "#components/icons/atie-logo";
import SearchIcon from "#components/icons/search-icon";
import { Separator } from "#components/ui/separator";
import { cn } from "#lib/utils";
import NavbarLink from "./navbar-link";

const links = [
  { text: "صفحه اصلی", to: "/" },
  { text: "دوره‌های آموزشی", to: "/Courses" },
  { text: "درباره ما", to: "/About" },
  { text: "تماس با ما", to: "/Contact" },
];

export default function Navbar() {
  return (
    <div className={cn("flex flex-col ")}>
      <div className={cn("flex items-center justify-between py-3 px-6")}>
        <AtieLogo />

        <SearchIcon />
      </div>

      <Separator className={cn("p-0! m-0")} />

      <div className={cn("flex items-center gap-1.5 py-2 px-6")}>
        {links.map((link) => (
          <NavbarLink to={link.to}>{link.text}</NavbarLink>
        ))}
      </div>
    </div>
  );
}
