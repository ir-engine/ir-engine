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
const Grid01Sm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      <path d="M5.6 2H3.067c-.374 0-.56 0-.703.073a.67.67 0 0 0-.291.291C2 2.507 2 2.694 2 3.067V5.6c0 .373 0 .56.073.703a.67.67 0 0 0 .291.291c.143.073.33.073.703.073H5.6c.373 0 .56 0 .703-.073a.67.67 0 0 0 .291-.291c.073-.143.073-.33.073-.703V3.067c0-.374 0-.56-.073-.703a.67.67 0 0 0-.291-.291C6.16 2 5.973 2 5.6 2M12.933 2H10.4c-.373 0-.56 0-.703.073a.67.67 0 0 0-.291.291c-.073.143-.073.33-.073.703V5.6c0 .373 0 .56.073.703a.67.67 0 0 0 .291.291c.143.073.33.073.703.073h2.533c.374 0 .56 0 .703-.073a.67.67 0 0 0 .291-.291C14 6.16 14 5.973 14 5.6V3.067c0-.374 0-.56-.073-.703a.67.67 0 0 0-.291-.291C13.493 2 13.306 2 12.933 2M12.933 9.333H10.4c-.373 0-.56 0-.703.073a.67.67 0 0 0-.291.291c-.073.143-.073.33-.073.703v2.533c0 .374 0 .56.073.703a.67.67 0 0 0 .291.291c.143.073.33.073.703.073h2.533c.374 0 .56 0 .703-.073a.67.67 0 0 0 .291-.291c.073-.143.073-.33.073-.703V10.4c0-.373 0-.56-.073-.703a.67.67 0 0 0-.291-.291c-.143-.073-.33-.073-.703-.073M5.6 9.333H3.067c-.374 0-.56 0-.703.073a.67.67 0 0 0-.291.291C2 9.84 2 10.027 2 10.4v2.533c0 .374 0 .56.073.703a.67.67 0 0 0 .291.291c.143.073.33.073.703.073H5.6c.373 0 .56 0 .703-.073a.67.67 0 0 0 .291-.291c.073-.143.073-.33.073-.703V10.4c0-.373 0-.56-.073-.703a.67.67 0 0 0-.291-.291c-.143-.073-.33-.073-.703-.073" />
    </g>
  </svg>
)
const ForwardRef = forwardRef(Grid01Sm)
export default ForwardRef
