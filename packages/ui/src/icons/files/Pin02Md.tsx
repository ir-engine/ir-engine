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
const Pin02Md = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="m6.98 13.014-4.713 4.714M9.745 5.535l-1.3 1.3c-.107.107-.16.16-.22.202a1 1 0 0 1-.172.092c-.069.027-.143.042-.29.071l-3.053.611c-.794.159-1.19.238-1.376.447a.83.83 0 0 0-.203.668c.039.277.325.563.897 1.135l5.905 5.905c.572.572.858.859 1.135.897a.83.83 0 0 0 .668-.202c.21-.186.288-.583.447-1.376l.611-3.054c.03-.147.044-.22.071-.29a1 1 0 0 1 .092-.171c.042-.061.095-.114.202-.22l1.3-1.3c.068-.069.102-.103.14-.132a1 1 0 0 1 .104-.071c.042-.024.086-.043.174-.08l2.079-.891c.606-.26.91-.39 1.047-.6a.83.83 0 0 0 .12-.623c-.05-.246-.283-.48-.75-.946l-4.286-4.286c-.466-.466-.7-.7-.946-.75a.83.83 0 0 0-.622.12c-.21.138-.34.441-.6 1.048l-.891 2.078a2 2 0 0 1-.08.174 1 1 0 0 1-.071.105c-.03.037-.064.071-.132.14"
    />
  </svg>
)
const ForwardRef = forwardRef(Pin02Md)
export default ForwardRef
