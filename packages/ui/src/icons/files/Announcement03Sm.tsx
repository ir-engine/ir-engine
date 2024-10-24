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
const Announcement03Sm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M12.333 10.667c1.289 0 2.333-1.94 2.333-4.334S13.622 2 12.333 2m0 8.667c-1.289 0-2.333-1.94-2.333-4.334S11.044 2 12.333 2m0 8.667L3.629 9.084c-.619-.112-.928-.169-1.178-.291A2 2 0 0 1 1.41 7.544c-.076-.268-.076-.582-.076-1.21 0-.63 0-.943.076-1.211a2 2 0 0 1 1.042-1.249c.25-.123.56-.179 1.178-.291L12.333 2m-9 7.333.263 3.676c.025.35.037.524.113.656.067.117.167.21.288.269.138.066.313.066.663.066h1.188c.4 0 .6 0 .748-.08a.67.67 0 0 0 .293-.316c.068-.154.053-.354.022-.752l-.245-3.185"
    />
  </svg>
)
const ForwardRef = forwardRef(Announcement03Sm)
export default ForwardRef
