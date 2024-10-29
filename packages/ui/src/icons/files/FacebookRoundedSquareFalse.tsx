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
const FacebookRoundedSquareFalse = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 48 48"
    role="img"
    stroke="currentColor"
    ref={ref}
    {...props}
  >
    <path
      fill="#080808"
      fillRule="evenodd"
      d="M1.126 5.39C0 7.558 0 10.405 0 16.1v15.8c0 5.695 0 8.542 1.126 10.71a10 10 0 0 0 4.264 4.264C7.558 48 10.405 48 16.1 48h15.8c5.695 0 8.542 0 10.71-1.126a10 10 0 0 0 4.264-4.264C48 40.442 48 37.595 48 31.9V16.1c0-5.695 0-8.542-1.126-10.71a10 10 0 0 0-4.264-4.264C40.442 0 37.595 0 31.9 0H16.1C10.405 0 7.558 0 5.39 1.126A10 10 0 0 0 1.126 5.39M34.4 24l-1.067 6.667H28V48h-8V30.667h-6V24h6v-5.333c0-6 3.867-9.334 9.333-9.334 1.734 0 3.6.267 5.334.534V16H31.6c-2.933 0-3.6 1.467-3.6 3.333V24z"
      clipRule="evenodd"
    />
  </svg>
)
const ForwardRef = forwardRef(FacebookRoundedSquareFalse)
export default ForwardRef
