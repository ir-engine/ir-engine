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
const LinkedinSquareTrue = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
    <path fill="#1265BF" d="M0 0h48v48H0z" />
    <g fill="#fff">
      <path d="M10.774 14.907a4.164 4.164 0 1 0 0-8.328 4.164 4.164 0 0 0 0 8.328M18.751 17.984h6.901v3.162S27.525 17.4 32.62 17.4c4.546 0 8.31 2.24 8.31 9.065v14.391h-7.15V28.208c0-4.026-2.15-4.468-3.788-4.468-3.4 0-3.981 2.932-3.981 4.994v12.122h-7.26zM7.144 17.984h7.26v22.872h-7.26z" />
    </g>
  </svg>
)
const ForwardRef = forwardRef(LinkedinSquareTrue)
export default ForwardRef
