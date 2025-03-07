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
      d="M3.926 3.062c-.45-.177-.676-.266-.82-.218a.42.42 0 0 0-.263.264c-.048.143.04.368.218.819L7.48 15.14c.142.363.214.544.33.617.102.063.226.08.34.046.132-.04.25-.196.483-.508l1.784-2.378 2.874 3.952c.159.218.238.326.338.372.088.04.188.047.281.022.107-.03.202-.124.392-.314l2.647-2.647c.19-.19.285-.285.314-.391a.42.42 0 0 0-.022-.282c-.046-.1-.154-.18-.372-.338l-3.952-2.874 2.378-1.784c.312-.234.468-.35.508-.482a.42.42 0 0 0-.046-.34c-.073-.117-.254-.189-.617-.332z"
    />
  </svg>
)
const ForwardRef = forwardRef(Cursor03Default)
export default ForwardRef
