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
const Send01Lg = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M10.5 13.5 21 3M10.627 13.828l2.628 6.758c.232.596.347.893.514.98a.5.5 0 0 0 .462 0c.167-.086.283-.384.515-.979L21.336 3.7c.21-.537.315-.805.258-.977a.5.5 0 0 0-.316-.316c-.172-.057-.44.048-.978.257L3.413 9.253c-.595.233-.893.349-.98.516a.5.5 0 0 0 0 .461c.087.167.385.283.98.515l6.759 2.628c.12.047.18.07.232.106a.5.5 0 0 1 .116.117c.037.051.06.111.107.232"
    />
  </svg>
)
const ForwardRef = forwardRef(Send01Lg)
export default ForwardRef
