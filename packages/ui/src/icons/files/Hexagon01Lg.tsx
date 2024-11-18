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
const Hexagon01Lg = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M11.223 2.431c.284-.157.425-.236.575-.267a1 1 0 0 1 .403 0c.15.03.292.11.576.267l7.4 4.111c.3.167.45.25.558.368a1 1 0 0 1 .215.364c.05.153.05.324.05.667v8.117c0 .343 0 .514-.05.667a1 1 0 0 1-.215.364c-.109.118-.258.201-.558.368l-7.4 4.11c-.284.159-.425.237-.575.268a1 1 0 0 1-.403 0c-.15-.03-.292-.11-.576-.267l-7.4-4.111c-.3-.167-.45-.25-.558-.368a1 1 0 0 1-.215-.364C3 16.572 3 16.4 3 16.058V7.941c0-.343 0-.514.05-.667a1 1 0 0 1 .215-.364c.109-.118.258-.201.558-.368z"
    />
  </svg>
)
const ForwardRef = forwardRef(Hexagon01Lg)
export default ForwardRef
