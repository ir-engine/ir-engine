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
const BarLineChartMd = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M16.666 16.667v-5.834M10 16.667V8.333m-6.667 8.334v-3.334m7.839-9.143 4.307 1.615M8.999 4.5 4.333 8M17.55 5.366a1.25 1.25 0 1 1-1.767 1.768 1.25 1.25 0 0 1 1.767-1.768m-13.333 2.5a1.25 1.25 0 1 1-1.768 1.768 1.25 1.25 0 0 1 1.768-1.768m6.667-5a1.25 1.25 0 1 1-1.768 1.768 1.25 1.25 0 0 1 1.768-1.768"
    />
  </svg>
)
const ForwardRef = forwardRef(BarLineChartMd)
export default ForwardRef
