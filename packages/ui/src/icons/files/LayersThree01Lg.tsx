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
const LayersThree01Lg = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      strokeWidth={2}
      d="m2 12 9.642 4.82c.131.066.197.1.266.112q.091.016.184 0c.069-.013.135-.046.266-.111L22 12M2 17l9.642 4.82c.131.066.197.1.266.112q.091.016.184 0c.069-.013.135-.046.266-.111L22 17M2 7l9.642-4.822c.131-.065.197-.098.266-.11a.5.5 0 0 1 .184 0c.069.012.135.045.266.11L22 7l-9.642 4.82a1 1 0 0 1-.266.112.5.5 0 0 1-.184 0c-.069-.013-.135-.046-.266-.111z"
    />
  </svg>
)
const ForwardRef = forwardRef(LayersThree01Lg)
export default ForwardRef
