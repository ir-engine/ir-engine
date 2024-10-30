/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const DiscordSquareTrue = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 48 48"
    role="img"
    stroke="currentColor"
    ref={ref}
    {...props}
  >
    <g clipPath="url(#prefix__a)">
      <path fill="#5865F2" d="M0 0h48v48H0z" />
      <path
        fill="#fff"
        d="M36.476 12.555a29.7 29.7 0 0 0-7.328-2.273.11.11 0 0 0-.118.056 21 21 0 0 0-.912 1.874 27.4 27.4 0 0 0-8.23 0 19 19 0 0 0-.927-1.874.12.12 0 0 0-.118-.056 29.6 29.6 0 0 0-7.328 2.273.1.1 0 0 0-.048.041C6.8 19.57 5.522 26.37 6.15 33.086a.12.12 0 0 0 .047.085 29.9 29.9 0 0 0 8.989 4.544.12.12 0 0 0 .126-.041 21.4 21.4 0 0 0 1.84-2.992.114.114 0 0 0-.063-.158 19.7 19.7 0 0 1-2.808-1.339.115.115 0 0 1-.012-.191c.189-.141.378-.289.558-.437a.11.11 0 0 1 .116-.016c5.892 2.69 12.27 2.69 18.093 0a.11.11 0 0 1 .117.014c.18.149.37.298.56.439a.115.115 0 0 1-.01.191c-.897.525-1.83.968-2.81 1.337a.115.115 0 0 0-.061.16 24 24 0 0 0 1.837 2.99c.029.04.08.058.127.043 2.941-.91 5.924-2.283 9.003-4.544a.12.12 0 0 0 .047-.083c.75-7.765-1.257-14.51-5.323-20.49a.1.1 0 0 0-.047-.043M18.03 28.997c-1.774 0-3.235-1.628-3.235-3.628s1.433-3.629 3.235-3.629c1.816 0 3.264 1.643 3.235 3.629 0 2-1.433 3.628-3.235 3.628m11.962 0c-1.774 0-3.235-1.628-3.235-3.628s1.433-3.629 3.235-3.629c1.816 0 3.264 1.643 3.235 3.629 0 2-1.419 3.628-3.235 3.628"
      />
    </g>
    <defs>
      <clipPath id="prefix__a">
        <path fill="#fff" d="M0 0h48v48H0z" />
      </clipPath>
    </defs>
  </svg>
)
const ForwardRef = forwardRef(DiscordSquareTrue)
export default ForwardRef
