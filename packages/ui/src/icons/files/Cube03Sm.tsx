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
const Cube03Sm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M2.333 5.333h8.334m0 0v8.334m0-8.334 3-3M14 10.225V2.533c0-.186 0-.28-.036-.351a.33.33 0 0 0-.146-.146C13.747 2 13.653 2 13.467 2H5.775c-.163 0-.244 0-.321.018a.7.7 0 0 0-.193.08c-.067.041-.125.1-.24.214L2.312 5.021a1.4 1.4 0 0 0-.214.24.7.7 0 0 0-.08.193C2 5.53 2 5.612 2 5.775v7.692c0 .186 0 .28.036.351a.33.33 0 0 0 .146.146c.071.036.165.036.351.036h7.692c.163 0 .244 0 .321-.018a.7.7 0 0 0 .193-.08c.067-.041.125-.1.24-.214l2.709-2.709c.115-.115.172-.173.214-.24a.7.7 0 0 0 .08-.193c.018-.077.018-.158.018-.321"
    />
  </svg>
)
const ForwardRef = forwardRef(Cube03Sm)
export default ForwardRef
