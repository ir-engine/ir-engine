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
const ShoppingBag03Sm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 16 17"
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
      d="M10.666 5.472a2.667 2.667 0 1 1-5.334 0m-2.91-.4-.467 5.6c-.1 1.204-.15 1.805.053 2.27a2 2 0 0 0 .88.956c.445.24 1.048.24 2.256.24h5.71c1.208 0 1.811 0 2.257-.24a2 2 0 0 0 .88-.957c.203-.464.153-1.065.053-2.268l-.467-5.6c-.086-1.035-.13-1.553-.359-1.944a2 2 0 0 0-.863-.794c-.409-.196-.928-.196-1.967-.196H5.61c-1.039 0-1.558 0-1.967.196a2 2 0 0 0-.863.794c-.23.391-.273.909-.359 1.944"
    />
  </svg>
)
const ForwardRef = forwardRef(ShoppingBag03Sm)
export default ForwardRef
