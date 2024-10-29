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
const Stars02 = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 20 20"
    role="img"
    stroke="currentColor"
    ref={ref}
    {...props}
  >
    <g clipPath="url(#prefix__a)">
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M3.75 18.334v-4.167m0-8.333V1.667M1.665 3.75h4.167m-4.167 12.5h4.167m5-13.75L9.388 6.258c-.235.61-.353.916-.536 1.173a2.5 2.5 0 0 1-.588.589c-.257.183-.563.3-1.174.535L3.333 10l3.757 1.445c.611.236.917.353 1.174.536.227.162.426.36.588.588.183.257.3.563.536 1.174l1.445 3.757 1.445-3.757c.235-.611.352-.917.535-1.174a2.5 2.5 0 0 1 .589-.588c.257-.183.562-.3 1.173-.536L18.333 10l-3.758-1.445c-.61-.235-.916-.352-1.173-.535a2.5 2.5 0 0 1-.589-.589c-.183-.257-.3-.562-.535-1.173z"
      />
    </g>
    <defs>
      <clipPath id="prefix__a">
        <path fill="#fff" d="M0 0h20v20H0z" />
      </clipPath>
    </defs>
  </svg>
)
const ForwardRef = forwardRef(Stars02)
export default ForwardRef
