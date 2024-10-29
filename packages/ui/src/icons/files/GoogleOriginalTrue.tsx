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
const GoogleOriginalTrue = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
    <g fillRule="evenodd" clipRule="evenodd">
      <path
        fill="#4285F4"
        d="M40.32 24.387c0-1.206-.108-2.365-.31-3.478H24v6.576h9.15c-.395 2.125-1.593 3.926-3.393 5.131v4.266h5.494c3.215-2.96 5.069-7.318 5.069-12.495"
      />
      <path
        fill="#34A853"
        d="M24 41c4.59 0 8.438-1.522 11.25-4.118l-5.493-4.266c-1.523 1.02-3.47 1.623-5.757 1.623-4.428 0-8.175-2.99-9.512-7.008h-5.68v4.404c2.797 5.556 8.547 9.366 15.192 9.366"
      />
      <path
        fill="#FBBC05"
        d="M14.488 27.23a10.2 10.2 0 0 1-.533-3.23c0-1.12.193-2.21.533-3.23v-4.405h-5.68A17 17 0 0 0 7 24c0 2.743.657 5.34 1.808 7.634z"
      />
      <path
        fill="#EA4335"
        d="M24 13.761c2.496 0 4.737.858 6.499 2.543l4.875-4.876C32.43 8.685 28.582 7 24 7c-6.645 0-12.395 3.81-15.192 9.366l5.68 4.404c1.337-4.018 5.084-7.009 9.512-7.009"
      />
    </g>
  </svg>
)
const ForwardRef = forwardRef(GoogleOriginalTrue)
export default ForwardRef
