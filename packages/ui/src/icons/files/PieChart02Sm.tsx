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
const PieChart02Sm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
    <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} clipPath="url(#prefix__a)">
      <path d="M11.466 9.333c.185 0 .277 0 .352.041.062.034.12.098.147.162.033.079.025.163.008.33a5.33 5.33 0 0 1-6.347 4.698 5.333 5.333 0 0 1 .508-10.537c.167-.017.25-.026.33.008a.35.35 0 0 1 .161.146c.041.075.041.168.041.352V8.8c0 .187 0 .28.037.351a.33.33 0 0 0 .145.146c.072.036.165.036.352.036zM9.333 1.867c0-.185 0-.277.041-.352a.35.35 0 0 1 .162-.147c.079-.033.162-.025.33-.008a5.33 5.33 0 0 1 4.774 4.774c.016.167.025.25-.008.33a.35.35 0 0 1-.147.162c-.075.04-.167.04-.352.04H9.866c-.186 0-.28 0-.351-.036a.33.33 0 0 1-.146-.145c-.036-.072-.036-.165-.036-.352z" />
    </g>
    <defs>
      <clipPath id="prefix__a">
        <path fill="#fff" d="M0 0h16v16H0z" />
      </clipPath>
    </defs>
  </svg>
)
const ForwardRef = forwardRef(PieChart02Sm)
export default ForwardRef
