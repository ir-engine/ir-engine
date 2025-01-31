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
const Emote = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 22 24"
    role="img"
    stroke="currentColor"
    ref={ref}
    {...props}
  >
    <g fill="#080808">
      <path
        fillRule="evenodd"
        d="m14.625 2.739-3.089 1.055 4.824 1.723 1.281 4.42 1.385-4.272a10.9 10.9 0 0 1 2.869 7.388C21.895 19.099 16.993 24 10.947 24S0 19.1 0 13.053 4.901 2.105 10.947 2.105c1.29 0 2.529.224 3.678.634m-3.678 19.577a9.263 9.263 0 0 0 9.14-10.783c-6.557.607-9.477-3.34-10.403-4.796-1.01 3.7-5.88 5.328-7.99 5.892q-.01.21-.01.424a9.263 9.263 0 0 0 9.263 9.263m-1.684-8a1.263 1.263 0 1 1-2.526 0 1.263 1.263 0 0 1 2.526 0m4.632 1.263a1.263 1.263 0 1 0 0-2.526 1.263 1.263 0 0 0 0 2.526"
        clipRule="evenodd"
      />
      <path d="m17.684 0-.795 2.743-2.994 1.023 2.994 1.07.795 2.743.89-2.743 2.9-1.07-2.9-1.023z" />
    </g>
  </svg>
)
const ForwardRef = forwardRef(Emote)
export default ForwardRef
