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
const Pin02Sm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="m5.584 10.411-3.77 3.771m5.982-9.754-1.04 1.04a1.4 1.4 0 0 1-.176.162.7.7 0 0 1-.138.073c-.055.022-.114.034-.231.057l-2.443.489c-.635.127-.953.19-1.101.358a.67.67 0 0 0-.162.534c.03.221.26.45.718.908l4.723 4.724c.458.458.687.687.909.717a.67.67 0 0 0 .534-.161c.167-.149.23-.466.358-1.101l.488-2.443c.024-.118.036-.177.057-.232a.7.7 0 0 1 .074-.138c.034-.048.076-.09.16-.175l1.042-1.04c.054-.055.08-.082.11-.106a1 1 0 0 1 .085-.057c.033-.019.068-.034.139-.064l1.663-.713c.485-.208.727-.312.837-.48a.67.67 0 0 0 .096-.498c-.04-.197-.226-.383-.6-.756l-3.428-3.43c-.373-.372-.56-.559-.757-.599a.67.67 0 0 0-.498.096c-.168.11-.272.353-.48.838l-.713 1.663c-.03.07-.045.106-.064.139a1 1 0 0 1-.057.084c-.023.03-.05.057-.105.111"
    />
  </svg>
)
const ForwardRef = forwardRef(Pin02Sm)
export default ForwardRef
