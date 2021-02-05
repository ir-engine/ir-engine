import React, { useState, useRef } from "react";
import { ModalStateHook } from "./ModalHook";

export function Modal({
  children
}: any) {
  const { showModal, setModal } = ModalStateHook();
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
