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
const Cursor03Sm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 16 16"
    role="img"
    stroke="currentColor"
    ref={ref}
    {...props}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M3.14036 2.44964C2.77999 2.30767 2.5998 2.23669 2.48499 2.27488C2.38529 2.30805 2.30707 2.38627 2.27391 2.48596C2.23571 2.60077 2.3067 2.78096 2.44866 3.14134L5.98242 12.1116C6.09676 12.4019 6.15393 12.547 6.24711 12.6053C6.32833 12.656 6.42748 12.6694 6.51926 12.642C6.62453 12.6105 6.71812 12.4857 6.9053 12.2362L8.33239 10.3334L10.632 13.4953C10.7584 13.6691 10.8216 13.756 10.9021 13.7923C10.9728 13.8242 11.0524 13.8305 11.1272 13.81C11.2124 13.7867 11.2884 13.7107 11.4404 13.5587L13.5577 11.4414C13.7097 11.2894 13.7857 11.2134 13.809 11.1282C13.8295 11.0534 13.8233 10.9738 13.7914 10.9031C13.755 10.8226 13.6681 10.7594 13.4943 10.6329L10.3324 8.33337L12.2352 6.90628C12.4848 6.7191 12.6095 6.62551 12.641 6.52023C12.6684 6.42845 12.6551 6.32931 12.6043 6.24808C12.546 6.15491 12.4009 6.09774 12.1107 5.9834L3.14036 2.44964Z"
    />
  </svg>
)
const ForwardRef = forwardRef(Cursor03Sm)
export default ForwardRef
