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
const Grid01Md = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
    <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}>
      <path d="M7 2.5H3.833c-.466 0-.7 0-.878.09a.83.83 0 0 0-.364.365c-.091.178-.091.412-.091.878V7c0 .467 0 .7.09.878.08.157.208.285.365.365.178.09.412.09.878.09H7c.467 0 .7 0 .878-.09a.83.83 0 0 0 .365-.365c.09-.178.09-.411.09-.878V3.833c0-.466 0-.7-.09-.878a.83.83 0 0 0-.365-.364C7.7 2.5 7.467 2.5 7 2.5M16.167 2.5H13c-.467 0-.7 0-.878.09a.83.83 0 0 0-.364.365c-.091.178-.091.412-.091.878V7c0 .467 0 .7.09.878.08.157.208.285.365.365.178.09.411.09.878.09h3.167c.466 0 .7 0 .878-.09a.83.83 0 0 0 .364-.365C17.5 7.7 17.5 7.467 17.5 7V3.833c0-.466 0-.7-.09-.878a.83.83 0 0 0-.365-.364c-.178-.091-.412-.091-.878-.091M16.167 11.667H13c-.467 0-.7 0-.878.09a.83.83 0 0 0-.364.365c-.091.178-.091.411-.091.878v3.167c0 .466 0 .7.09.878.08.157.208.284.365.364.178.091.411.091.878.091h3.167c.466 0 .7 0 .878-.09a.83.83 0 0 0 .364-.365c.091-.178.091-.412.091-.878V13c0-.467 0-.7-.09-.878a.83.83 0 0 0-.365-.364c-.178-.091-.412-.091-.878-.091M7 11.667H3.833c-.466 0-.7 0-.878.09a.83.83 0 0 0-.364.365C2.5 12.3 2.5 12.533 2.5 13v3.167c0 .466 0 .7.09.878.08.157.208.284.365.364.178.091.412.091.878.091H7c.467 0 .7 0 .878-.09a.83.83 0 0 0 .365-.365c.09-.178.09-.412.09-.878V13c0-.467 0-.7-.09-.878a.83.83 0 0 0-.365-.364c-.178-.091-.411-.091-.878-.091" />
    </g>
  </svg>
)
const ForwardRef = forwardRef(Grid01Md)
export default ForwardRef
