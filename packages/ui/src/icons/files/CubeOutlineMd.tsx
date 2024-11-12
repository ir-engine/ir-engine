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
const CubeOutlineMd = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="m8.125 17.292 1.227.682c.237.131.355.197.48.223.11.023.225.023.336 0 .125-.026.243-.092.48-.223l1.227-.682m-7.5-2.083-1.19-.66c-.249-.14-.374-.209-.464-.307a.8.8 0 0 1-.179-.304c-.042-.127-.042-.27-.042-.555v-1.3m0-4.166V6.618c0-.285 0-.428.042-.555a.8.8 0 0 1 .179-.304c.09-.098.215-.168.465-.306l1.189-.66m3.75-2.084 1.227-.682c.237-.131.355-.197.48-.223a.8.8 0 0 1 .336 0c.125.026.243.092.48.223l1.227.682m3.75 2.083 1.19.66c.249.14.374.209.464.307q.122.133.179.304c.042.127.042.27.042.555v1.3m0 4.166v1.299c0 .285 0 .428-.042.555a.8.8 0 0 1-.178.303c-.091.1-.216.168-.466.307l-1.189.66m-7.5-6.25L10 10.002m0 0 1.875-1.042M10 10v2.083m-7.5-6.25 1.875 1.041m11.25 0L17.5 5.834M10 16.25v2.083"
    />
  </svg>
)
const ForwardRef = forwardRef(CubeOutlineMd)
export default ForwardRef
