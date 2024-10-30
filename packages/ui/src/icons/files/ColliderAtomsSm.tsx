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
const ColliderAtomsSm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M11.412 10.24q-.27.305-.568.603C7.98 13.707 4.392 14.762 2.83 13.2c-1.071-1.071-.912-3.094.217-5.184m1.547-2.199q.282-.32.593-.631c2.864-2.864 6.452-3.92 8.014-2.357 1.071 1.071.911 3.097-.22 5.187m-2.137-2.83c2.864 2.864 3.919 6.452 2.357 8.014s-5.15.507-8.014-2.357S1.267 4.39 2.83 2.829s5.15-.507 8.014 2.357M8.668 8a.667.667 0 1 1-1.333 0 .667.667 0 0 1 1.333 0"
    />
  </svg>
)
const ForwardRef = forwardRef(ColliderAtomsSm)
export default ForwardRef
