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
const PaletteLg = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 24 24"
    role="img"
    stroke="currentColor"
    ref={ref}
    {...props}
  >
    <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}>
      <path d="M3 12c0 5.523 4.477 10 10 10a3 3 0 0 0 3-3v-.5c0-.464 0-.697.026-.892a3 3 0 0 1 2.582-2.582c.195-.026.428-.026.892-.026h.5a3 3 0 0 0 3-3c0-5.523-4.477-10-10-10S3 6.477 3 12" />
      <path d="M8 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2M17 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2M11 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2" />
    </g>
  </svg>
)
const ForwardRef = forwardRef(PaletteLg)
export default ForwardRef
