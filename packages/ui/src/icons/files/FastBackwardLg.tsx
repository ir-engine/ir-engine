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
const FastBackwardLg = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
    <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}>
      <path d="M21.999 16.437c0 1.13 0 1.695-.229 1.972a1 1 0 0 1-.809.363c-.358-.013-.78-.389-1.625-1.14l-4.992-4.436c-.465-.414-.698-.62-.784-.865a1 1 0 0 1 0-.663c.086-.244.319-.45.784-.864l4.992-4.437c.844-.75 1.267-1.126 1.625-1.14a1 1 0 0 1 .81.364c.228.277.228.842.228 1.972zM10.999 16.437c0 1.13 0 1.695-.229 1.972a1 1 0 0 1-.809.363c-.358-.013-.78-.389-1.625-1.14l-4.992-4.436c-.465-.414-.698-.62-.784-.865a1 1 0 0 1 0-.663c.086-.244.319-.45.784-.864l4.992-4.437c.844-.75 1.267-1.126 1.625-1.14a1 1 0 0 1 .81.364c.228.277.228.842.228 1.972z" />
    </g>
  </svg>
)
const ForwardRef = forwardRef(FastBackwardLg)
export default ForwardRef
