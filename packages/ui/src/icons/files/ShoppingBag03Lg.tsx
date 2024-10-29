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
const ShoppingBag03Lg = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 24 25"
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
      d="M15.999 8.139a4 4 0 1 1-8 0M3.632 7.54l-.7 8.4c-.15 1.805-.226 2.707.08 3.403a3 3 0 0 0 1.319 1.434c.668.362 1.573.362 3.384.362h8.567c1.81 0 2.716 0 3.384-.362a3 3 0 0 0 1.32-1.434c.305-.696.23-1.598.08-3.403l-.7-8.4c-.13-1.553-.195-2.329-.538-2.916a3 3 0 0 0-1.295-1.191c-.614-.294-1.393-.294-2.951-.294H8.415c-1.558 0-2.337 0-2.95.294a3 3 0 0 0-1.295 1.19c-.344.588-.409 1.364-.538 2.917"
    />
  </svg>
)
const ForwardRef = forwardRef(ShoppingBag03Lg)
export default ForwardRef
