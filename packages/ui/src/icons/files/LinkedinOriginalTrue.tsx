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
const LinkedinOriginalTrue = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 48 48"
    role="img"
    stroke="currentColor"
    ref={ref}
    {...props}
  >
    <path
      fill="#0A66C2"
      d="M7 9.413A2.413 2.413 0 0 1 9.413 7h29.174A2.413 2.413 0 0 1 41 9.413v29.174A2.413 2.413 0 0 1 38.587 41H9.413A2.413 2.413 0 0 1 7 38.587z"
    />
    <g fill="#fff">
      <path d="M14.631 17.56a2.95 2.95 0 1 0 0-5.9 2.95 2.95 0 0 0 0 5.9M20.282 19.739h4.888v2.24s1.327-2.654 4.936-2.654c3.22 0 5.887 1.586 5.887 6.42V35.94h-5.066v-8.96c0-2.85-1.522-3.165-2.683-3.165-2.407 0-2.82 2.077-2.82 3.538v8.587h-5.142zM12.06 19.739h5.143V35.94H12.06z" />
    </g>
  </svg>
)
const ForwardRef = forwardRef(LinkedinOriginalTrue)
export default ForwardRef
