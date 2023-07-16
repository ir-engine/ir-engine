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

import React, { useEffect, useState } from 'react'
import styled, { keyframes } from 'styled-components'

import { InfoSharp } from '@mui/icons-material'

const fadeOutAnimation = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`
/**
 * PopUpContainer used as container element for PopUpIconbox and PopUpContent.
 *
 * @type {Styled component}
 */
export const PopUpContainer = styled.div<{ visible: boolean }>`
  background-color: var(--popup-bg-color, grey);
  position: fixed;
  bottom: 20px;
  left: 20px;
  display: flex;
  height: 50px;
  width: 200px; /* Default width for desktops */
  border-radius: 10px;
  z-index: 9999;
  opacity: ${(props) => (props.visible ? 1 : 0)};
  transition: opacity 0.5s ease-in-out;

  @media (max-width: 768px) {
    /* Adjust the width for tablets */
    width: 80%;
    max-width: 400px;
  }

  @media (max-width: 480px) {
    /* Adjust the width for phones */
    width: 90%;
    max-width: 320px;
  }
`

/**
 * PopupIconBox used for providing styles to the iconbox.
 *
 * @type {Styled component}
 */
export const PopUpIconBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--icon-bg-color, #f0f0f0);
  width: 50px;
  height: 50px;
  border-radius: 10px;
`

/**
 * PopupContent used to provide styles for the popup body content.
 *
 * @type {Styled component}
 */
export const PopUpContent = styled.div`
  color: var(--textColor, white);
  display: flex;
  flex: 1;
  flex-direction: row;
  overflow: hidden;
  padding: 8px;
  min-height: 50px;
  align-items: center;
  justify-content: flex-start;
`

/**
 * declaring props for Popup component.
 *
 * @type {Props}
 */
interface Props {
  tag?
  message?
  visibleDuration?
  icon?
  className?
}

/**
 * Popup used to render view for message and timeout.
 *
 * @param  {Props}
 * @constructor
 */
const PopUp = ({ tag, message, visibleDuration = 3000, icon: Icon = InfoSharp, className }: Props) => {
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
    }, visibleDuration)

    return () => clearTimeout(timer)
  }, [visibleDuration])
  return (
    <PopUpContainer visible={visible} className={className} as={tag}>
      <PopUpIconBox className={className}>
        <Icon />
      </PopUpIconBox>
      <PopUpContent>{message}</PopUpContent>
    </PopUpContainer>
  )
}

export default PopUp
