import AtieLogo from "#components/icons/atie-logo";
import SearchIcon from "#components/icons/search-icon";
import { Separator } from "#components/ui/separator";
import { cn } from "#lib/utils";
import NavbarLink from "./navbar-link";
import { useAppDispatch, useAppSelector } from "#hooks/redux-hooks";
import { Button } from "#components/ui/button";
import { sharedActions } from "../../features/shared/shared-slice";
import { authActions } from "../../features/auth/auth-slice";

const links = [
  { text: "صفحه اصلی", to: "/" },
  { text: "دوره‌های آموزشی", to: "/Courses" },
  { text: "درباره ما", to: "/About" },
  { text: "تماس با ما", to: "/Contact" },
];

export default function Navbar() {
  const { isAuth, user } = useAppSelector((s) => s.auth);
  const dis = useAppDispatch();

  return (
    <>
      <div className={cn("flex flex-col ")}>
        <div className={cn("flex items-center justify-between py-3 px-6")}>
          <div className={cn("flex text-sm items-end gap-4")}>
            <AtieLogo />

            {isAuth ? (
              <div className={cn("flex gap-4 items-center")}>
                <Button
                  size={"xs"}
                  variant={"secondary"}
                  onClick={() => dis(authActions.logout())}
                >
                  {"خروج"}
                </Button>
                <span className={cn("text-sm text-content-tertiary")}>
                  {user?.firstName + " " + user?.lastName}
                </span>
              </div>
            ) : (
              <Button
                size={"xs"}
                variant={"primary"}
                onClick={() =>
                  dis(sharedActions.setIsOpenLogin({ isOpen: true }))
                }
              >
                {"ورود"}
              </Button>
            )}
          </div>

          <SearchIcon />
        </div>

        <Separator className={cn("p-0! m-0")} />

        <div className={cn("flex items-center gap-1.5 py-2 px-6")}>
          {links.map((link) => (
            <NavbarLink to={link.to}>{link.text}</NavbarLink>
          ))}
        </div>
      </div>
    </>
  );
}
