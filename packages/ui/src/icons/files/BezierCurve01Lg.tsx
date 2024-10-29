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
const BezierCurve01Lg = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 24 24"
    role="img"
    stroke="currentColor"
    ref={ref}
    {...props}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11 7H4m18 0h-7m0 .252c3.45.888 6 4.02 6 7.748M5 15c0-3.728 2.55-6.86 6-7.748M4.6 19h.8c.56 0 .84 0 1.054-.109a1 1 0 0 0 .437-.437C7 18.24 7 17.96 7 17.4v-.8c0-.56 0-.84-.109-1.054a1 1 0 0 0-.437-.437C6.24 15 5.96 15 5.4 15h-.8c-.56 0-.84 0-1.054.109a1 1 0 0 0-.437.437C3 15.76 3 16.04 3 16.6v.8c0 .56 0 .84.109 1.054a1 1 0 0 0 .437.437C3.76 19 4.04 19 4.6 19m8-10h.8c.56 0 .84 0 1.054-.109a1 1 0 0 0 .437-.437C15 8.24 15 7.96 15 7.4v-.8c0-.56 0-.84-.109-1.054a1 1 0 0 0-.437-.437C14.24 5 13.96 5 13.4 5h-.8c-.56 0-.84 0-1.054.109a1 1 0 0 0-.437.437C11 5.76 11 6.04 11 6.6v.8c0 .56 0 .84.109 1.054a1 1 0 0 0 .437.437C11.76 9 12.04 9 12.6 9m8 10h.8c.56 0 .84 0 1.054-.109a1 1 0 0 0 .437-.437C23 18.24 23 17.96 23 17.4v-.8c0-.56 0-.84-.109-1.054a1 1 0 0 0-.437-.437C22.24 15 21.96 15 21.4 15h-.8c-.56 0-.84 0-1.054.109a1 1 0 0 0-.437.437C19 15.76 19 16.04 19 16.6v.8c0 .56 0 .84.109 1.054a1 1 0 0 0 .437.437C19.76 19 20.04 19 20.6 19M23 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0M5 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0"
    />
  </svg>
)
const ForwardRef = forwardRef(BezierCurve01Lg)
export default ForwardRef
