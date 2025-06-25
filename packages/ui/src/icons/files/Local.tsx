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
const Local = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="1em" height="1em" fill="none" ref={ref} {...props}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M7.49744 0.241888C7.79862 -0.0806294 8.28692 -0.0806294 8.58809 0.241888L10.7915 2.60148C11.0927 2.924 11.0927 3.4469 10.7915 3.76942C10.4904 4.09194 10.0021 4.09194 9.70089 3.76942L8.81397 2.81966L8.81397 8.38454C8.81397 8.54247 9.00177 8.70681 9.08939 8.76098L14.0018 11.7981L13.6772 10.5007C13.5669 10.0602 13.8111 9.60732 14.2225 9.48927C14.6339 9.37122 15.0568 9.63267 15.167 10.0732L15.9735 13.2965C16.0838 13.7371 15.8396 14.1899 15.4282 14.308L12.4182 15.1716C12.0068 15.2897 11.584 15.0282 11.4737 14.5877C11.3635 14.1471 11.6076 13.6943 12.019 13.5762L13.2306 13.2286L8.31818 10.1914C8.16616 10.0974 7.83063 10.0994 7.68182 10.1914L2.76941 13.2286L3.98096 13.5762C4.39237 13.6943 4.63653 14.1471 4.52629 14.5877C4.41605 15.0283 3.99317 15.2897 3.58176 15.1717L0.571795 14.308C0.160382 14.1899 -0.083768 13.7371 0.0264696 13.2965L0.832987 10.0733C0.943224 9.63269 1.3661 9.37123 1.77752 9.48928C2.18893 9.60733 2.43308 10.0602 2.32284 10.5007L1.99821 11.7982L6.91061 8.76099C7.02466 8.69047 7.27156 8.56827 7.27156 8.37656L7.27156 2.81966L6.38465 3.76942C6.08347 4.09194 5.59517 4.09194 5.294 3.76942C4.99282 3.4469 4.99282 2.924 5.294 2.60148L7.49744 0.241888Z"
      fill="currentColor"
    />
  </svg>
)
const ForwardRef = forwardRef(Local)
export default ForwardRef
