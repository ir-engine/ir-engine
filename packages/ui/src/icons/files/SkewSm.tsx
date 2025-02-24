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
const SkewSm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
        d="m14.143 4.667-.952 6.666M5.096 4.667l-1.19 6.666m9.095-8H6.334m5.333 9.334H5.001m-.267-8h.533c.374 0 .56 0 .703-.073a.67.67 0 0 0 .291-.291c.073-.143.073-.33.073-.703v-.533c0-.374 0-.56-.073-.703a.67.67 0 0 0-.291-.291C5.827 2 5.64 2 5.267 2h-.533c-.373 0-.56 0-.703.073a.67.67 0 0 0-.291.291c-.073.143-.073.33-.073.703V3.6c0 .373 0 .56.073.703a.67.67 0 0 0 .291.291c.143.073.33.073.703.073M3.401 14h.533c.373 0 .56 0 .703-.073a.67.67 0 0 0 .291-.291c.073-.143.073-.33.073-.703V12.4c0-.373 0-.56-.073-.703a.67.67 0 0 0-.291-.291c-.143-.073-.33-.073-.703-.073h-.533c-.374 0-.56 0-.703.073a.67.67 0 0 0-.291.291c-.073.143-.073.33-.073.703v.533c0 .374 0 .56.073.703a.67.67 0 0 0 .291.291c.143.073.33.073.703.073m10.666-9.333h.534c.373 0 .56 0 .702-.073a.67.67 0 0 0 .292-.291c.072-.143.072-.33.072-.703v-.533c0-.374 0-.56-.072-.703a.67.67 0 0 0-.292-.291C15.161 2 14.974 2 14.601 2h-.534c-.373 0-.56 0-.702.073a.67.67 0 0 0-.292.291c-.072.143-.072.33-.072.703V3.6c0 .373 0 .56.072.703a.67.67 0 0 0 .292.291c.142.073.329.073.702.073M12.734 14h.533c.374 0 .56 0 .703-.073a.67.67 0 0 0 .291-.291c.073-.143.073-.33.073-.703V12.4c0-.373 0-.56-.073-.703a.67.67 0 0 0-.291-.291c-.143-.073-.33-.073-.703-.073h-.533c-.373 0-.56 0-.703.073a.67.67 0 0 0-.291.291c-.073.143-.073.33-.073.703v.533c0 .374 0 .56.073.703a.67.67 0 0 0 .291.291c.143.073.33.073.703.073"
      />
    </g>
    <defs>
      <clipPath id="prefix__a">
        <path fill="#fff" d="M0 0h16v16H0z" />
      </clipPath>
    </defs>
  </svg>
)
const ForwardRef = forwardRef(SkewSm)
export default ForwardRef
