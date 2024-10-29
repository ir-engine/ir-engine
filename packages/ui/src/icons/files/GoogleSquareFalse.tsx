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
const GoogleSquareFalse = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
    <path stroke="#000" strokeOpacity={0.15} strokeWidth={0.5} d="M.25.25h47.5v47.5H.25z" />
    <path
      fill="#080808"
      fillRule="evenodd"
      d="M48 0H0v48h48zM24 14.364c2.35 0 4.458.807 6.116 2.392l4.59-4.589C31.935 9.585 28.313 8 24 8c-6.254 0-11.665 3.585-14.298 8.815A16 16 0 0 0 8 24c0 2.582.618 5.026 1.702 7.186C12.335 36.415 17.746 40 24 40c4.32 0 7.942-1.433 10.59-3.876 3.025-2.786 4.77-6.888 4.77-11.76 0-1.135-.102-2.226-.29-3.273H24v6.19h8.61c-.37 1.999-1.497 3.694-3.192 4.828-1.433.96-3.265 1.527-5.418 1.527-4.167 0-7.695-2.814-8.953-6.596a9.6 9.6 0 0 1-.502-3.04c0-1.055.182-2.08.502-3.04 1.258-3.782 4.786-6.596 8.953-6.596"
      clipRule="evenodd"
    />
  </svg>
)
const ForwardRef = forwardRef(GoogleSquareFalse)
export default ForwardRef
