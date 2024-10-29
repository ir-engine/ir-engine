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
const Perspective01Lg = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M20 9v6M6 7v10M18 6.714 8 5.286m10 12L8 18.714M5.6 7h.8c.56 0 .84 0 1.054-.109a1 1 0 0 0 .437-.437C8 6.24 8 5.96 8 5.4v-.8c0-.56 0-.84-.109-1.054a1 1 0 0 0-.437-.437C7.24 3 6.96 3 6.4 3h-.8c-.56 0-.84 0-1.054.109a1 1 0 0 0-.437.437C4 3.76 4 4.04 4 4.6v.8c0 .56 0 .84.109 1.054a1 1 0 0 0 .437.437C4.76 7 5.04 7 5.6 7m0 14h.8c.56 0 .84 0 1.054-.109a1 1 0 0 0 .437-.437C8 20.24 8 19.96 8 19.4v-.8c0-.56 0-.84-.109-1.054a1 1 0 0 0-.437-.437C7.24 17 6.96 17 6.4 17h-.8c-.56 0-.84 0-1.054.109a1 1 0 0 0-.437.437C4 17.76 4 18.04 4 18.6v.8c0 .56 0 .84.109 1.054a1 1 0 0 0 .437.437C4.76 21 5.04 21 5.6 21m14-12h.8c.56 0 .84 0 1.054-.109a1 1 0 0 0 .437-.437C22 8.24 22 7.96 22 7.4v-.8c0-.56 0-.84-.109-1.054a1 1 0 0 0-.437-.437C21.24 5 20.96 5 20.4 5h-.8c-.56 0-.84 0-1.054.109a1 1 0 0 0-.437.437C18 5.76 18 6.04 18 6.6v.8c0 .56 0 .84.109 1.054a1 1 0 0 0 .437.437C18.76 9 19.04 9 19.6 9m0 10h.8c.56 0 .84 0 1.054-.109a1 1 0 0 0 .437-.437C22 18.24 22 17.96 22 17.4v-.8c0-.56 0-.84-.109-1.054a1 1 0 0 0-.437-.437C21.24 15 20.96 15 20.4 15h-.8c-.56 0-.84 0-1.054.109a1 1 0 0 0-.437.437C18 15.76 18 16.04 18 16.6v.8c0 .56 0 .84.109 1.054a1 1 0 0 0 .437.437C18.76 19 19.04 19 19.6 19"
    />
  </svg>
)
const ForwardRef = forwardRef(Perspective01Lg)
export default ForwardRef
