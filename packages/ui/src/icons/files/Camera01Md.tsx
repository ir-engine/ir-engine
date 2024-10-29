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
const Camera01Md = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
    <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}>
      <path d="M1.666 6.981c0-.292 0-.438.012-.56A2.5 2.5 0 0 1 3.92 4.179c.122-.012.276-.012.584-.012.119 0 .178 0 .228-.003a1.67 1.67 0 0 0 1.446-1.042c.019-.047.036-.1.071-.205.036-.105.053-.158.072-.205A1.67 1.67 0 0 1 7.767 1.67c.05-.003.105-.003.217-.003h4.031c.111 0 .167 0 .217.003a1.67 1.67 0 0 1 1.446 1.042c.019.047.036.1.071.205s.053.158.072.205c.24.597.803 1.003 1.446 1.042.05.003.11.003.228.003.307 0 .461 0 .584.012A2.5 2.5 0 0 1 18.32 6.42c.013.123.013.27.013.561v6.52c0 1.4 0 2.1-.273 2.634a2.5 2.5 0 0 1-1.092 1.093c-.535.272-1.235.272-2.635.272H5.666c-1.4 0-2.1 0-2.635-.272a2.5 2.5 0 0 1-1.093-1.093c-.272-.535-.272-1.235-.272-2.635z" />
      <path d="M10 13.75a3.333 3.333 0 1 0 0-6.666 3.333 3.333 0 0 0 0 6.666" />
    </g>
  </svg>
)
const ForwardRef = forwardRef(Camera01Md)
export default ForwardRef
