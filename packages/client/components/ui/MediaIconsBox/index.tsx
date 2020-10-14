import React from "react";

import './style.scss';
import { generalStateList } from '../../gl/scene';
import { Microphone } from '@styled-icons/boxicons-regular/Microphone';
import { CameraVideo } from '@styled-icons/bootstrap/CameraVideo';
import { Face } from '@styled-icons/boxicons-regular/Face'

const MediaIconsBox = (props) =>{
  return props.step === generalStateList.ALL_DONE ? 
        <section className="drawer-box-container">
          <section className="drawer-box">
            <Microphone />
            <CameraVideo />
            <Face />
          </section>
        </section>
      :null
}

export default MediaIconsBox;