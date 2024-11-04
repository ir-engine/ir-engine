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
const Cursor03Sm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M3.14 2.45c-.36-.142-.54-.213-.655-.175a.33.33 0 0 0-.211.211c-.038.115.033.295.175.655l3.533 8.97c.115.29.172.436.265.494.081.051.18.064.272.037.106-.031.2-.156.386-.406l1.427-1.903 2.3 3.162c.126.174.19.261.27.297.07.032.15.039.225.018.085-.023.161-.1.313-.251l2.118-2.118c.152-.152.228-.228.251-.313a.33.33 0 0 0-.018-.225c-.036-.08-.123-.144-.297-.27l-3.162-2.3 1.903-1.427c.25-.187.375-.28.406-.386a.33.33 0 0 0-.037-.272c-.058-.093-.203-.15-.493-.265z"
    />
  </svg>
)
const ForwardRef = forwardRef(Cursor03Sm)
export default ForwardRef
