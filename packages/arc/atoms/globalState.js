import { atom } from "recoil";

const loginUser = atom({
  key: "login_user",
  default: {
    username: "",
    name: "",
    image: "",
  },
});

export { loginUser };
