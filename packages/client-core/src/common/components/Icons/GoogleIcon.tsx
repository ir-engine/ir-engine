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

export const GoogleIcon = (props: SvgIconProps) => {
  return (
    <SvgIcon {...props}>
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clipPath="url(#clip0)">
          <path
            d="M39.6104 20.4604C39.6104 19.1009 39.5002 17.734 39.265 16.3965H20.4004V24.0981H31.2033C30.755 26.582 29.3146 28.7794 27.2055 30.1756V35.1729H33.6505C37.4352 31.6895 39.6104 26.5453 39.6104 20.4604Z"
            fill="#4285F4"
          />
          <path
            d="M20.3998 40.0015C25.7939 40.0015 30.3429 38.2305 33.6572 35.1733L27.2123 30.1761C25.4191 31.396 23.1042 32.0868 20.4072 32.0868C15.1895 32.0868 10.7654 28.5667 9.17809 23.834H2.52734V28.9856C5.92253 35.7392 12.8378 40.0015 20.3998 40.0015Z"
            fill="#34A853"
          />
          <path
            d="M9.17129 23.8345C8.33351 21.3506 8.33351 18.6609 9.17129 16.177V11.0254H2.52789C-0.308777 16.6767 -0.308777 23.3348 2.52789 28.9861L9.17129 23.8345Z"
            fill="#FBBC04"
          />
          <path
            d="M20.3998 7.9161C23.2512 7.87201 26.007 8.94494 28.0721 10.9144L33.7822 5.20436C30.1665 1.80917 25.3677 -0.0574433 20.3998 0.00134778C12.8378 0.00134778 5.92253 4.2637 2.52734 11.0247L9.17074 16.1763C10.7507 11.4362 15.1821 7.9161 20.3998 7.9161Z"
            fill="#EA4335"
          />
        </g>
        <defs>
          <clipPath id="clip0">
            <rect width="40" height="40" fill="white" />
          </clipPath>
        </defs>
      </svg>
    </SvgIcon>
  )
}
