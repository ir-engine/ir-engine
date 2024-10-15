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
const Copy03Lg = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 24 24" ref={ref} {...props}>
    <path
      stroke="#080808"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 8V5.2c0-1.12 0-1.68.218-2.108a2 2 0 0 1 .874-.874C9.52 2 10.08 2 11.2 2h7.6c1.12 0 1.68 0 2.108.218a2 2 0 0 1 .874.874C22 3.52 22 4.08 22 5.2v7.6c0 1.12 0 1.68-.218 2.108a2 2 0 0 1-.874.874C20.48 16 19.92 16 18.8 16H16M5.2 22h7.6c1.12 0 1.68 0 2.108-.218a2 2 0 0 0 .874-.874C16 20.48 16 19.92 16 18.8v-7.6c0-1.12 0-1.68-.218-2.108a2 2 0 0 0-.874-.874C14.48 8 13.92 8 12.8 8H5.2c-1.12 0-1.68 0-2.108.218a2 2 0 0 0-.874.874C2 9.52 2 10.08 2 11.2v7.6c0 1.12 0 1.68.218 2.108a2 2 0 0 0 .874.874C3.52 22 4.08 22 5.2 22"
    />
  </svg>
)
const ForwardRef = forwardRef(Copy03Lg)
export default ForwardRef
