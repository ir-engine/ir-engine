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
const PenTool01Md = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="m16 10.834-1.084-5.415c-.06-.303-.09-.454-.164-.577a.8.8 0 0 0-.26-.271c-.12-.079-.27-.115-.57-.187L2.666 1.667m0 0 2.717 11.256c.072.3.108.45.187.57q.106.16.27.26c.124.073.275.104.578.164L11.833 15M2.666 1.667l6.322 6.322m5.454 9.402 3.948-3.948c.33-.33.495-.495.557-.685a.83.83 0 0 0 0-.515c-.062-.19-.227-.356-.557-.686l-.614-.614c-.33-.33-.495-.495-.686-.557a.83.83 0 0 0-.515 0c-.19.062-.355.227-.685.557l-3.948 3.948c-.33.33-.495.495-.557.685a.83.83 0 0 0 0 .515c.062.19.227.355.557.685l.614.615c.33.33.496.495.686.557a.83.83 0 0 0 .515 0c.19-.062.355-.227.685-.557m-2.61-8.224a1.667 1.667 0 1 1-3.333 0 1.667 1.667 0 0 1 3.334 0"
    />
  </svg>
)
const ForwardRef = forwardRef(PenTool01Md)
export default ForwardRef
