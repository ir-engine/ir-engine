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
const Hexagon01Sm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M7.482 1.622c.189-.106.284-.158.384-.179a.7.7 0 0 1 .268 0c.1.021.195.073.384.178l4.933 2.741c.2.111.3.167.373.246q.097.106.142.242c.034.102.034.216.034.445v5.411c0 .229 0 .343-.034.445a.7.7 0 0 1-.142.242c-.073.08-.173.135-.373.245L8.518 14.38c-.189.105-.284.158-.384.178a.7.7 0 0 1-.268 0c-.1-.02-.195-.073-.384-.178l-4.933-2.74c-.2-.111-.3-.167-.373-.246a.7.7 0 0 1-.142-.242C2 11.049 2 10.935 2 10.706V5.295c0-.229 0-.343.034-.445a.7.7 0 0 1 .142-.242c.073-.08.173-.135.373-.246z"
    />
  </svg>
)
const ForwardRef = forwardRef(Hexagon01Sm)
export default ForwardRef
