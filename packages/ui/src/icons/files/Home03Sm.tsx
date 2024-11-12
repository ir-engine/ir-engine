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
const Home03Sm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M6 14V9.067c0-.374 0-.56.072-.703a.67.67 0 0 1 .292-.291C6.506 8 6.693 8 7.066 8h1.867c.373 0 .56 0 .703.073a.67.67 0 0 1 .291.291c.073.143.073.33.073.703V14M1.333 6.333l6.027-4.52c.23-.172.344-.258.47-.291a.67.67 0 0 1 .34 0c.125.033.24.12.47.291l6.026 4.52m-12-1v6.534c0 .746 0 1.12.146 1.405.127.25.331.455.582.583C3.68 14 4.053 14 4.8 14h6.4c.746 0 1.12 0 1.405-.145.25-.128.455-.332.583-.583.145-.285.145-.659.145-1.405V5.333L9.28 2.293c-.46-.344-.689-.516-.94-.582a1.33 1.33 0 0 0-.68 0c-.252.066-.481.238-.94.582z"
    />
  </svg>
)
const ForwardRef = forwardRef(Home03Sm)
export default ForwardRef
