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

import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon'
import React from 'react'

export const OculusIcon = (props: SvgIconProps) => {
  return (
    <SvgIcon {...props}>
      <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
        <path d="M30.28,13.81a8.17,8.17,0,0,0-3.16-1.54,9.78,9.78,0,0,0-2-.25c-.51,0-1,0-1.52,0H16.41c-.5,0-1,0-1.52,0a9.78,9.78,0,0,0-2,.25,8.17,8.17,0,0,0-3.16,1.54,7.94,7.94,0,0,0,0,12.38,8.17,8.17,0,0,0,3.16,1.54,9.78,9.78,0,0,0,2,.25c.51,0,1,0,1.52,0h7.18c.5,0,1,0,1.52,0a9.78,9.78,0,0,0,2-.25,8.17,8.17,0,0,0,3.16-1.54,7.94,7.94,0,0,0,0-12.38Zm-3.5,8.34a2.83,2.83,0,0,1-1.17.45,7.59,7.59,0,0,1-1.26,0h-8.7a7.59,7.59,0,0,1-1.26,0,2.83,2.83,0,0,1-1.17-.45A2.64,2.64,0,0,1,12.08,20a2.59,2.59,0,0,1,1.14-2.15,2.83,2.83,0,0,1,1.17-.45,7.59,7.59,0,0,1,1.26,0h8.7a7.59,7.59,0,0,1,1.26,0,2.83,2.83,0,0,1,1.17.45A2.64,2.64,0,0,1,27.92,20,2.59,2.59,0,0,1,26.78,22.15Z" />
      </svg>
    </SvgIcon>
  )
}
