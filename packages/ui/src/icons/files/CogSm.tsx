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
const CogSm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      <path d="m6.264 12.914.39.876a1.475 1.475 0 0 0 2.696 0l.39-.876a1.62 1.62 0 0 1 1.646-.95l.953.102a1.474 1.474 0 0 0 1.348-2.334l-.564-.776A1.62 1.62 0 0 1 12.816 8c0-.343.109-.676.31-.953l.564-.775a1.474 1.474 0 0 0-1.348-2.335l-.953.101a1.617 1.617 0 0 1-1.647-.953L9.35 2.21a1.475 1.475 0 0 0-2.697 0l-.39.877a1.62 1.62 0 0 1-1.646.952l-.956-.101a1.475 1.475 0 0 0-1.348 2.335l.564.775a1.62 1.62 0 0 1 0 1.905l-.564.776a1.474 1.474 0 0 0 1.348 2.335l.953-.102a1.62 1.62 0 0 1 1.65.953" />
      <path d="M8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4" />
    </g>
  </svg>
)
const ForwardRef = forwardRef(CogSm)
export default ForwardRef
