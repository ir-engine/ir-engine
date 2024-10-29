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
const ShoppingCardLg = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
    <g fill="#374151">
      <path d="M1.2 2.1a.9.9 0 0 1 .9-.9h1.954a2.1 2.1 0 0 1 2.08 1.813l.081.587a78.3 78.3 0 0 1 16.033 1.695.9.9 0 0 1 .697 1.05 58 58 0 0 1-1.943 7.44.9.9 0 0 1-.854.615H7.2q-.206 0-.403.027A3 3 0 0 0 4.45 16.2H20.7a.9.9 0 1 1 0 1.8H3.31a.9.9 0 0 1-.897-.968 4.8 4.8 0 0 1 3.26-4.184L4.35 3.26A.3.3 0 0 0 4.054 3H2.1a.9.9 0 0 1-.9-.9M7.2 21a1.8 1.8 0 1 1-3.6 0 1.8 1.8 0 0 1 3.6 0M18.6 22.8a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6" />
    </g>
  </svg>
)
const ForwardRef = forwardRef(ShoppingCardLg)
export default ForwardRef
