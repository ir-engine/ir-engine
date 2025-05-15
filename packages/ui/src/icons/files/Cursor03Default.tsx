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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Cursor03Default = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 20 20"
    role="img"
    stroke="currentColor"
    ref={ref}
    {...props}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M3.92594 3.0623C3.47547 2.88484 3.25024 2.79611 3.10672 2.84385C2.9821 2.8853 2.88432 2.98308 2.84287 3.1077C2.79513 3.25121 2.88386 3.47645 3.06132 3.92692L7.47851 15.1398C7.62144 15.5026 7.69291 15.684 7.80937 15.7568C7.91091 15.8203 8.03484 15.837 8.14956 15.8027C8.28116 15.7634 8.39814 15.6074 8.63212 15.2954L10.416 12.917L13.2904 16.8693C13.4485 17.0866 13.5275 17.1953 13.6281 17.2407C13.7165 17.2805 13.816 17.2883 13.9095 17.2627C14.016 17.2336 14.111 17.1386 14.301 16.9486L16.9476 14.302C17.1376 14.112 17.2326 14.017 17.2618 13.9105C17.2874 13.817 17.2796 13.7175 17.2397 13.6291C17.1943 13.5284 17.0856 13.4494 16.8683 13.2914L12.916 10.417L15.2945 8.63309C15.6064 8.39912 15.7624 8.28213 15.8017 8.15054C15.836 8.03581 15.8193 7.91188 15.7558 7.81035C15.683 7.69388 15.5016 7.62242 15.1388 7.47949L3.92594 3.0623Z"
    />
  </svg>
)
const ForwardRef = forwardRef(Cursor03Default)
export default ForwardRef
