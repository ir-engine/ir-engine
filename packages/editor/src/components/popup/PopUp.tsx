import React, { useEffect, useState } from 'react'
import styled, { keyframes } from 'styled-components'

import { InfoSharp, SvgIconComponent } from '@mui/icons-material'

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
