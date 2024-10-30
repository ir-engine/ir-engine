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
const HistoryLogMd = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      stroke="#000"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="m7.154 11.26-1.437 4.5-4.503-1.424"
    />
    <path stroke="#000" strokeLinecap="round" strokeWidth={1.75} d="M10.732 17.333a7.302 7.302 0 1 0-5.303-2.282" />
    <path
      fill="#000"
      d="M11.106 7.031a.875.875 0 0 0-1.75 0zm-.876 3.474h-.875v.48l.406.258zm2.715 2.764a.875.875 0 1 0 .94-1.476zm-3.59-6.238v3.474h1.75V7.03zm.406 4.212 3.184 2.026.94-1.476L10.7 9.766z"
    />
  </svg>
)
const ForwardRef = forwardRef(HistoryLogMd)
export default ForwardRef
