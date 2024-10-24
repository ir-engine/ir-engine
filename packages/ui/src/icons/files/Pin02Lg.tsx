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
const Pin02Lg = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M8.377 15.616 2.72 21.273m8.974-14.631-1.56 1.56a2 2 0 0 1-.264.242 1 1 0 0 1-.207.11c-.082.033-.17.05-.347.086l-3.665.733c-.952.19-1.428.286-1.65.537a1 1 0 0 0-.243.8c.046.333.39.677 1.076 1.363l7.086 7.086c.686.687 1.03 1.03 1.362 1.076a1 1 0 0 0 .801-.242c.251-.223.346-.7.537-1.651l.733-3.665c.035-.176.053-.265.085-.347a1 1 0 0 1 .11-.207c.051-.073.115-.136.242-.264l1.561-1.56c.082-.082.122-.123.167-.158a1 1 0 0 1 .126-.085 2 2 0 0 1 .208-.097l2.495-1.069c.727-.312 1.091-.468 1.256-.72a1 1 0 0 0 .144-.747c-.06-.295-.34-.575-.9-1.135l-5.142-5.143c-.56-.56-.84-.84-1.135-.9a1 1 0 0 0-.748.144c-.252.166-.407.53-.72 1.257l-1.068 2.495a2 2 0 0 1-.097.208 1 1 0 0 1-.085.126 2 2 0 0 1-.158.167"
    />
  </svg>
)
const ForwardRef = forwardRef(Pin02Lg)
export default ForwardRef
