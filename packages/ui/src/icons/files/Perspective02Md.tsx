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
const Perspective02Md = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M13.333 4.167v11.667m-5-12.5v13.333M2.5 10h15m-15-5.009V15.01c0 1.137 0 1.705.234 2.1.206.345.53.604.911.73.436.143.99.02 2.1-.227l9.667-2.148c.745-.165 1.117-.248 1.396-.449.245-.176.438-.416.557-.694.135-.315.135-.697.135-1.46V7.14c0-.763 0-1.145-.135-1.46a1.67 1.67 0 0 0-.557-.694c-.279-.2-.651-.283-1.396-.449L5.745 2.388c-1.11-.247-1.664-.37-2.1-.226a1.67 1.67 0 0 0-.91.73c-.235.394-.235.962-.235 2.1"
    />
  </svg>
)
const ForwardRef = forwardRef(Perspective02Md)
export default ForwardRef
