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
const BezierCurve01Md = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
        d="M9.333 5.834H3.499m15 0h-5.833m0 .21c2.875.74 5 3.35 5 6.456m-13.333 0a6.67 6.67 0 0 1 5-6.456m-5.334 9.79h.667c.467 0 .7 0 .878-.091a.83.83 0 0 0 .365-.364c.09-.179.09-.412.09-.879v-.666c0-.467 0-.7-.09-.879a.83.83 0 0 0-.365-.364c-.178-.09-.411-.09-.878-.09h-.667c-.466 0-.7 0-.878.09a.83.83 0 0 0-.364.364c-.091.179-.091.412-.091.879v.666c0 .467 0 .7.09.879.08.157.208.284.365.364.178.09.412.09.878.09M10.666 7.5h.667c.466 0 .7 0 .878-.09a.83.83 0 0 0 .364-.365c.091-.178.091-.411.091-.878V5.5c0-.466 0-.7-.09-.878a.83.83 0 0 0-.365-.364c-.178-.091-.412-.091-.878-.091h-.667c-.467 0-.7 0-.878.09a.83.83 0 0 0-.364.365c-.091.178-.091.412-.091.878v.667c0 .467 0 .7.09.878.08.157.208.285.365.365.178.09.411.09.878.09m6.667 8.334h.666c.467 0 .7 0 .879-.091a.83.83 0 0 0 .364-.364c.09-.179.09-.412.09-.879v-.666c0-.467 0-.7-.09-.879a.83.83 0 0 0-.364-.364c-.179-.09-.412-.09-.879-.09h-.666c-.467 0-.7 0-.879.09a.83.83 0 0 0-.364.364c-.09.179-.09.412-.09.879v.666c0 .467 0 .7.09.879.08.157.208.284.364.364.179.09.412.09.879.09m2-10a.833.833 0 1 1-1.667 0 .833.833 0 0 1 1.667 0m-15 0a.833.833 0 1 1-1.667 0 .833.833 0 0 1 1.667 0"
      />
    </g>
    <defs>
      <clipPath id="prefix__a">
        <path fill="#fff" d="M0 0h20v20H0z" />
      </clipPath>
    </defs>
  </svg>
)
const ForwardRef = forwardRef(BezierCurve01Md)
export default ForwardRef
