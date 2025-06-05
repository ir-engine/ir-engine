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
const EmoteM = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 19 20"
    role="img"
    ref={ref}
    {...props}
  >
    <g fill="currentColor">
      <path
        fillRule="evenodd"
        d="m12.188 2.282-2.575.88 4.02 1.435 1.068 3.683 1.154-3.56a9.123 9.123 0 1 1-6.732-2.966c1.075 0 2.107.186 3.065.528M9.123 18.596a7.72 7.72 0 0 0 7.616-8.986c-5.464.507-7.898-2.783-8.67-3.996-.84 3.083-4.899 4.44-6.658 4.91a7.72 7.72 0 0 0 7.711 8.072M7.719 11.93a1.053 1.053 0 1 1-2.105 0 1.053 1.053 0 0 1 2.105 0m3.86 1.053a1.053 1.053 0 1 0 0-2.106 1.053 1.053 0 0 0 0 2.105"
        clipRule="evenodd"
      />
      <path d="m14.736 0-.663 2.286-2.495.853 2.495.89.663 2.287.74-2.286 2.418-.891-2.417-.853z" />
    </g>
  </svg>
)
const ForwardRef = forwardRef(EmoteM)
export default ForwardRef
