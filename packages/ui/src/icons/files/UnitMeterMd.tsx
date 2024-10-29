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
const UnitMeterMd = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 21 20"
    role="img"
    stroke="currentColor"
    ref={ref}
    {...props}
  >
    <path
      fill="#5F7DBF"
      d="M5.422 13.584v-7h1.246l.084 1.288v5.712zm4.844 0V10l1.33-.42v4.004zm4.844 0V10l1.316-.42v4.004zM10.266 10q0-.952-.224-1.442-.21-.504-.602-.7-.378-.195-.882-.21-.855 0-1.33.602t-.476 1.694h-.574q0-1.105.322-1.89.321-.798.924-1.218.615-.42 1.47-.42 1.26 0 1.974.784.728.77.728 2.38zm4.844 0q0-.952-.224-1.442-.224-.504-.602-.7t-.882-.21q-.855 0-1.33.602t-.476 1.694h-.574q0-1.105.322-1.89.321-.798.924-1.218.615-.42 1.47-.42 1.26 0 1.974.784.727.77.714 2.38z"
    />
  </svg>
)
const ForwardRef = forwardRef(UnitMeterMd)
export default ForwardRef
