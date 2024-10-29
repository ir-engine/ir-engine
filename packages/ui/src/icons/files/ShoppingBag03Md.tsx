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
const ShoppingBag03Md = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 20 21"
    role="img"
    stroke="currentColor"
    ref={ref}
    {...props}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M13.332 6.805a3.333 3.333 0 0 1-6.666 0m-3.64-.499-.583 7c-.125 1.504-.188 2.256.066 2.836.224.51.61.93 1.1 1.195.557.302 1.311.302 2.82.302h7.14c1.508 0 2.263 0 2.82-.302a2.5 2.5 0 0 0 1.1-1.195c.253-.58.19-1.332.066-2.835l-.584-7c-.108-1.294-.162-1.941-.448-2.431a2.5 2.5 0 0 0-1.079-.992c-.512-.245-1.16-.245-2.459-.245H7.013c-1.299 0-1.948 0-2.46.245a2.5 2.5 0 0 0-1.078.992c-.287.49-.34 1.137-.448 2.43"
    />
  </svg>
)
const ForwardRef = forwardRef(ShoppingBag03Md)
export default ForwardRef
