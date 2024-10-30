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
const SpwanPointLg = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M21.416 15.341a9.17 9.17 0 0 1-9.539.659M2.584 8.659a9.17 9.17 0 0 1 9.56-.648m3.23 6.113A9.17 9.17 0 0 0 19.6 5.512M8.581 9.904A9.17 9.17 0 0 0 4.4 18.488m11.128-8.351a9.17 9.17 0 0 0-5.345-7.965M8.476 13.926a9.17 9.17 0 0 0 5.342 7.902m5.253-16.9c3.905 3.906 3.905 10.238 0 14.143s-10.237 3.905-14.142 0-3.905-10.237 0-14.142 10.237-3.905 14.142 0m-4.243 4.244a4 4 0 1 1-5.656 5.656 4 4 0 0 1 5.656-5.656"
    />
  </svg>
)
const ForwardRef = forwardRef(SpwanPointLg)
export default ForwardRef
