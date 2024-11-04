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
const GithubOriginalFalse = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 48 48"
    role="img"
    stroke="currentColor"
    ref={ref}
    {...props}
  >
    <path
      fill="#080808"
      fillRule="evenodd"
      d="M23.998 6C14.058 6 6 14.059 6 24c0 7.953 5.157 14.7 12.31 17.08.9.165 1.229-.39 1.229-.868 0-.426-.016-1.56-.025-3.06-5.007 1.087-6.063-2.414-6.063-2.414-.819-2.079-1.999-2.632-1.999-2.632-1.634-1.117.124-1.095.124-1.095 1.806.128 2.757 1.855 2.757 1.855 1.605 2.75 4.213 1.956 5.239 1.496.163-1.163.627-1.957 1.142-2.407-3.996-.454-8.199-1.998-8.199-8.896 0-1.965.702-3.571 1.853-4.83-.185-.455-.803-2.285.176-4.764 0 0 1.512-.484 4.95 1.846a17.2 17.2 0 0 1 4.507-.606c1.528.007 3.068.207 4.506.606 3.436-2.33 4.945-1.846 4.945-1.846.982 2.479.364 4.309.179 4.764 1.153 1.259 1.85 2.865 1.85 4.83 0 6.915-4.208 8.437-8.219 8.882.647.556 1.223 1.654 1.223 3.334 0 2.406-.022 4.347-.022 4.937 0 .482.323 1.042 1.237.866C36.847 38.693 42 31.951 42 24c0-9.941-8.06-18-18.002-18"
      clipRule="evenodd"
    />
  </svg>
)
const ForwardRef = forwardRef(GithubOriginalFalse)
export default ForwardRef
