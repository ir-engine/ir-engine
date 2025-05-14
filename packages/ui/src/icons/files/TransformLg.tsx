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
const TransformLg = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M19 7V17M5 7V17M17 5L7 5M17 19H7M4.6 7H5.4C5.96005 7 6.24008 7 6.45399 6.89101C6.64215 6.79513 6.79513 6.64215 6.89101 6.45399C7 6.24008 7 5.96005 7 5.4V4.6C7 4.03995 7 3.75992 6.89101 3.54601C6.79513 3.35785 6.64215 3.20487 6.45399 3.10899C6.24008 3 5.96005 3 5.4 3H4.6C4.03995 3 3.75992 3 3.54601 3.10899C3.35785 3.20487 3.20487 3.35785 3.10899 3.54601C3 3.75992 3 4.03995 3 4.6V5.4C3 5.96005 3 6.24008 3.10899 6.45399C3.20487 6.64215 3.35785 6.79513 3.54601 6.89101C3.75992 7 4.03995 7 4.6 7ZM4.6 21H5.4C5.96005 21 6.24008 21 6.45399 20.891C6.64215 20.7951 6.79513 20.6422 6.89101 20.454C7 20.2401 7 19.9601 7 19.4V18.6C7 18.0399 7 17.7599 6.89101 17.546C6.79513 17.3578 6.64215 17.2049 6.45399 17.109C6.24008 17 5.96005 17 5.4 17H4.6C4.03995 17 3.75992 17 3.54601 17.109C3.35785 17.2049 3.20487 17.3578 3.10899 17.546C3 17.7599 3 18.0399 3 18.6V19.4C3 19.9601 3 20.2401 3.10899 20.454C3.20487 20.6422 3.35785 20.7951 3.54601 20.891C3.75992 21 4.03995 21 4.6 21ZM18.6 7H19.4C19.9601 7 20.2401 7 20.454 6.89101C20.6422 6.79513 20.7951 6.64215 20.891 6.45399C21 6.24008 21 5.96005 21 5.4V4.6C21 4.03995 21 3.75992 20.891 3.54601C20.7951 3.35785 20.6422 3.20487 20.454 3.10899C20.2401 3 19.9601 3 19.4 3H18.6C18.0399 3 17.7599 3 17.546 3.10899C17.3578 3.20487 17.2049 3.35785 17.109 3.54601C17 3.75992 17 4.03995 17 4.6V5.4C17 5.96005 17 6.24008 17.109 6.45399C17.2049 6.64215 17.3578 6.79513 17.546 6.89101C17.7599 7 18.0399 7 18.6 7ZM18.6 21H19.4C19.9601 21 20.2401 21 20.454 20.891C20.6422 20.7951 20.7951 20.6422 20.891 20.454C21 20.2401 21 19.9601 21 19.4V18.6C21 18.0399 21 17.7599 20.891 17.546C20.7951 17.3578 20.6422 17.2049 20.454 17.109C20.2401 17 19.9601 17 19.4 17H18.6C18.0399 17 17.7599 17 17.546 17.109C17.3578 17.2049 17.2049 17.3578 17.109 17.546C17 17.7599 17 18.0399 17 18.6V19.4C17 19.9601 17 20.2401 17.109 20.454C17.2049 20.6422 17.3578 20.7951 17.546 20.891C17.7599 21 18.0399 21 18.6 21Z"
    />
  </svg>
)
const ForwardRef = forwardRef(TransformLg)
export default ForwardRef
