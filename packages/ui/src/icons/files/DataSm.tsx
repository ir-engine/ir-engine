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
const DataSm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
    <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} clipPath="url(#prefix__a)">
      <path d="M14.134 14.666c.187 0 .28 0 .351-.036a.33.33 0 0 0 .146-.146c.036-.071.036-.164.036-.351V7.2c0-.187 0-.28-.036-.352a.33.33 0 0 0-.146-.145c-.071-.037-.164-.037-.351-.037h-1.6c-.187 0-.28 0-.351.037a.33.33 0 0 0-.146.145c-.036.072-.036.165-.036.352v1.6c0 .186 0 .28-.037.351a.33.33 0 0 1-.145.146c-.072.036-.165.036-.352.036h-1.6c-.186 0-.28 0-.351.036a.33.33 0 0 0-.146.146c-.036.071-.036.165-.036.351v1.6c0 .187 0 .28-.036.352a.33.33 0 0 1-.146.145C9.081 12 8.987 12 8.801 12H7.2c-.187 0-.28 0-.352.036a.33.33 0 0 0-.145.146c-.037.071-.037.164-.037.351v1.6c0 .187 0 .28.037.351a.33.33 0 0 0 .145.146c.072.036.165.036.352.036zM6.667 4.533c0-.187 0-.28.037-.351a.33.33 0 0 1 .145-.146C6.921 4 7.014 4 7.201 4h1.6c.186 0 .28 0 .351.036a.33.33 0 0 1 .146.146c.036.071.036.164.036.351v1.6c0 .187 0 .28-.036.351a.33.33 0 0 1-.146.146c-.071.036-.165.036-.351.036H7.2c-.187 0-.28 0-.352-.036a.33.33 0 0 1-.145-.146c-.037-.071-.037-.164-.037-.351zM2 8.533c0-.187 0-.28.037-.351a.33.33 0 0 1 .146-.146C2.254 8 2.347 8 2.534 8h1.6c.187 0 .28 0 .351.036a.33.33 0 0 1 .146.146c.036.071.036.164.036.351v1.6c0 .187 0 .28-.036.351a.33.33 0 0 1-.146.146c-.071.036-.164.036-.351.036h-1.6c-.187 0-.28 0-.351-.036a.33.33 0 0 1-.146-.146c-.036-.071-.036-.164-.036-.351zM1.334 1.866c0-.186 0-.28.036-.351a.33.33 0 0 1 .146-.146c.071-.036.165-.036.351-.036h1.6c.187 0 .28 0 .352.036a.33.33 0 0 1 .145.146c.037.071.037.165.037.351v1.6c0 .187 0 .28-.037.352a.33.33 0 0 1-.145.145C3.747 4 3.654 4 3.467 4h-1.6c-.186 0-.28 0-.351-.037a.33.33 0 0 1-.146-.145c-.036-.072-.036-.165-.036-.352z" />
    </g>
    <defs>
      <clipPath id="prefix__a">
        <path fill="#fff" d="M0 0h16v16H0z" />
      </clipPath>
    </defs>
  </svg>
)
const ForwardRef = forwardRef(DataSm)
export default ForwardRef
