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
const Tool01Sm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M10.42 5.087c-.263-.264-.395-.396-.445-.548a.67.67 0 0 1 0-.412c.05-.152.182-.284.446-.548l1.892-1.892A4 4 0 0 0 6.78 6.284c.08.325.12.488.112.591a.6.6 0 0 1-.073.261c-.047.092-.138.183-.32.365l-4.166 4.165a1.414 1.414 0 0 0 2 2L8.5 9.501c.182-.182.273-.273.364-.32a.6.6 0 0 1 .261-.074c.103-.007.267.033.593.113q.457.112.95.113a4 4 0 0 0 3.646-5.646l-1.892 1.892c-.264.264-.396.396-.548.445a.67.67 0 0 1-.412 0c-.153-.05-.285-.181-.549-.445z"
    />
  </svg>
)
const ForwardRef = forwardRef(Tool01Sm)
export default ForwardRef
