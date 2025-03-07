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
      d="M12.6667 4.66667V11.3333M3.33333 4.66667V11.3333M11.3333 3.33333L4.66667 3.33333M11.3333 12.6667H4.66667M3.06667 4.66667H3.6C3.97337 4.66667 4.16005 4.66667 4.30266 4.594C4.4281 4.53009 4.53009 4.4281 4.594 4.30266C4.66667 4.16005 4.66667 3.97337 4.66667 3.6V3.06667C4.66667 2.6933 4.66667 2.50661 4.594 2.36401C4.53009 2.23856 4.4281 2.13658 4.30266 2.07266C4.16005 2 3.97337 2 3.6 2H3.06667C2.6933 2 2.50661 2 2.36401 2.07266C2.23856 2.13658 2.13658 2.23856 2.07266 2.36401C2 2.50661 2 2.6933 2 3.06667V3.6C2 3.97337 2 4.16005 2.07266 4.30266C2.13658 4.4281 2.23856 4.53009 2.36401 4.594C2.50661 4.66667 2.6933 4.66667 3.06667 4.66667ZM3.06667 14H3.6C3.97337 14 4.16005 14 4.30266 13.9273C4.4281 13.8634 4.53009 13.7614 4.594 13.636C4.66667 13.4934 4.66667 13.3067 4.66667 12.9333V12.4C4.66667 12.0266 4.66667 11.8399 4.594 11.6973C4.53009 11.5719 4.4281 11.4699 4.30266 11.406C4.16005 11.3333 3.97337 11.3333 3.6 11.3333H3.06667C2.6933 11.3333 2.50661 11.3333 2.36401 11.406C2.23856 11.4699 2.13658 11.5719 2.07266 11.6973C2 11.8399 2 12.0266 2 12.4V12.9333C2 13.3067 2 13.4934 2.07266 13.636C2.13658 13.7614 2.23856 13.8634 2.36401 13.9273C2.50661 14 2.6933 14 3.06667 14ZM12.4 4.66667H12.9333C13.3067 4.66667 13.4934 4.66667 13.636 4.594C13.7614 4.53009 13.8634 4.4281 13.9273 4.30266C14 4.16005 14 3.97337 14 3.6V3.06667C14 2.6933 14 2.50661 13.9273 2.36401C13.8634 2.23856 13.7614 2.13658 13.636 2.07266C13.4934 2 13.3067 2 12.9333 2H12.4C12.0266 2 11.8399 2 11.6973 2.07266C11.5719 2.13658 11.4699 2.23856 11.406 2.36401C11.3333 2.50661 11.3333 2.6933 11.3333 3.06667V3.6C11.3333 3.97337 11.3333 4.16005 11.406 4.30266C11.4699 4.4281 11.5719 4.53009 11.6973 4.594C11.8399 4.66667 12.0266 4.66667 12.4 4.66667ZM12.4 14H12.9333C13.3067 14 13.4934 14 13.636 13.9273C13.7614 13.8634 13.8634 13.7614 13.9273 13.636C14 13.4934 14 13.3067 14 12.9333V12.4C14 12.0266 14 11.8399 13.9273 11.6973C13.8634 11.5719 13.7614 11.4699 13.636 11.406C13.4934 11.3333 13.3067 11.3333 12.9333 11.3333H12.4C12.0266 11.3333 11.8399 11.3333 11.6973 11.406C11.5719 11.4699 11.4699 11.5719 11.406 11.6973C11.3333 11.8399 11.3333 12.0266 11.3333 12.4V12.9333C11.3333 13.3067 11.3333 13.4934 11.406 13.636C11.4699 13.7614 11.5719 13.8634 11.6973 13.9273C11.8399 14 12.0266 14 12.4 14Z"
    />
  </svg>
)
const ForwardRef = forwardRef(TransformSm)
export default ForwardRef
