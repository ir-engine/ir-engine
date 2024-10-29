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
const Camera01Sm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      <path d="M1.334 5.584c0-.233 0-.35.01-.448a2 2 0 0 1 1.793-1.793c.098-.01.221-.01.467-.01.095 0 .143 0 .183-.002a1.33 1.33 0 0 0 1.156-.834c.015-.037.03-.08.058-.164s.042-.127.057-.164a1.33 1.33 0 0 1 1.156-.834c.04-.002.085-.002.174-.002h3.225c.09 0 .134 0 .174.002.514.032.964.356 1.156.834.016.037.03.08.058.164s.042.127.057.164c.192.478.642.802 1.156.834.04.002.088.002.183.002.246 0 .37 0 .467.01a2 2 0 0 1 1.794 1.793c.01.098.01.215.01.448V10.8c0 1.12 0 1.68-.219 2.108a2 2 0 0 1-.874.874c-.427.218-.988.218-2.108.218H4.534c-1.12 0-1.68 0-2.108-.218a2 2 0 0 1-.874-.874c-.218-.428-.218-.988-.218-2.108z" />
      <path d="M8 11a2.667 2.667 0 1 0 0-5.334A2.667 2.667 0 0 0 8 11" />
    </g>
  </svg>
)
const ForwardRef = forwardRef(Camera01Sm)
export default ForwardRef
