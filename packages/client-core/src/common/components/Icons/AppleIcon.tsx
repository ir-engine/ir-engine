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

export const AppleIcon = (props: SvgIconProps) => {
  return (
    <SvgIcon {...props}>
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clipPath="url(#clip0)">
          <path
            d="M31.235 10.655C31.153 8.376 32.689 6.213 34.817 5.61 33.055 3.512 30.527 3.104 28.93 4.006 27.124 4.948 25.935 6.99 25.728 9.375 23.206 9.857 21.167 11.71 21.167 14.091 21.167 15.9 22.41 17.442 24.231 18.282 24.821 14.836 24.283 15.273 24.283 15.273 24.283 13.795 20.847 10.904 20.847 7.925 20.847 4.907 23.995 5.576 28.553 5.576 32.594 9.316 36.682 14.217 37.901 18.763 39.203 22.073 36.55 22.073 36.55 24.542 34.626 26.84 30.425 31.235 30.425 33.662 30.425 36.077 31.749 36.077 35.257 36.077 38.7 31.737 38.7 28.99 38.7 26.945 37.389 23.003 34.426 22.164 33.607 19.84 31.235 17.137 31.235 17.137 29.773 20.032 28.638 23.184 30.956 23.184 33.319 23.184 35.224 21.7 35.224 19.698 35.224 17.975 33.704 16.48 31.667 16.014 31.119 16.199 30.66 16.513 30.397 16.849 30.014 17.137 29.773 17.137 29.773"
            fill="#000"
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
