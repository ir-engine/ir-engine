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
const Rows01Sm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      <path d="M11.867 6.667c.746 0 1.12 0 1.405-.146.25-.127.455-.331.583-.582C14 5.653 14 5.28 14 4.533v-.4c0-.746 0-1.12-.145-1.405a1.33 1.33 0 0 0-.583-.583C12.987 2 12.613 2 11.867 2H4.133c-.746 0-1.12 0-1.405.145-.25.128-.455.332-.583.583C2 3.013 2 3.387 2 4.133v.4c0 .747 0 1.12.145 1.406.128.25.332.455.583.582.285.146.659.146 1.405.146zM11.867 14c.746 0 1.12 0 1.405-.145.25-.128.455-.332.583-.583.145-.285.145-.659.145-1.405v-.4c0-.747 0-1.12-.145-1.406a1.33 1.33 0 0 0-.583-.582c-.285-.146-.659-.146-1.405-.146H4.133c-.746 0-1.12 0-1.405.146-.25.127-.455.331-.583.582C2 10.347 2 10.72 2 11.467v.4c0 .746 0 1.12.145 1.405.128.25.332.455.583.583.285.145.659.145 1.405.145z" />
    </g>
  </svg>
)
const ForwardRef = forwardRef(Rows01Sm)
export default ForwardRef
