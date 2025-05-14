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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Refresh1Sm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M1.33203 9.33333C1.33203 9.33333 1.41291 9.8995 3.75606 12.2426C6.0992 14.5858 9.89819 14.5858 12.2413 12.2426C13.0715 11.4125 13.6076 10.3995 13.8495 9.33333M1.33203 9.33333V13.3333M1.33203 9.33333H5.33203M14.6654 6.66667C14.6654 6.66667 14.5845 6.10051 12.2413 3.75736C9.89819 1.41421 6.0992 1.41421 3.75606 3.75736C2.92587 4.58754 2.38983 5.60048 2.14792 6.66667M14.6654 6.66667V2.66667M14.6654 6.66667H10.6654"
    />
  </svg>
)
const ForwardRef = forwardRef(Refresh1Sm)
export default ForwardRef
