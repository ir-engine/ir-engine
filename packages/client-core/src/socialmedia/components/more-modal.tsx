import React from "react";
import { Modal } from "./Modal";
import { ModalStateHook} from "./ModalHook";
import { useHistory } from "react-router-dom";
export function MoreModalItems() {
    const { modalData } = ModalStateHook();
    const data = modalData;
    const history = useHistory();
    return (<Modal>
      <button type='button' className="modal-box-item h-12 bg-white w-full text-14-bold text-red" onClick={() => console.log("test")}>
        Report Inappropriate
      </button>
      <button type='button' className="modal-box-item h-12 bg-white w-full text-14-bold text-red">
        Unfollow
      </button>
      <button type='button' className="modal-box-item h-12 bg-white w-full text-14-light" onClick={() => history.push(`/post/${(data as any).pid}`)}>
        Go to Post
      </button>
      <button type='button' className="modal-box-item h-12 bg-white w-full text-14-light">
        Share
      </button>
      <button type='button' className="modal-box-item h-12 bg-white w-full text-14-light">
        Copy Link
      </button>
      <button type='button' className="modal-box-item h-12 bg-white w-full text-14-light">
        Embed
      </button>
      <button type='button' className="modal-box-item h-12 bg-white w-full text-14-light">
        Cancel
      </button>
    </Modal>);
}
