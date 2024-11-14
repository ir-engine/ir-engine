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
const GoogleOriginalFalse = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 48 48"
    role="img"
    stroke="currentColor"
    ref={ref}
    {...props}
  >
    <path
      fill="#080808"
      d="M30.273 16.304c-1.745-1.685-3.964-2.543-6.436-2.543-4.385 0-8.097 2.99-9.421 7.009a10.3 10.3 0 0 0-.528 3.23c0 1.12.191 2.21.528 3.23 1.324 4.018 5.035 7.009 9.42 7.009 2.266 0 4.195-.603 5.702-1.623a7.83 7.83 0 0 0 3.36-5.13h-9.061v-6.577h15.857c.199 1.113.306 2.272.306 3.477 0 5.178-1.837 9.536-5.02 12.495C32.194 39.478 28.383 41 23.837 41c-6.582 0-12.276-3.81-15.046-9.365A17.1 17.1 0 0 1 7 24c0-2.743.65-5.34 1.79-7.634C11.562 10.81 17.256 7 23.838 7c4.538 0 8.35 1.685 11.265 4.428z"
    />
  </svg>
)
const ForwardRef = forwardRef(GoogleOriginalFalse)
export default ForwardRef
