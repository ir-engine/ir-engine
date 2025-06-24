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
const Icon = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 21 19"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    fill="none"
    stroke="none"
    ref={ref}
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M0.451981 2.01303C0.125 2.65476 0.125 3.49484 0.125 5.175V9.575C0.125 11.2552 0.125 12.0952 0.451981 12.737C0.739601 13.3015 1.19854 13.7604 1.76303 14.048C2.40476 14.375 3.24484 14.375 4.925 14.375H15.325C17.0052 14.375 17.8452 14.375 18.487 14.048C19.0515 13.7604 19.5104 13.3015 19.798 12.737C20.125 12.0952 20.125 11.2552 20.125 9.575V5.175C20.125 3.49484 20.125 2.65476 19.798 2.01303C19.5104 1.44854 19.0515 0.9896 18.487 0.70198C17.8452 0.375 17.0052 0.375 15.325 0.375H4.925C3.24484 0.375 2.40476 0.375 1.76303 0.70198C1.19854 0.9896 0.739601 1.44854 0.451981 2.01303ZM14.8683 7.63394C14.8482 7.67751 14.7933 7.71413 14.6834 7.78737L10.8716 10.3286C10.6825 10.4547 10.5879 10.5177 10.5079 10.5192C10.4383 10.5206 10.3719 10.4968 10.3279 10.4548C10.2773 10.4066 10.2773 10.3097 10.2773 10.116V8.64946C9.6286 8.68369 8.99332 8.81358 8.40565 9.03285C7.73909 9.28156 7.14951 9.63938 6.67731 10.0818V9.86761C6.67787 9.03636 7.07188 8.23436 7.78418 7.61463C8.43753 7.04619 9.31671 6.66761 10.2773 6.5369V5.03356C10.2773 4.83984 10.2773 4.74298 10.3279 4.69471C10.3719 4.65275 10.4383 4.62898 10.5079 4.63032C10.5879 4.63186 10.6825 4.6949 10.8716 4.82097L14.6834 7.36218C14.7933 7.43542 14.8482 7.47204 14.8683 7.51561C14.886 7.55386 14.886 7.59569 14.8683 7.63394Z"
      fill="currentColor"
    />
    <path
      d="M6.12891 17.3751H14.1289M10.1289 13.3751C10.1289 14.9372 10.1289 17.3751 10.1289 17.3751"
      stroke="currentColor"
      strokeWidth="2.51562"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)
const ForwardRef = forwardRef(Icon)
export default ForwardRef
