import {
  useDispatch,
  useSelector,
  type TypedUseSelectorHook,
} from "react-redux";
import type { AppDispatch, AppState } from "../features/store";

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector;
