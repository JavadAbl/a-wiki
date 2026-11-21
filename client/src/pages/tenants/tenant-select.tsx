import { useState } from "react";
import { useAppDispatch, useAppSelector } from "#hooks/redux-hooks";
import { useTenantsGetManyPublicQuery } from "../../features/tenant/tenant-api";
import { storage } from "../../utils/storage";
import { Button } from "#components/ui/button";
import { Spinner } from "#components/ui/spinner";
import { cn } from "#lib/utils";
import { Role } from "../../features/auth/enums/role";
import { authActions } from "../../features/auth/auth-slice";
import Login from "../login/login";
import { Building2, ArrowLeft, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { toAbsoluteAssetUrl } from "../../features/base-api";

/**
 * Landing screen: the user picks one tenant instance ("سامانه") to work with.
 * Rendered:
 *  - full-screen by TenantGate when no instance is selected yet
 *  - as the /Tenants route to switch to another instance
 */
export default function TenantSelect() {
  const { data: tenants, isLoading } = useTenantsGetManyPublicQuery();
  const isAuth = useAppSelector((s) => s.auth.isAuth);
  const user = useAppSelector((s) => s.auth.user);
  const dis = useAppDispatch();

  const [isOpenSaLogin, setIsOpenSaLogin] = useState(false);

  const currentTenant = storage.getTenant();

  function handleSelect(tenant: {
    id: number;
    name: string;
    slug: string;
    logoUrl?: string | null;
  }) {
    if (currentTenant?.id !== tenant.id) {
      // tokens of the previous instance are invalid in the new one
      storage.clearTokens();
      dis(authActions.logout());
    }
    storage.setTenant(tenant);
    // full reload so the whole app remounts scoped to the selected instance
    window.location.replace("/");
  }

  function handleSaLogin() {
    // global super admin logs in WITHOUT a tenant (no X-Tenant-Id header)
    storage.clearTenant();
    storage.clearTokens();
    dis(authActions.logout());
    setIsOpenSaLogin(true);
  }

  const isSuperAdmin = isAuth && user?.role === Role.SuperAdmin;

  return (
    <div
      dir="rtl"
      className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-primary/5 via-background to-primary/10 p-4 sm:p-8"
    >
      <Login isOpen={isOpenSaLogin} setIsOpen={setIsOpenSaLogin} />

      <div className="w-full max-w-4xl flex flex-col items-center gap-6 sm:gap-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-2 text-primary">
            <Building2 className="h-8 w-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            انتخاب سامانه
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl">
            هر سامانه یک نمونه مستقل با کاربران، دوره‌ها و محتوای خودش است.
            برای ادامه، یک نمونه را انتخاب کنید.
          </p>
        </div>

        {isLoading ? (
          <Spinner className="h-8 w-8" />
        ) : !tenants || tenants.length === 0 ? (
          <div className="text-sm text-muted-foreground border rounded-xl px-6 py-8 bg-white/60">
            هنوز هیچ نمونه‌ای ثبت نشده است.
          </div>
        ) : (
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tenants.map((tenant) => (
              <button
                key={tenant.id}
                type="button"
                onClick={() => handleSelect(tenant)}
                className={cn(
                  "group text-start rounded-2xl border bg-white p-5 shadow-sm transition-all",
                  "hover:shadow-md hover:border-primary/40 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary/40",
                  currentTenant?.id === tenant.id && "border-primary ring-1 ring-primary/30",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    {tenant.logoUrl ? (
                      <img
                        src={toAbsoluteAssetUrl(tenant.logoUrl) ?? tenant.logoUrl}
                        alt={tenant.name}
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                        {tenant.name.slice(0, 1)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="font-bold truncate">{tenant.name}</div>
                      <div dir="ltr" className="text-xs text-muted-foreground truncate text-start">
                        {tenant.slug}
                      </div>
                    </div>
                  </div>

                  {currentTenant?.id === tenant.id && (
                    <span className="shrink-0 text-[10px] rounded-full bg-primary/10 text-primary px-2 py-1">
                      انتخاب فعلی
                    </span>
                  )}
                </div>

                {tenant.description && (
                  <p className="mt-3 text-xs text-muted-foreground line-clamp-2">
                    {tenant.description}
                  </p>
                )}

                <div className="mt-4 flex items-center gap-1 text-primary text-sm font-medium">
                  <span>ورود به سامانه</span>
                  <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="mt-2 flex flex-col sm:flex-row items-center gap-3">
          {isSuperAdmin ? (
            <Button
              variant="secondary"
              className="gap-2"
              onClick={() => window.location.replace("/Admin/Tenants")}
            >
              <ShieldCheck className="h-4 w-4" />
              {"پنل مدیر سامانه"}
            </Button>
          ) : (
            <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={handleSaLogin}>
              {"ورود مدیر سامانه (بدون انتخاب نمونه)"}
            </Button>
          )}

          {currentTenant && (
            <Button
              variant="link"
              size="sm"
              onClick={() => {
                toast.info(`سامانه فعلی: ${currentTenant.name}`);
                window.location.replace("/");
              }}
            >
              {"بازگشت به سامانه فعلی"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
