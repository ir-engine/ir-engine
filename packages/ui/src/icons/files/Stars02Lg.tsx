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
const Stars02Lg = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 24 25"
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
      d="M4.5 22.139v-5m0-10v-5M2 4.639h5m-5 15h5m6-16.5-1.734 4.509c-.282.733-.423 1.1-.643 1.408a3 3 0 0 1-.706.706c-.308.22-.675.36-1.408.643L4 12.139l4.509 1.734c.733.282 1.1.423 1.408.642a3 3 0 0 1 .707.707c.219.308.36.675.642 1.408L13 21.139l1.734-4.51c.282-.732.423-1.099.643-1.407a3 3 0 0 1 .706-.707c.308-.22.675-.36 1.408-.642L22 12.139l-4.509-1.734c-.733-.282-1.1-.424-1.408-.643a3 3 0 0 1-.706-.706c-.22-.309-.36-.675-.643-1.408z"
    />
  </svg>
)
const ForwardRef = forwardRef(Stars02Lg)
export default ForwardRef
