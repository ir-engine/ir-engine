import { atom } from "recoil";

const modalState = atom({
  key: "modal_state",
  default: {
    showModal: false,
    data: {},
  },
});

export { modalState };
