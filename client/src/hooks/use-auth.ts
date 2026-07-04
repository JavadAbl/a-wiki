import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "./redux-hooks";
import { authActions } from "../features/auth/auth-slice";
import { useLazyGetUserByContextQuery } from "../features/auth/auth-api";
import { storage } from "../utils/storage";

export function useAuth() {
  const dis = useAppDispatch();
  const isAuth = useAppSelector((s) => s.auth.isAuth);
  const [isAuthDone, setIsAuthDone] = useState(false);
  const [fetchUser] = useLazyGetUserByContextQuery();

  useEffect(() => {
    const handleAuth = () => {
      if (isAuth) {
        setIsAuthDone(true);
        return;
      }

      const refreshToken = storage.getRefreshToken();

      if (!refreshToken) {
        dis(authActions.logout());
        setIsAuthDone(true);
        return;
      }

      fetchUser()
        .then((res) => {
          if (!res.isError && res.data) {
            const accessToken = storage.getAccessToken()!;
            dis(
              authActions.login({ user: res.data, refreshToken, accessToken }),
            );
          }
        })
        .catch(() => {
          dis(authActions.logout());
        })
        .finally(() => setIsAuthDone(true));
    };

    handleAuth();
  }, [dis, fetchUser, isAuth]);

  return { isAuthDone };
}
