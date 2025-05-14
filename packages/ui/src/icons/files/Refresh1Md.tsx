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
const Refresh1Md = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M1.66797 11.6667C1.66797 11.6667 1.76907 12.3744 4.698 15.3033C7.62693 18.2322 12.3757 18.2322 15.3046 15.3033C16.3423 14.2656 17.0124 12.9994 17.3148 11.6667M1.66797 11.6667V16.6667M1.66797 11.6667H6.66797M18.3346 8.33333C18.3346 8.33333 18.2335 7.62563 15.3046 4.6967C12.3757 1.76777 7.62693 1.76777 4.698 4.6967C3.66027 5.73443 2.99021 7.0006 2.68783 8.33333M18.3346 8.33333V3.33333M18.3346 8.33333H13.3346"
    />
  </svg>
)
const ForwardRef = forwardRef(Refresh1Md)
export default ForwardRef
