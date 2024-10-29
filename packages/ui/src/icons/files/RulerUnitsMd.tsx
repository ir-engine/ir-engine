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
const RulerUnitsMd = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
        d="m12.084 4.583 1.25 1.25m-3.75 1.25 1.25 1.25m-3.75 1.25 1.25 1.25m-3.75 1.25 1.25 1.25m-3.695 1.305 3.224 3.223c.165.165.247.248.342.279a.4.4 0 0 0 .258 0c.095-.03.177-.114.342-.279L17.863 6.304c.165-.165.247-.247.278-.342a.4.4 0 0 0 0-.258c-.031-.095-.113-.177-.278-.342l-3.224-3.224c-.165-.165-.248-.248-.343-.279a.4.4 0 0 0-.257 0c-.096.031-.178.114-.343.279L2.139 13.695c-.165.165-.248.247-.279.342a.4.4 0 0 0 0 .258c.031.095.114.178.279.343"
      />
    </g>
    <defs>
      <clipPath id="prefix__a">
        <path fill="#fff" d="M0 0h20v20H0z" />
      </clipPath>
    </defs>
  </svg>
)
const ForwardRef = forwardRef(RulerUnitsMd)
export default ForwardRef
