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
const Image05Md = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      strokeWidth={2}
      d="M15.834 17.5h.842c.81 0 1.214 0 1.437-.169a.83.83 0 0 0 .33-.615c.016-.279-.208-.616-.657-1.289l-2.509-3.763c-.37-.556-.556-.835-.79-.931a.83.83 0 0 0-.639 0c-.233.096-.419.375-.79.931l-.62.93m3.396 4.906L9.431 8.25c-.369-.532-.553-.798-.783-.891a.83.83 0 0 0-.628 0c-.23.093-.414.36-.782.891l-4.955 7.158c-.47.677-.704 1.016-.69 1.298a.83.83 0 0 0 .325.623c.225.171.637.171 1.461.171zM17.501 5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0"
    />
  </svg>
)
const ForwardRef = forwardRef(Image05Md)
export default ForwardRef
