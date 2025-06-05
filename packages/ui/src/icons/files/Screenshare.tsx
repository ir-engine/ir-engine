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
const Screenshare = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      strokeWidth={1.75}
      d="M8 21h8m-4-4v4m-5.2-4h10.4c1.68 0 2.52 0 3.161-.327a3 3 0 0 0 1.311-1.311C22 14.72 22 13.88 22 12.2V7.8c0-1.68 0-2.52-.327-3.162a3 3 0 0 0-1.31-1.311C19.72 3 18.878 3 17.198 3H6.8c-1.68 0-2.52 0-3.162.327a3 3 0 0 0-1.31 1.311c-.328.642-.328 1.482-.328 3.162v4.4c0 1.68 0 2.52.327 3.162a3 3 0 0 0 1.311 1.311C4.28 17 5.12 17 6.8 17"
    />
    <g clipPath="url(#prefix__a)">
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.556 10.413c.11-.074.165-.11.185-.154a.14.14 0 0 0 0-.118c-.02-.044-.075-.08-.185-.154l-3.812-2.54c-.189-.127-.283-.19-.364-.192a.26.26 0 0 0-.18.065c-.05.048-.05.145-.05.339v1.503c-.96.13-1.84.51-2.493 1.078-.713.62-1.107 1.422-1.107 2.253v.214a5.2 5.2 0 0 1 1.728-1.049 6.3 6.3 0 0 1 1.872-.383v1.466c0 .194 0 .29.05.339.045.042.11.066.18.064.08-.001.175-.064.364-.19z"
      />
    </g>
    <path stroke="#000" d="m9.6 11.4 3-3 3 1.8-3 1.8-1.8-1.2L13.2 9l1.2 1.2-2.4.6 1.2-1.2" />
    <defs>
      <clipPath id="prefix__a">
        <path fill="#fff" d="M7.2 6H18v8.4H7.2z" />
      </clipPath>
    </defs>
  </svg>
)
const ForwardRef = forwardRef(Screenshare)
export default ForwardRef
