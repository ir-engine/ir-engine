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
const Scale02Sm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M10.6667 14H10.8C11.9201 14 12.4802 14 12.908 13.782C13.2843 13.5903 13.5903 13.2843 13.782 12.908C14 12.4802 14 11.9201 14 10.8V5.2C14 4.0799 14 3.51984 13.782 3.09202C13.5903 2.71569 13.2843 2.40973 12.908 2.21799C12.4802 2 11.9201 2 10.8 2H5.2C4.0799 2 3.51984 2 3.09202 2.21799C2.71569 2.40973 2.40973 2.71569 2.21799 3.09202C2 3.51984 2 4.0799 2 5.2V5.33333M7.66667 8.33333L11.3333 4.66667M11.3333 4.66667H8M11.3333 4.66667V8M4.13333 14H5.86667C6.6134 14 6.98677 14 7.27199 13.8547C7.52287 13.7268 7.72684 13.5229 7.85468 13.272C8 12.9868 8 12.6134 8 11.8667V10.1333C8 9.3866 8 9.01323 7.85468 8.72801C7.72684 8.47713 7.52287 8.27316 7.27199 8.14532C6.98677 8 6.6134 8 5.86667 8H4.13333C3.3866 8 3.01323 8 2.72801 8.14532C2.47713 8.27316 2.27316 8.47713 2.14532 8.72801C2 9.01323 2 9.3866 2 10.1333V11.8667C2 12.6134 2 12.9868 2.14532 13.272C2.27316 13.5229 2.47713 13.7268 2.72801 13.8547C3.01323 14 3.3866 14 4.13333 14Z"
    />
  </svg>
)
const ForwardRef = forwardRef(Scale02Sm)
export default ForwardRef
