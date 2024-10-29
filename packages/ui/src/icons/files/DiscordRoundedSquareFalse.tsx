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
const DiscordRoundedSquareFalse = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      <path
        fill="#080808"
        fillRule="evenodd"
        d="M1.153 5.39C.027 7.558.027 10.405.027 16.1v15.8c0 5.695 0 8.542 1.126 10.71a10 10 0 0 0 4.265 4.264C7.585 48 10.432 48 16.128 48h15.8c5.694 0 8.542 0 10.71-1.126a10 10 0 0 0 4.264-4.264c1.125-2.168 1.125-5.015 1.125-10.71V16.1c0-5.695 0-8.542-1.126-10.71a10 10 0 0 0-4.264-4.264C40.47 0 37.622 0 31.927 0h-15.8c-5.695 0-8.542 0-10.71 1.126A10 10 0 0 0 1.154 5.39m27.995 4.892a29.7 29.7 0 0 1 7.327 2.273q.031.012.047.043c4.066 5.98 6.074 12.725 5.323 20.49a.12.12 0 0 1-.047.083c-3.08 2.261-6.062 3.634-9.003 4.544a.11.11 0 0 1-.127-.043 24 24 0 0 1-1.837-2.99.115.115 0 0 1 .06-.16c.981-.37 1.914-.813 2.81-1.337a.115.115 0 0 0 .01-.191c-.19-.142-.379-.29-.559-.439a.11.11 0 0 0-.117-.014c-5.823 2.69-12.201 2.69-18.093 0a.11.11 0 0 0-.116.016c-.18.148-.369.295-.558.437a.115.115 0 0 0 .012.191c.896.514 1.829.967 2.808 1.339a.114.114 0 0 1 .062.158 21.3 21.3 0 0 1-1.839 2.991.12.12 0 0 1-.126.042 29.9 29.9 0 0 1-8.99-4.544.12.12 0 0 1-.046-.084c-.627-6.717.651-13.518 5.318-20.49a.1.1 0 0 1 .048-.042 29.6 29.6 0 0 1 7.328-2.273.12.12 0 0 1 .118.056c.318.562.681 1.284.927 1.874a27.4 27.4 0 0 1 8.23 0c.245-.577.596-1.312.912-1.874a.11.11 0 0 1 .118-.056M14.795 25.368c0 2 1.461 3.629 3.235 3.629 1.802 0 3.235-1.629 3.235-3.629.029-1.985-1.419-3.628-3.235-3.628-1.802 0-3.235 1.629-3.235 3.628m11.962 0c0 2 1.461 3.629 3.235 3.629 1.816 0 3.235-1.629 3.235-3.629.029-1.985-1.419-3.628-3.235-3.628-1.802 0-3.235 1.629-3.235 3.628"
        clipRule="evenodd"
      />
    </g>
    <defs>
      <clipPath id="prefix__a">
        <path fill="#fff" d="M0 0h48v48H0z" />
      </clipPath>
    </defs>
  </svg>
)
const ForwardRef = forwardRef(DiscordRoundedSquareFalse)
export default ForwardRef
