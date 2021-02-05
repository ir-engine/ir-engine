import { useState } from "react";

export const LoginUserHook = () => {
  const [loginUserData, setLoginUserData] = useState({
    username: "",
    name: "",
    image: "",
  });

  const data = loginUserData as any;
  const setLoginUser = (newData: any) => setLoginUserData(newData);

  return { data, setLoginUser };
};
