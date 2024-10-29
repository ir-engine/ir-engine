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
const BezierCurve01Sm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
        d="M7.667 4.666H3.001m12 0h-4.667m0 .168c2.3.592 4 2.68 4 5.166M3.667 10c0-2.485 1.7-4.574 4-5.166m-4.266 7.832h.533c.373 0 .56 0 .703-.072a.67.67 0 0 0 .291-.292c.073-.142.073-.329.073-.702v-.534c0-.373 0-.56-.073-.702a.67.67 0 0 0-.291-.292C4.494 10 4.307 10 3.934 10h-.533c-.374 0-.56 0-.703.072a.67.67 0 0 0-.291.292c-.073.142-.073.329-.073.702v.534c0 .373 0 .56.073.702a.67.67 0 0 0 .291.292c.143.072.33.072.703.072M8.734 6h.533c.374 0 .56 0 .703-.073a.67.67 0 0 0 .291-.291c.073-.143.073-.33.073-.703V4.4c0-.374 0-.56-.073-.703a.67.67 0 0 0-.291-.291c-.143-.073-.33-.073-.703-.073h-.533c-.373 0-.56 0-.703.073a.67.67 0 0 0-.291.291c-.073.143-.073.33-.073.703v.533c0 .373 0 .56.073.703a.67.67 0 0 0 .291.291c.143.073.33.073.703.073m5.333 6.666h.534c.373 0 .56 0 .702-.072a.67.67 0 0 0 .292-.292c.072-.142.072-.329.072-.702v-.534c0-.373 0-.56-.072-.702a.67.67 0 0 0-.292-.292C15.161 10 14.974 10 14.601 10h-.534c-.373 0-.56 0-.702.072a.67.67 0 0 0-.292.292c-.072.142-.072.329-.072.702v.534c0 .373 0 .56.072.702a.67.67 0 0 0 .292.292c.142.072.329.072.702.072m1.6-8a.667.667 0 1 1-1.333 0 .667.667 0 0 1 1.333 0m-12 0a.667.667 0 1 1-1.333 0 .667.667 0 0 1 1.333 0"
      />
    </g>
    <defs>
      <clipPath id="prefix__a">
        <path fill="#fff" d="M0 0h16v16H0z" />
      </clipPath>
    </defs>
  </svg>
)
const ForwardRef = forwardRef(BezierCurve01Sm)
export default ForwardRef
