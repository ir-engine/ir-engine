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
const FastForwardSm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      <path d="M8.667 10.958c0 .753 0 1.13.152 1.315.133.16.332.25.54.242.239-.01.52-.26 1.084-.76l3.327-2.958c.31-.276.466-.414.523-.576a.67.67 0 0 0 0-.442c-.057-.163-.212-.3-.523-.576l-3.327-2.958c-.563-.501-.845-.751-1.084-.76a.67.67 0 0 0-.54.242c-.152.185-.152.561-.152 1.315zM1.334 10.958c0 .753 0 1.13.152 1.315.132.16.332.25.54.242.239-.01.52-.26 1.083-.76l3.328-2.958c.31-.276.465-.414.523-.576a.67.67 0 0 0 0-.442c-.058-.163-.213-.3-.523-.576L3.11 4.245c-.563-.501-.844-.751-1.083-.76a.67.67 0 0 0-.54.242c-.152.185-.152.561-.152 1.315z" />
    </g>
  </svg>
)
const ForwardRef = forwardRef(FastForwardSm)
export default ForwardRef
