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
const TextureSm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M1.334 4c.4.333.8.666 1.667.666 1.666 0 1.666-1.333 3.333-1.333.867 0 1.267.333 1.667.667.4.333.8.666 1.666.666 1.667 0 1.667-1.333 3.334-1.333.866 0 1.266.333 1.666.667M1.334 12c.4.333.8.666 1.667.666 1.666 0 1.666-1.333 3.333-1.333.867 0 1.267.333 1.667.667.4.333.8.666 1.666.666 1.667 0 1.667-1.333 3.334-1.333.866 0 1.266.333 1.666.667M1.334 8c.4.333.8.666 1.667.666 1.666 0 1.666-1.333 3.333-1.333.867 0 1.267.333 1.667.667.4.333.8.666 1.666.666 1.667 0 1.667-1.333 3.334-1.333.866 0 1.266.333 1.666.667"
    />
  </svg>
)
const ForwardRef = forwardRef(TextureSm)
export default ForwardRef
