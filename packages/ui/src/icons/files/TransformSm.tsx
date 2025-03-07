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
const TransformSm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M12.667 4.667v6.666M3.333 4.667v6.666m8-8H4.667m6.666 9.334H4.667m-1.6-8H3.6c.373 0 .56 0 .703-.073a.67.67 0 0 0 .291-.291c.073-.143.073-.33.073-.703v-.533c0-.374 0-.56-.073-.703a.67.67 0 0 0-.291-.291C4.16 2 3.973 2 3.6 2h-.533c-.374 0-.56 0-.703.073a.67.67 0 0 0-.291.291C2 2.507 2 2.694 2 3.067V3.6c0 .373 0 .56.073.703a.67.67 0 0 0 .291.291c.143.073.33.073.703.073m0 9.333H3.6c.373 0 .56 0 .703-.073a.67.67 0 0 0 .291-.291c.073-.143.073-.33.073-.703V12.4c0-.373 0-.56-.073-.703a.67.67 0 0 0-.291-.291c-.143-.073-.33-.073-.703-.073h-.533c-.374 0-.56 0-.703.073a.67.67 0 0 0-.291.291C2 11.84 2 12.027 2 12.4v.533c0 .374 0 .56.073.703a.67.67 0 0 0 .291.291c.143.073.33.073.703.073M12.4 4.667h.533c.374 0 .56 0 .703-.073a.67.67 0 0 0 .291-.291C14 4.16 14 3.973 14 3.6v-.533c0-.374 0-.56-.073-.703a.67.67 0 0 0-.291-.291C13.493 2 13.306 2 12.933 2H12.4c-.373 0-.56 0-.703.073a.67.67 0 0 0-.291.291c-.073.143-.073.33-.073.703V3.6c0 .373 0 .56.073.703a.67.67 0 0 0 .291.291c.143.073.33.073.703.073m0 9.333h.533c.374 0 .56 0 .703-.073a.67.67 0 0 0 .291-.291c.073-.143.073-.33.073-.703V12.4c0-.373 0-.56-.073-.703a.67.67 0 0 0-.291-.291c-.143-.073-.33-.073-.703-.073H12.4c-.373 0-.56 0-.703.073a.67.67 0 0 0-.291.291c-.073.143-.073.33-.073.703v.533c0 .374 0 .56.073.703a.67.67 0 0 0 .291.291c.143.073.33.073.703.073"
    />
  </svg>
)
const ForwardRef = forwardRef(TransformSm)
export default ForwardRef
