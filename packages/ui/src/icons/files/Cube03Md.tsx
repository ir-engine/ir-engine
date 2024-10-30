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
const Cube03Md = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 20 20"
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
      d="M2.917 6.667h10.416m0 0v10.416m0-10.416 3.75-3.75m.417 9.864V3.167c0-.234 0-.35-.045-.44a.4.4 0 0 0-.182-.182c-.09-.045-.206-.045-.44-.045H7.22c-.204 0-.306 0-.402.023a.8.8 0 0 0-.24.1c-.085.051-.157.123-.3.268L2.89 6.276c-.145.144-.217.216-.268.3a.8.8 0 0 0-.1.241c-.023.096-.023.198-.023.402v9.614c0 .234 0 .35.045.44.04.078.104.142.183.182.089.045.205.045.439.045h9.614c.204 0 .306 0 .402-.023a.8.8 0 0 0 .24-.1c.085-.051.157-.123.3-.267l3.387-3.386c.144-.144.216-.216.267-.3a.8.8 0 0 0 .1-.241c.023-.096.023-.198.023-.402"
    />
  </svg>
)
const ForwardRef = forwardRef(Cube03Md)
export default ForwardRef
