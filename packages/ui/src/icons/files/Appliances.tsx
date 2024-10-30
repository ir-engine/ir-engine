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
const Appliances = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M2 14.666h6M7.333 4.168Q7.973 4 8.667 4a5.333 5.333 0 0 1 2 10.279m-7-5.613h2.666c.31 0 .465 0 .594.026.529.105.942.519 1.047 1.048.026.128.026.283.026.593s0 .465-.026.594a1.33 1.33 0 0 1-1.047 1.047C6.798 12 6.643 12 6.333 12H3.667c-.31 0-.465 0-.594-.026a1.33 1.33 0 0 1-1.047-1.047C2 10.797 2 10.643 2 10.333s0-.465.026-.593a1.33 1.33 0 0 1 1.047-1.048c.129-.026.284-.026.594-.026m-1-5v5h4.666v-5a2.333 2.333 0 0 0-4.666 0"
    />
  </svg>
)
const ForwardRef = forwardRef(Appliances)
export default ForwardRef
