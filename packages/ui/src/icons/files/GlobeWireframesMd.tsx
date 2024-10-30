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
const GlobeWireframesMd = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
    <g clipPath="url(#prefix__a)">
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M10 1.667C12.5 3.334 13.267 6.91 13.332 10c-.065 3.09-.834 6.667-3.334 8.334m0-16.667C7.5 3.334 6.73 6.91 6.666 10c.064 3.09.833 6.667 3.333 8.334m0-16.667A8.333 8.333 0 0 0 1.666 10m8.333-8.333A8.333 8.333 0 0 1 18.333 10m-8.334 8.334A8.333 8.333 0 0 0 18.333 10m-8.334 8.334A8.333 8.333 0 0 1 1.666 10m16.667 0c-1.667 2.5-5.244 3.27-8.334 3.334C6.91 13.269 3.333 12.5 1.666 10m16.667 0c-1.667-2.5-5.244-3.269-8.334-3.333C6.91 6.731 3.333 7.5 1.666 10"
      />
    </g>
    <defs>
      <clipPath id="prefix__a">
        <path fill="#fff" d="M0 0h20v20H0z" />
      </clipPath>
    </defs>
  </svg>
)
const ForwardRef = forwardRef(GlobeWireframesMd)
export default ForwardRef
