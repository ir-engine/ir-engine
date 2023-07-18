/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

// @ts-nocheck
import { SliderProps } from 'rc-slider'
import RCSlider from 'rc-slider/es/Slider'
import React from 'react'
import { createGlobalStyle } from 'styled-components'

const SliderGlobalStyles = createGlobalStyle`
  .rc-slider {
    display: flex;
    flex: 1;
    height: 1px;
    margin-right: 28px;
    position: relative;
    border-radius: 2px;
  }

  .rc-slider-track {
    position: absolute;
    height: 2px;
    background-color: var(--buttonOutlined);
    border-radius: 2px;
  }

  .rc-slider-rail {
    position: absolute;
    width: calc(100% + 16px);
    height: 2px;
    background-color: var(--border);
    border-radius: 2px;
  }

  .rc-slider-handle {
    position: absolute;
    margin-top: -5px;
    width: 12px;
    height: 12px;
    cursor: pointer;
    border-radius: 50%;
    border: solid 2px var(--white);
    background-color: var(--border);
    touch-action: pan-x;
    outline: none;

      &:hover {
        border: solid 2px var(--buttonOutlined);
        background-color: var(--white);
      }

      &:active {
        border:  2px solid var(--buttonOutlined);
        background-color: var(--white);
      }
    }

  .rc-slider-disabled {
    background-color: var(--inputBackground);
    border-radius: 2px;

    .rc-slider-track {
      background-color: var(--inputBackground);
    }

    .rc-slider-handle, .rc-slider-dot {
      border-color: var(--inputBackground);
      box-shadow: none;
      background-color: var(--toolbar);
      cursor: not-allowed;
    }

    .rc-slider-mark-text, .rc-slider-dot {
      cursor: not-allowed!important;
    }
  }
`
/**
 *
 * @param props
 * @returns
 */
export default function Slider(props: SliderProps) {
  return (
    <>
      <RCSlider {...props} />
      <SliderGlobalStyles />
    </>
  )
}
