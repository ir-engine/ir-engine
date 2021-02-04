import React, { useState, useRef } from "react";
import ModalStateHook from "./ModalHook";

export default function Modal({
  children
}: any) {
  const { showModal, modalData, setModal } = ModalStateHook();
  return (
    <div
      className={`modal-container flex items-center justify-center ${
        !showModal && "hidden"
      }`}
      onClick={() => setModal(false, null)}
    >
      <div className="modal-box relative mx-6">{children}</div>
    </div>
  );
}
