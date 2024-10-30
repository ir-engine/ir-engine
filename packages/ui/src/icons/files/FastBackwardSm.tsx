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
const FastBackwardSm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
    <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}>
      <path d="M14.667 10.958c0 .753 0 1.13-.153 1.315a.67.67 0 0 1-.54.242c-.238-.01-.52-.26-1.083-.76L9.563 8.797c-.31-.276-.465-.414-.522-.576a.67.67 0 0 1 0-.442c.057-.163.212-.3.522-.576l3.328-2.958c.563-.501.845-.751 1.084-.76a.67.67 0 0 1 .54.242c.151.185.151.561.151 1.315zM7.333 10.958c0 .753 0 1.13-.152 1.315a.67.67 0 0 1-.54.242c-.239-.01-.52-.26-1.083-.76L2.23 8.797c-.31-.276-.465-.414-.522-.576a.67.67 0 0 1 0-.442c.057-.163.212-.3.522-.576l3.328-2.958c.563-.501.844-.751 1.084-.76a.67.67 0 0 1 .539.242c.152.185.152.561.152 1.315z" />
    </g>
  </svg>
)
const ForwardRef = forwardRef(FastBackwardSm)
export default ForwardRef
