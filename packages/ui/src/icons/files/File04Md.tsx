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
const File04Md = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M11.667 1.892v3.442c0 .466 0 .7.091.878.08.157.208.284.364.364.179.091.412.091.879.091h3.442m.224 1.657v6.01c0 1.4 0 2.1-.272 2.635a2.5 2.5 0 0 1-1.093 1.092c-.534.273-1.235.273-2.635.273H7.334c-1.4 0-2.1 0-2.635-.273a2.5 2.5 0 0 1-1.093-1.092c-.272-.535-.272-1.235-.272-2.635V5.667c0-1.4 0-2.1.272-2.635A2.5 2.5 0 0 1 4.7 1.939c.535-.272 1.235-.272 2.635-.272h2.677c.61 0 .917 0 1.204.07a2.5 2.5 0 0 1 .723.298c.252.155.468.371.9.804l2.658 2.656c.432.433.648.649.803.901.137.224.238.468.3.723.068.288.068.593.068 1.205"
    />
  </svg>
)
const ForwardRef = forwardRef(File04Md)
export default ForwardRef
