import React, { useState, useRef } from "react";
import ModalStateHook from "../hooks/modal_hook";

export default function Modal({ children }) {
  const { showModal, modalData, setModal } = ModalStateHook();
  return (
    <div
      className={`modal-container flex items-center justify-center ${
        !showModal && "hidden"
      }`}
      onClick={() => setModal(false)}
    >
      <div className="modal-box relative mx-6">{children}</div>
    </div>
  );
}
