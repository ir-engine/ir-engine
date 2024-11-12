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
const Cursor03Lg = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M4.712 3.674c-.541-.213-.811-.32-.984-.262a.5.5 0 0 0-.316.316c-.057.173.049.443.262.984l5.3 13.455c.172.435.258.653.398.74a.5.5 0 0 0 .408.055c.158-.047.298-.234.579-.608l2.14-2.854 3.45 4.742c.19.261.284.392.405.446a.5.5 0 0 0 .338.027c.128-.035.242-.15.47-.377l3.176-3.176c.227-.228.341-.342.377-.47a.5.5 0 0 0-.027-.338c-.054-.12-.185-.215-.446-.405l-4.742-3.45 2.854-2.14c.374-.28.561-.421.608-.58a.5.5 0 0 0-.055-.407c-.087-.14-.305-.226-.74-.397z"
    />
  </svg>
)
const ForwardRef = forwardRef(Cursor03Lg)
export default ForwardRef
