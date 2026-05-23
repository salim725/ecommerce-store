import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./store";

// Typed versions of the standard Redux hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <T>(selector: (state: RootState) => T): T =>
  useSelector(selector);

//Instead of using useDispatch and useSelector directly (which have no type info),
//  you always use useAppDispatch and useAppSelector. 
// TypeScript will then know exactly what state looks like and catch mistakes.