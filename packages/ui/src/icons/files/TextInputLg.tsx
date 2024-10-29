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
const TextInputLg = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M14 7H6.2c-1.12 0-1.68 0-2.108.218a2 2 0 0 0-.874.874C3 8.52 3 9.08 3 10.2v3.6c0 1.12 0 1.68.218 2.108a2 2 0 0 0 .874.874C4.52 17 5.08 17 6.2 17H14m4-10h1.8c1.12 0 1.68 0 2.108.218a2 2 0 0 1 .874.874C23 8.52 23 9.08 23 10.2v3.6c0 1.12 0 1.68-.218 2.108a2 2 0 0 1-.874.874C21.48 17 20.92 17 19.8 17H18m0 4V3m2.5 0h-5m5 18h-5"
    />
  </svg>
)
const ForwardRef = forwardRef(TextInputLg)
export default ForwardRef
