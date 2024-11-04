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
const GithubSquareFalse = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 48 49"
    role="img"
    stroke="currentColor"
    ref={ref}
    {...props}
  >
    <g fillRule="evenodd" clipRule="evenodd">
      <path
        fill="#080808"
        d="M48 0H0v48h17.993c.003-.384.038-4.403.026-6.465-6.676 1.45-8.084-3.218-8.084-3.218-1.092-2.771-2.666-3.51-2.666-3.51-2.179-1.489.165-1.46.165-1.46 2.41.172 3.677 2.474 3.677 2.474 2.14 3.668 5.617 2.608 6.985 1.995.218-1.551.836-2.61 1.523-3.209-5.33-.605-10.932-2.665-10.932-11.862 0-2.62.935-4.761 2.47-6.44-.247-.607-1.07-3.046.235-6.351 0 0 2.015-.645 6.6 2.46 1.914-.531 3.968-.798 6.009-.807 2.037.009 4.091.276 6.008.807 4.582-3.105 6.593-2.46 6.593-2.46 1.31 3.305.486 5.744.239 6.351 1.538 1.679 2.468 3.82 2.468 6.44 0 9.22-5.612 11.25-10.959 11.843.862.741 1.63 2.206 1.63 4.445 0 2.877.027 8.51.029 8.967H48z"
      />
      <path
        fill="#F5F5F5"
        d="M17.993 48.03s.039-4.328.026-6.495c-6.676 1.45-8.084-3.218-8.084-3.218-1.092-2.771-2.665-3.51-2.665-3.51-2.18-1.489.165-1.46.165-1.46 2.408.172 3.676 2.474 3.676 2.474 2.14 3.668 5.617 2.608 6.985 1.995.218-1.551.837-2.609 1.523-3.209-5.329-.605-10.932-2.665-10.932-11.861 0-2.62.935-4.762 2.47-6.44-.247-.607-1.07-3.047.235-6.352 0 0 2.016-.645 6.6 2.46 1.914-.531 3.968-.798 6.009-.807 2.037.009 4.091.276 6.008.808 4.582-3.106 6.593-2.46 6.593-2.46 1.31 3.304.487 5.744.239 6.35 1.538 1.679 2.468 3.821 2.468 6.44 0 9.22-5.612 11.25-10.959 11.843.862.741 1.63 2.206 1.63 4.445 0 3 .03 8.997.03 8.997z"
      />
    </g>
  </svg>
)
const ForwardRef = forwardRef(GithubSquareFalse)
export default ForwardRef
