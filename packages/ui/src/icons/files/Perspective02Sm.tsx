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
const Perspective02Sm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M10.667 3.334v9.333m-4-10v10.667M2 8h12M2 3.993v8.015c0 .909 0 1.364.188 1.679.164.276.423.484.728.584.349.115.792.016 1.68-.18l7.733-1.72c.596-.132.895-.198 1.117-.358.196-.142.35-.334.446-.556.108-.252.108-.557.108-1.168V5.712c0-.61 0-.916-.108-1.168a1.33 1.33 0 0 0-.446-.556c-.222-.16-.52-.226-1.117-.359L4.597 1.911c-.888-.198-1.331-.296-1.68-.182-.305.101-.564.309-.728.585C2 2.629 2 3.084 2 3.994"
    />
  </svg>
)
const ForwardRef = forwardRef(Perspective02Sm)
export default ForwardRef
