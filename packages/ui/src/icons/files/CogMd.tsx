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
const CogMd = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      <path d="m7.829 16.143.487 1.095a1.843 1.843 0 0 0 3.37 0l.487-1.095a2.02 2.02 0 0 1 2.059-1.186l1.191.127a1.844 1.844 0 0 0 1.685-2.919l-.705-.97A2.02 2.02 0 0 1 16.02 10c0-.428.135-.844.387-1.19l.705-.97a1.842 1.842 0 0 0-.654-2.728 1.84 1.84 0 0 0-1.031-.19l-1.192.126a2.021 2.021 0 0 1-2.058-1.19l-.49-1.096a1.844 1.844 0 0 0-3.371 0l-.487 1.096a2.02 2.02 0 0 1-2.058 1.19l-1.196-.126A1.844 1.844 0 0 0 2.89 7.84l.706.97a2.02 2.02 0 0 1 0 2.381l-.706.97a1.843 1.843 0 0 0 1.685 2.918l1.192-.127a2.03 2.03 0 0 1 2.062 1.19" />
      <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5" />
    </g>
  </svg>
)
const ForwardRef = forwardRef(CogMd)
export default ForwardRef
