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
const EmoteSm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 15 16"
    role="img"
    stroke="currentColor"
    ref={ref}
    {...props}
  >
    <g fill="#F7F8FA">
      <path
        fillRule="evenodd"
        d="m9.75 1.826-2.06.703 3.217 1.149.854 2.946.923-2.848a7.298 7.298 0 1 1-2.934-1.95M7.298 14.877a6.176 6.176 0 0 0 6.093-7.189c-4.37.406-6.318-2.227-6.935-3.197-.673 2.467-3.92 3.552-5.327 3.928a6.175 6.175 0 0 0 6.17 6.458M6.175 9.544a.842.842 0 1 1-1.684 0 .842.842 0 0 1 1.684 0m3.088.842a.842.842 0 1 0 0-1.684.842.842 0 0 0 0 1.684"
        clipRule="evenodd"
      />
      <path d="m11.79 0-.53 1.829-1.996.682 1.996.713.53 1.829.593-1.83 1.933-.712-1.933-.682z" />
    </g>
  </svg>
)
const ForwardRef = forwardRef(EmoteSm)
export default ForwardRef
