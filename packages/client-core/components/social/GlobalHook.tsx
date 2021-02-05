import { loginUser } from "./GlobalState";

import { useRecoilState } from "recoil";

export const LoginUserHook = () => {
  const [loginUserData, setLoginUserData] = useRecoilState(loginUser);

  const data = loginUserData as any;
  const setLoginUser = (newData: any) => setLoginUserData(newData);

  return { data, setLoginUser };
};
