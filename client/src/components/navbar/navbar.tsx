import AtieLogo from "#components/icons/atie-logo";
import { Separator } from "#components/ui/separator";
import { cn } from "#lib/utils";
import NavbarLink from "./navbar-link";
import { useAppDispatch, useAppSelector } from "#hooks/redux-hooks";
import { Button } from "#components/ui/button";
import { sharedActions } from "../../features/shared/shared-slice";
import { authActions } from "../../features/auth/auth-slice";
import InputSearch from "#components/inputs/input-search";
import { useNavigate } from "react-router";
import AuthorizationComponent from "#components/auth/role-authorization-component";
import { Role } from "../../features/auth/enums/role";
import { toast } from "sonner";

const links = [
  { text: "صفحه اصلی", to: "/" },
  { text: "دوره‌های آموزشی", to: "/Courses" },
  { text: "درباره ما", to: "/About" },
  { text: "تماس با ما", to: "/Contact" },
];

export default function Navbar() {
  const nav = useNavigate();
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
                  size={"sm"}
                  variant={"destructive"}
                  onClick={() => {
                    dis(authActions.logout());
                    toast.success("حروج موفقیت آمیز");
                  }}
                >
                  {"خروج"}
                </Button>

                <AuthorizationComponent
                  allowedRoles={[Role.SuperAdmin, Role.Admin]}
                >
                  <Button
                    className={cn(" rounded-2xl")}
                    size={"sm"}
                    variant={"secondary"}
                    onClick={() => nav("/Admin")}
                  >
                    {"پنل ادمین"}
                  </Button>
                </AuthorizationComponent>

                <span className={cn("text-sm text-content-tertiary")}>
                  {user?.firstName + " " + user?.lastName}
                </span>
              </div>
            ) : (
              <Button
                size={"lg"}
                variant={"primary"}
                onClick={() =>
                  dis(sharedActions.setIsOpenLogin({ isOpen: true }))
                }
              >
                {"ورود اعضا"}
              </Button>
            )}
          </div>

          <InputSearch />
        </div>

        <Separator />

        <div className={cn("flex items-center gap-1.5 py-2 px-6")}>
          {links.map((link) => (
            <NavbarLink to={link.to}>{link.text}</NavbarLink>
          ))}
        </div>
      </div>
    </>
  );
}
