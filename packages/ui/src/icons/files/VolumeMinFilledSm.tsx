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
const VolumeMinFilledSm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      fill="#080808"
      d="M3 6.4c0-.373 0-.56.073-.702a.67.67 0 0 1 .291-.292c.143-.072.33-.072.703-.072h1.158c.163 0 .244 0 .321-.019a.7.7 0 0 0 .193-.08c.067-.04.125-.099.24-.214l2.11-2.11c.286-.286.429-.429.552-.438a.33.33 0 0 1 .28.116C9 2.682 9 2.884 9 3.288v9.425c0 .404 0 .606-.08.699a.33.33 0 0 1-.28.116c-.122-.01-.265-.153-.55-.438l-2.11-2.11c-.116-.116-.174-.174-.241-.215a.7.7 0 0 0-.193-.08c-.077-.018-.158-.018-.321-.018H4.067c-.374 0-.56 0-.703-.073a.67.67 0 0 1-.291-.291C3 10.16 3 9.973 3 9.6z"
    />
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12.163 5.334C12.691 6.09 13 7.009 13 8c0 .992-.31 1.911-.837 2.667M8.09 2.91 5.98 5.02a1.4 1.4 0 0 1-.241.214.7.7 0 0 1-.193.08c-.077.019-.158.019-.321.019H4.067c-.374 0-.56 0-.703.072a.67.67 0 0 0-.291.292C3 5.84 3 6.027 3 6.4v3.2c0 .374 0 .56.073.703a.67.67 0 0 0 .291.291c.143.073.33.073.703.073h1.158c.163 0 .244 0 .321.018a.7.7 0 0 1 .193.08c.067.041.125.1.24.214l2.11 2.11c.286.286.429.43.552.439a.33.33 0 0 0 .28-.116c.079-.094.079-.295.079-.7V3.289c0-.404 0-.606-.08-.7a.33.33 0 0 0-.28-.115c-.122.01-.265.152-.55.438"
    />
  </svg>
)
const ForwardRef = forwardRef(VolumeMinFilledSm)
export default ForwardRef
