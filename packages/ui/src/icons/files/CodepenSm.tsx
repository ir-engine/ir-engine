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
const CodepenSm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 16 16"
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
        strokeWidth={1.5}
        d="M8 6 2.709 9.44c-.459.297-.688.446-.767.635a.67.67 0 0 0 0 .517M8 6l5.29 3.44c.459.297.688.446.768.635.07.165.07.352 0 .517M8 6V1.667M8 10 2.709 6.561c-.459-.298-.688-.447-.767-.636a.67.67 0 0 1 0-.516M8 10l5.29-3.439c.459-.298.688-.447.768-.636a.67.67 0 0 0 0-.516M8 10v4.334m6.181-3.685-5.6 3.64c-.21.137-.316.205-.429.232a.7.7 0 0 1-.305 0c-.113-.027-.218-.095-.429-.232l-5.6-3.64c-.177-.115-.266-.173-.33-.25a.7.7 0 0 1-.126-.231c-.029-.096-.029-.202-.029-.413v-3.51c0-.21 0-.317.03-.412a.7.7 0 0 1 .125-.232c.064-.077.153-.134.33-.25l5.6-3.64c.21-.136.316-.205.43-.231a.7.7 0 0 1 .304 0c.113.026.219.095.429.231l5.6 3.64c.177.116.266.173.33.25q.086.103.126.232c.03.095.03.201.03.413v3.509c0 .211 0 .317-.03.413a.7.7 0 0 1-.126.231c-.064.077-.153.135-.33.25"
      />
    </g>
    <defs>
      <clipPath id="prefix__a">
        <path fill="#fff" d="M0 0h16v16H0z" />
      </clipPath>
    </defs>
  </svg>
)
const ForwardRef = forwardRef(CodepenSm)
export default ForwardRef
