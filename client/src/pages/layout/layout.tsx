import Footer from "#components/footer/footer";
import Navbar from "#components/navbar/navbar";
import { useAppDispatch, useAppSelector } from "#hooks/redux-hooks";
import { Outlet } from "react-router";
import { sharedActions } from "../../features/shared/shared-slice";
import Login from "../login/login";

export default function Layout() {
  const { isOpenLogin, loginRedirect } = useAppSelector((s) => s.shared);
  const dis = useAppDispatch();
  return (
    <div>
      <Navbar />
      {<Outlet />}
      <Footer />

      <Login
        isOpen={isOpenLogin}
        setIsOpen={(isOpen: boolean) =>
          dis(sharedActions.setIsOpenLogin({ isOpen }))
        }
        redirect={loginRedirect}
      />
    </div>
  );
}
