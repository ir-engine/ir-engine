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
const TriangleMd = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M1.992 15.082 8.846 3.243c.379-.654.568-.981.816-1.091a.83.83 0 0 1 .677 0c.247.11.436.437.815 1.091l6.854 11.84c.38.656.57.984.542 1.254a.83.83 0 0 1-.338.587c-.22.16-.599.16-1.358.16H3.146c-.759 0-1.138 0-1.357-.16a.83.83 0 0 1-.339-.587c-.028-.27.162-.598.542-1.255"
    />
  </svg>
)
const ForwardRef = forwardRef(TriangleMd)
export default ForwardRef
