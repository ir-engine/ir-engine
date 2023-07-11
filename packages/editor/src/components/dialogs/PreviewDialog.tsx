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

import React from 'react'
import styled from 'styled-components'

import Dialog from './Dialog'

/**
 * LeftContent used to provide styles for left div.
 *
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
 * @param       {String} imageSrc
 * @param       {node} children [contains component with message content]
 * @param       {any} props
 * @constructor
 */
export function PreviewDialog({ imageSrc, children, ...props }) {
  return (
    <Dialog {...props}>
      <LeftContent>
        <img src={imageSrc} alt="" crossOrigin="anonymous" />
      </LeftContent>
      <RightContent>{children}</RightContent>
    </Dialog>
  )
}

export default PreviewDialog
