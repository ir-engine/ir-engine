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
const Maximize02Default = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M5.629 2.667H5.51c-.995 0-1.493 0-1.873.194-.335.17-.607.442-.777.777-.194.38-.194.878-.194 1.873v.119m2.963 7.704H5.51c-.995 0-1.493 0-1.873-.194a1.78 1.78 0 0 1-.777-.777c-.194-.38-.194-.878-.194-1.874v-.118M13.333 5.63v-.119c0-.995 0-1.493-.194-1.873a1.78 1.78 0 0 0-.777-.777c-.38-.194-.878-.194-1.874-.194h-.118m2.963 7.704v.118c0 .996 0 1.494-.194 1.874-.17.335-.442.607-.777.777-.38.194-.878.194-1.874.194h-.118"
    />
  </svg>
)
const ForwardRef = forwardRef(Maximize02Default)
export default ForwardRef
