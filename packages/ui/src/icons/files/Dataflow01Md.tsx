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
const Dataflow01Md = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M14.167 16.667H14c-1.4 0-2.1 0-2.635-.273a2.5 2.5 0 0 1-1.092-1.092C10 14.767 10 14.067 10 12.667V7.334c0-1.4 0-2.1.273-2.635a2.5 2.5 0 0 1 1.092-1.093C11.9 3.334 12.6 3.334 14 3.334h.167m0 13.333a1.667 1.667 0 1 0 3.333 0 1.667 1.667 0 0 0-3.333 0m0-13.333a1.667 1.667 0 1 0 3.333 0 1.667 1.667 0 0 0-3.333 0M5.833 10h8.334m-8.334 0A1.667 1.667 0 1 1 2.5 10a1.667 1.667 0 0 1 3.333 0m8.334 0a1.667 1.667 0 1 0 3.333 0 1.667 1.667 0 0 0-3.333 0"
    />
  </svg>
)
const ForwardRef = forwardRef(Dataflow01Md)
export default ForwardRef
