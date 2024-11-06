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
const FacebookOriginalTrue = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
    <path
      fill="url(#prefix__a)"
      d="M21 41.8C12.5 40.3 6 32.9 6 24c0-9.9 8.1-18 18-18s18 8.1 18 18c0 8.9-6.5 16.3-15 17.8l-1-.8h-4z"
    />
    <path
      fill="#fff"
      d="m31 29 .8-5H27v-3.5c0-1.4.5-2.5 2.7-2.5H32v-4.6c-1.3-.2-2.7-.4-4-.4-4.1 0-7 2.5-7 7v4h-4.5v5H21v12.7q1.5.3 3 .3t3-.3V29z"
    />
    <defs>
      <linearGradient id="prefix__a" x1={24} x2={24} y1={40.754} y2={6} gradientUnits="userSpaceOnUse">
        <stop stopColor="#0062E0" />
        <stop offset={1} stopColor="#19AFFF" />
      </linearGradient>
    </defs>
  </svg>
)
const ForwardRef = forwardRef(FacebookOriginalTrue)
export default ForwardRef
