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
const UnitMeterSm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 17 16"
    role="img"
    stroke="currentColor"
    ref={ref}
    {...props}
  >
    <path
      fill="#5F7DBF"
      d="M4.077 11.072v-6h1.068l.072 1.104v4.896zm4.152 0V8l1.14-.36v3.432zm4.152 0V8l1.128-.36v3.432zM8.229 8q0-.816-.192-1.236-.18-.432-.516-.6a1.7 1.7 0 0 0-.756-.18q-.732 0-1.14.516t-.408 1.452h-.492q0-.948.276-1.62.276-.684.792-1.044.528-.36 1.26-.36 1.08 0 1.692.672.624.66.624 2.04zm4.152 0q0-.816-.192-1.236-.192-.432-.516-.6a1.7 1.7 0 0 0-.756-.18q-.732 0-1.14.516t-.408 1.452h-.492q0-.948.276-1.62.276-.684.792-1.044.528-.36 1.26-.36 1.08 0 1.692.672.624.66.612 2.04z"
    />
  </svg>
)
const ForwardRef = forwardRef(UnitMeterSm)
export default ForwardRef
