import React from 'react'
import styled from 'styled-components'

import Dialog from './Dialog'

/**
 * LeftContent used to provide styles for left div.
 *
 * @author Robert Long
 * @type {Styled component}
 */
const LeftContent = (styled as any).div`
  display: flex;
  width: 360px;
  border-top-left-radius: inherit;
  align-items: center;
  padding: 30px;

  img {
    border-radius: 6px;
  }
`

/**
 * RightContent used to provide styles to Right div.
 *
 * @author Robert Long
 * @type {Styled component}
 */
const RightContent = (styled as any).div`
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 30px 30px;
`

/**
 * PreviewDialog provides the dialog containing image on left side and content on right side.
 *
 * @author Robert Long
 * @param       {String} imageSrc
 * @param       {node} children [contains component with message content]
 * @param       {any} props
 * @constructor
 */
export function PreviewDialog({ imageSrc, children, ...props }) {
  return (
    <Dialog {...props}>
      <LeftContent>
        <img src={imageSrc} />
      </LeftContent>
      <RightContent>{children}</RightContent>
    </Dialog>
  )
}

export default PreviewDialog
