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
const PieChart02Md = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      <path d="M14.334 11.667c.23 0 .346 0 .44.051a.44.44 0 0 1 .183.203c.041.098.031.202.01.411a6.666 6.666 0 1 1-7.299-7.299c.209-.02.314-.031.412.01.08.035.16.107.202.184.052.093.052.209.052.44V11c0 .233 0 .35.045.44.04.078.104.141.182.181.09.046.206.046.44.046zM11.667 2.333c0-.23 0-.346.051-.44a.44.44 0 0 1 .203-.183c.098-.041.203-.031.412-.01A6.67 6.67 0 0 1 18.3 7.668c.021.209.032.313-.01.411a.44.44 0 0 1-.183.203c-.094.051-.21.051-.44.051h-5.333c-.234 0-.35 0-.44-.045a.4.4 0 0 1-.182-.182c-.045-.09-.045-.206-.045-.44z" />
    </g>
    <defs>
      <clipPath id="prefix__a">
        <path fill="#fff" d="M0 0h20v20H0z" />
      </clipPath>
    </defs>
  </svg>
)
const ForwardRef = forwardRef(PieChart02Md)
export default ForwardRef
