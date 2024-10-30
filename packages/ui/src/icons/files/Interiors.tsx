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
const Interiors = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M12.667 3c0 .31 0 .464-.026.593a1.33 1.33 0 0 1-1.047 1.048c-.13.025-.284.025-.594.025H3.667c-.31 0-.465 0-.594-.025a1.33 1.33 0 0 1-1.047-1.048C2 3.464 2 3.31 2 3c0-.31 0-.465.026-.594A1.33 1.33 0 0 1 3.073 1.36c.129-.026.284-.026.594-.026H11c.31 0 .465 0 .594.026.528.105.942.518 1.047 1.047.026.129.026.284.026.594m0 0c.62 0 .931 0 1.177.101.326.135.586.395.721.722.102.245.102.555.102 1.177v.2c0 .746 0 1.12-.146 1.405-.128.25-.332.455-.582.583-.286.145-.659.145-1.406.145h-2.4c-.746 0-1.12 0-1.405.145-.25.128-.455.332-.583.583C8 8.346 8 8.72 8 9.466V10m-.267 4.666h.534c.373 0 .56 0 .702-.072a.67.67 0 0 0 .292-.292c.072-.142.072-.329.072-.702v-2.534c0-.373 0-.56-.072-.702a.67.67 0 0 0-.292-.292C8.827 10 8.64 10 8.267 10h-.534c-.373 0-.56 0-.702.072a.67.67 0 0 0-.292.292c-.072.142-.072.329-.072.702V13.6c0 .373 0 .56.072.702a.67.67 0 0 0 .292.292c.142.072.329.072.702.072"
    />
  </svg>
)
const ForwardRef = forwardRef(Interiors)
export default ForwardRef
