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
const Copy02Md = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
        d="M13.334 6.667V4.334c0-.934 0-1.4-.182-1.757a1.67 1.67 0 0 0-.728-.728c-.357-.182-.824-.182-1.757-.182H4.334c-.934 0-1.4 0-1.757.182-.314.16-.569.414-.728.728-.182.357-.182.823-.182 1.757v6.333c0 .933 0 1.4.182 1.757.16.313.414.568.728.728.357.182.823.182 1.757.182h2.333m2.667 5h6.333c.933 0 1.4 0 1.757-.182.313-.16.568-.415.728-.728.182-.357.182-.824.182-1.757V9.334c0-.934 0-1.4-.182-1.757a1.67 1.67 0 0 0-.728-.728c-.357-.182-.824-.182-1.757-.182H9.334c-.934 0-1.4 0-1.757.182-.314.16-.569.414-.728.728-.182.357-.182.823-.182 1.757v6.333c0 .933 0 1.4.182 1.757.16.313.414.568.728.728.357.182.823.182 1.757.182"
      />
    </g>
    <defs>
      <clipPath id="prefix__a">
        <path fill="#fff" d="M0 0h20v20H0z" />
      </clipPath>
    </defs>
  </svg>
)
const ForwardRef = forwardRef(Copy02Md)
export default ForwardRef
