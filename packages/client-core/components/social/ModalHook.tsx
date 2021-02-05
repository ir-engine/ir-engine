import { useState } from "react";

export const ModalStateHook = () => {
  const [modalState, setModalState] = useState({
    hideModal: false,
    data: {},
});

  const { hideModal, data } = modalState;
  const modalData = data;
  const setModal = (status, newData) =>
    setModalState({ hideModal: status, data: newData });

  return { hideModal, modalData, setModal };
};
