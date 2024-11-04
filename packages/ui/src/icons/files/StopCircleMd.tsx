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
const StopCircleMd = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
    <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} clipPath="url(#prefix__a)">
      <path d="M10 18.334a8.333 8.333 0 1 0 0-16.667 8.333 8.333 0 0 0 0 16.667" />
      <path d="M6.666 8c0-.466 0-.7.09-.878a.83.83 0 0 1 .365-.364c.178-.091.412-.091.878-.091h4c.467 0 .7 0 .879.09.156.08.284.208.364.365.09.178.09.412.09.878v4c0 .467 0 .7-.09.879a.83.83 0 0 1-.364.364c-.179.09-.412.09-.879.09H8c-.466 0-.7 0-.878-.09a.83.83 0 0 1-.364-.364c-.091-.179-.091-.412-.091-.879z" />
    </g>
    <defs>
      <clipPath id="prefix__a">
        <path fill="#fff" d="M0 0h20v20H0z" />
      </clipPath>
    </defs>
  </svg>
)
const ForwardRef = forwardRef(StopCircleMd)
export default ForwardRef
