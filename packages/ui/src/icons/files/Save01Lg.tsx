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
const Save01Lg = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 3v3.4c0 .56 0 .84.109 1.054a1 1 0 0 0 .437.437C7.76 8 8.04 8 8.6 8h6.8c.56 0 .84 0 1.054-.109a1 1 0 0 0 .437-.437C17 7.24 17 6.96 17 6.4V4m0 17v-6.4c0-.56 0-.84-.109-1.054a1 1 0 0 0-.437-.437C16.24 13 15.96 13 15.4 13H8.6c-.56 0-.84 0-1.054.109a1 1 0 0 0-.437.437C7 13.76 7 14.04 7 14.6V21M21 9.325V16.2c0 1.68 0 2.52-.327 3.162a3 3 0 0 1-1.311 1.311C18.72 21 17.88 21 16.2 21H7.8c-1.68 0-2.52 0-3.162-.327a3 3 0 0 1-1.311-1.311C3 18.72 3 17.88 3 16.2V7.8c0-1.68 0-2.52.327-3.162a3 3 0 0 1 1.311-1.311C5.28 3 6.12 3 7.8 3h6.875c.489 0 .733 0 .963.055.204.05.4.13.579.24.201.123.374.296.72.642l3.126 3.126c.346.346.519.519.642.72q.165.27.24.579c.055.23.055.474.055.963"
    />
  </svg>
)
const ForwardRef = forwardRef(Save01Lg)
export default ForwardRef
