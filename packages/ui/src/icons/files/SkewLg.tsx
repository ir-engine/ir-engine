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
const SkewLg = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="m20.714 7-1.428 10M7.143 7 5.357 17M19 5H9m8 14H7M6.6 7h.8c.56 0 .84 0 1.054-.109a1 1 0 0 0 .437-.437C9 6.24 9 5.96 9 5.4v-.8c0-.56 0-.84-.109-1.054a1 1 0 0 0-.437-.437C8.24 3 7.96 3 7.4 3h-.8c-.56 0-.84 0-1.054.109a1 1 0 0 0-.437.437C5 3.76 5 4.04 5 4.6v.8c0 .56 0 .84.109 1.054a1 1 0 0 0 .437.437C5.76 7 6.04 7 6.6 7m-2 14h.8c.56 0 .84 0 1.054-.109a1 1 0 0 0 .437-.437C7 20.24 7 19.96 7 19.4v-.8c0-.56 0-.84-.109-1.054a1 1 0 0 0-.437-.437C6.24 17 5.96 17 5.4 17h-.8c-.56 0-.84 0-1.054.109a1 1 0 0 0-.437.437C3 17.76 3 18.04 3 18.6v.8c0 .56 0 .84.109 1.054a1 1 0 0 0 .437.437C3.76 21 4.04 21 4.6 21m16-14h.8c.56 0 .84 0 1.054-.109a1 1 0 0 0 .437-.437C23 6.24 23 5.96 23 5.4v-.8c0-.56 0-.84-.109-1.054a1 1 0 0 0-.437-.437C22.24 3 21.96 3 21.4 3h-.8c-.56 0-.84 0-1.054.109a1 1 0 0 0-.437.437C19 3.76 19 4.04 19 4.6v.8c0 .56 0 .84.109 1.054a1 1 0 0 0 .437.437C19.76 7 20.04 7 20.6 7m-2 14h.8c.56 0 .84 0 1.054-.109a1 1 0 0 0 .437-.437C21 20.24 21 19.96 21 19.4v-.8c0-.56 0-.84-.109-1.054a1 1 0 0 0-.437-.437C20.24 17 19.96 17 19.4 17h-.8c-.56 0-.84 0-1.054.109a1 1 0 0 0-.437.437C17 17.76 17 18.04 17 18.6v.8c0 .56 0 .84.109 1.054a1 1 0 0 0 .437.437C17.76 21 18.04 21 18.6 21"
    />
  </svg>
)
const ForwardRef = forwardRef(SkewLg)
export default ForwardRef
