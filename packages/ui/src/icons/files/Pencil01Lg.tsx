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
const Pencil01Lg = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="m3.5 21.5 5.55-2.134c.354-.136.532-.205.698-.294q.221-.12.42-.273c.149-.116.283-.25.552-.519L22 7a2.828 2.828 0 1 0-4-4L6.72 14.28c-.269.269-.403.403-.519.552a3 3 0 0 0-.273.42c-.089.167-.157.344-.294.699zm0 0 2.058-5.35c.147-.384.221-.575.347-.663a.5.5 0 0 1 .38-.08c.15.029.295.174.585.464l2.26 2.259c.29.29.435.435.464.586a.5.5 0 0 1-.08.379c-.089.126-.28.2-.663.347z"
    />
  </svg>
)
const ForwardRef = forwardRef(Pencil01Lg)
export default ForwardRef
