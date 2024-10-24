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
const Save01Sm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M4.667 2v2.267c0 .373 0 .56.072.702a.67.67 0 0 0 .292.292c.142.072.329.072.702.072h4.534c.373 0 .56 0 .702-.072a.67.67 0 0 0 .292-.292c.072-.142.072-.329.072-.702v-1.6m0 11.333V9.733c0-.373 0-.56-.072-.702a.67.67 0 0 0-.292-.292c-.142-.072-.329-.072-.702-.072H5.733c-.373 0-.56 0-.702.072a.67.67 0 0 0-.292.292c-.072.142-.072.329-.072.702V14M14 6.217V10.8c0 1.12 0 1.68-.218 2.108a2 2 0 0 1-.874.874C12.48 14 11.92 14 10.8 14H5.2c-1.12 0-1.68 0-2.108-.218a2 2 0 0 1-.874-.874C2 12.48 2 11.92 2 10.8V5.2c0-1.12 0-1.68.218-2.108a2 2 0 0 1 .874-.874C3.52 2 4.08 2 5.2 2h4.583c.326 0 .49 0 .643.037q.205.05.385.16c.135.082.25.197.48.428l2.084 2.084c.23.23.346.345.428.48q.11.181.16.385c.037.154.037.317.037.643"
    />
  </svg>
)
const ForwardRef = forwardRef(Save01Sm)
export default ForwardRef
