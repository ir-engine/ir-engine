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
const Hexagon01Md = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M9.352 2.027c.237-.131.355-.197.48-.223a.8.8 0 0 1 .336 0c.125.026.243.092.48.223l6.166 3.426c.25.138.375.208.465.306q.122.133.179.304c.042.127.042.27.042.555v6.765c0 .285 0 .428-.042.555a.8.8 0 0 1-.178.303c-.091.1-.216.168-.466.307l-6.166 3.426c-.237.131-.355.197-.48.223a.8.8 0 0 1-.336 0c-.125-.026-.243-.092-.48-.223l-6.166-3.426c-.25-.139-.375-.208-.465-.306a.8.8 0 0 1-.179-.304c-.042-.127-.042-.27-.042-.555V6.618c0-.285 0-.428.042-.555a.8.8 0 0 1 .179-.304c.09-.098.215-.168.465-.306z"
    />
  </svg>
)
const ForwardRef = forwardRef(Hexagon01Md)
export default ForwardRef
