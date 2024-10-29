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
const PenTool01Sm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 16 16"
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
        strokeWidth={1.5}
        d="m13 8.666-.866-4.332c-.048-.242-.072-.363-.131-.461a.7.7 0 0 0-.209-.217c-.096-.063-.216-.092-.455-.15L2.334 1.334m0 0 2.174 9.005c.057.24.086.36.149.456q.084.129.217.208c.098.059.22.083.461.131L9.667 12M2.334 1.333 7.391 6.39m4.364 7.522 3.158-3.158c.264-.264.396-.396.445-.548a.67.67 0 0 0 0-.412c-.049-.153-.18-.285-.445-.549l-.491-.491c-.264-.264-.397-.396-.549-.446a.67.67 0 0 0-.412 0c-.152.05-.284.182-.548.446l-3.158 3.158c-.264.264-.396.396-.446.548a.67.67 0 0 0 0 .412c.05.153.182.285.446.549l.491.491c.264.264.396.396.549.446a.67.67 0 0 0 .412 0c.152-.05.284-.182.548-.446M9.667 7.333a1.333 1.333 0 1 1-2.666 0 1.333 1.333 0 0 1 2.666 0"
      />
    </g>
    <defs>
      <clipPath id="prefix__a">
        <path fill="#fff" d="M0 0h16v16H0z" />
      </clipPath>
    </defs>
  </svg>
)
const ForwardRef = forwardRef(PenTool01Sm)
export default ForwardRef
