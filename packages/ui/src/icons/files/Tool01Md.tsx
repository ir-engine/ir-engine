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
const Tool01Md = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M13.026 6.36c-.33-.33-.495-.495-.557-.685a.84.84 0 0 1 0-.516c.062-.19.227-.355.557-.685L15.39 2.11a5 5 0 0 0-6.916 5.746c.1.407.149.611.14.74a.7.7 0 0 1-.092.326c-.059.115-.173.229-.4.456l-5.207 5.207a1.768 1.768 0 0 0 2.5 2.5l5.207-5.207c.227-.227.341-.341.456-.4a.7.7 0 0 1 .326-.092c.129-.009.333.04.74.14q.573.14 1.188.142a5 5 0 0 0 4.558-7.058l-2.365 2.365c-.33.33-.495.495-.686.557a.83.83 0 0 1-.515 0c-.19-.062-.355-.227-.685-.557z"
    />
  </svg>
)
const ForwardRef = forwardRef(Tool01Md)
export default ForwardRef
