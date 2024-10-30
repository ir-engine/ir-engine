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
const Perspective02Lg = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M16 5v14M10 4v16m-7-8h18M3 5.99v12.02c0 1.365 0 2.047.281 2.52a2 2 0 0 0 1.093.877c.523.171 1.189.024 2.52-.272l11.6-2.578c.894-.199 1.341-.298 1.675-.538a2 2 0 0 0 .669-.834c.162-.378.162-.836.162-1.752V8.567c0-.916 0-1.374-.162-1.752a2 2 0 0 0-.669-.833c-.334-.24-.78-.34-1.675-.539l-11.6-2.578c-1.331-.295-1.997-.443-2.52-.271a2 2 0 0 0-1.093.876C3 3.943 3 4.625 3 5.99"
    />
  </svg>
)
const ForwardRef = forwardRef(Perspective02Lg)
export default ForwardRef
