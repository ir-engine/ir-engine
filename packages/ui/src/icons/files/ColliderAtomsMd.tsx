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
const ColliderAtomsMd = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M14.263 12.799a17 17 0 0 1-.71.754c-3.58 3.58-8.065 4.899-10.017 2.946-1.339-1.338-1.14-3.867.271-6.479m1.935-2.749q.351-.4.74-.789c3.58-3.58 8.065-4.899 10.017-2.946 1.34 1.34 1.14 3.87-.274 6.484m-2.672-3.538c3.58 3.58 4.899 8.065 2.946 10.017-1.952 1.953-6.437.634-10.017-2.946S1.583 5.488 3.536 3.536c1.952-1.953 6.437-.634 10.017 2.946M10.833 10a.833.833 0 1 1-1.666 0 .833.833 0 0 1 1.667 0"
    />
  </svg>
)
const ForwardRef = forwardRef(ColliderAtomsMd)
export default ForwardRef
