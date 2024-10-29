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
const FastForwardMd = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
    <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}>
      <path d="M10.833 13.697c0 .942 0 1.413.19 1.644.165.2.415.312.674.303.3-.012.651-.325 1.355-.95l4.16-3.698c.387-.344.581-.517.653-.72a.83.83 0 0 0 0-.552c-.072-.204-.266-.376-.653-.72l-4.16-3.698c-.704-.626-1.056-.939-1.355-.95a.83.83 0 0 0-.674.303c-.19.23-.19.702-.19 1.643zM1.666 13.697c0 .942 0 1.413.19 1.644.165.2.415.312.675.303.298-.012.65-.325 1.354-.95l4.16-3.698c.388-.344.582-.517.653-.72a.83.83 0 0 0 0-.552c-.071-.204-.265-.376-.653-.72l-4.16-3.698c-.704-.626-1.056-.939-1.354-.95a.83.83 0 0 0-.675.303c-.19.23-.19.702-.19 1.643z" />
    </g>
  </svg>
)
const ForwardRef = forwardRef(FastForwardMd)
export default ForwardRef
