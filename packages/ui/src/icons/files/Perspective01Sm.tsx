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
const Perspective01Sm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M13.667 6v4M4.333 4.667v6.666m8-6.857-6.666-.952m6.666 8-6.666.952m-1.6-7.81H4.6c.373 0 .56 0 .703-.072a.67.67 0 0 0 .291-.291c.073-.143.073-.33.073-.703v-.533c0-.374 0-.56-.073-.703a.67.67 0 0 0-.291-.291C5.16 2 4.973 2 4.6 2h-.533c-.374 0-.56 0-.703.073a.67.67 0 0 0-.291.291C3 2.507 3 2.694 3 3.067V3.6c0 .373 0 .56.073.703a.67.67 0 0 0 .291.291c.143.073.33.073.703.073m0 9.334H4.6c.373 0 .56 0 .703-.073a.67.67 0 0 0 .291-.291c.073-.143.073-.33.073-.703V12.4c0-.373 0-.56-.073-.703a.67.67 0 0 0-.291-.291c-.143-.073-.33-.073-.703-.073h-.533c-.374 0-.56 0-.703.073a.67.67 0 0 0-.291.291C3 11.84 3 12.027 3 12.4v.533c0 .374 0 .56.073.703a.67.67 0 0 0 .291.291c.143.073.33.073.703.073M13.4 6h.533c.374 0 .56 0 .703-.073a.67.67 0 0 0 .291-.291c.073-.143.073-.33.073-.703V4.4c0-.373 0-.56-.073-.703a.67.67 0 0 0-.291-.291c-.143-.073-.33-.073-.703-.073H13.4c-.373 0-.56 0-.703.073a.67.67 0 0 0-.291.291c-.073.143-.073.33-.073.703v.533c0 .374 0 .56.073.703a.67.67 0 0 0 .291.291c.143.073.33.073.703.073m0 6.667h.533c.374 0 .56 0 .703-.073a.67.67 0 0 0 .291-.291c.073-.143.073-.33.073-.703v-.533c0-.374 0-.56-.073-.703a.67.67 0 0 0-.291-.291c-.143-.073-.33-.073-.703-.073H13.4c-.373 0-.56 0-.703.073a.67.67 0 0 0-.291.291c-.073.143-.073.33-.073.703v.533c0 .373 0 .56.073.703a.67.67 0 0 0 .291.291c.143.073.33.073.703.073"
    />
  </svg>
)
const ForwardRef = forwardRef(Perspective01Sm)
export default ForwardRef
