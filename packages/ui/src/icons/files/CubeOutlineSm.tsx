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
const CubeOutlineSm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="m6.5 13.834.982.545c.189.105.284.158.384.178q.134.028.268 0c.1-.02.195-.073.384-.178l.982-.545m-6-1.667-.951-.528c-.2-.111-.3-.167-.373-.246a.7.7 0 0 1-.142-.242C2 11.049 2 10.935 2 10.706V9.667m0-3.333v-1.04c0-.228 0-.342.034-.444a.7.7 0 0 1 .142-.242c.073-.08.173-.135.373-.246l.951-.528m3-1.667.982-.545c.189-.106.284-.158.384-.179a.7.7 0 0 1 .268 0c.1.021.195.073.384.178l.982.546m3 1.667.951.528c.2.111.3.167.373.246q.097.106.142.242c.034.102.034.216.034.445v1.039m0 3.333v1.04c0 .227 0 .342-.034.444a.7.7 0 0 1-.142.242c-.073.08-.173.135-.373.245l-.951.529m-6-5L8 8m0 0 1.5-.833M8 8v1.667m-6-5 1.5.833m9 0 1.5-.833M8 13v1.667"
    />
  </svg>
)
const ForwardRef = forwardRef(CubeOutlineSm)
export default ForwardRef
