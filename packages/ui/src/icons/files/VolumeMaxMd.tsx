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
const VolumeMaxMd = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M16.456 4.166A9.96 9.96 0 0 1 18.333 10a9.95 9.95 0 0 1-1.877 5.833M13.12 6.666A5.8 5.8 0 0 1 14.166 10c0 1.239-.386 2.388-1.046 3.333M8.028 3.638 5.39 6.276c-.144.144-.216.216-.3.267a.8.8 0 0 1-.241.1c-.096.023-.198.023-.402.023H3c-.466 0-.7 0-.878.091a.83.83 0 0 0-.364.364c-.091.179-.091.412-.091.879v4c0 .466 0 .7.09.878.08.157.208.284.365.364.178.09.412.09.878.09h1.448c.204 0 .306 0 .402.024q.128.03.24.1c.085.051.157.123.3.268l2.639 2.637c.357.357.535.536.689.548a.42.42 0 0 0 .35-.145c.099-.117.099-.369.099-.874V4.11c0-.506 0-.758-.1-.875a.42.42 0 0 0-.35-.145c-.153.012-.331.19-.688.548"
    />
  </svg>
)
const ForwardRef = forwardRef(VolumeMaxMd)
export default ForwardRef
