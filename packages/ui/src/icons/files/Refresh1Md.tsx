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
const Refresh1Md = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 20 20" ref={ref} {...props}>
    <path
      stroke="#080808"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M1.667 11.667s.101.707 3.03 3.636a7.5 7.5 0 0 0 12.617-3.636m-15.647 0v5m0-5h5m11.667-3.334s-.101-.707-3.03-3.636A7.5 7.5 0 0 0 2.687 8.333m15.647 0v-5m0 5h-5"
    />
  </svg>
)
const ForwardRef = forwardRef(Refresh1Md)
export default ForwardRef
