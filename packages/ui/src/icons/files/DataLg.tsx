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
const DataLg = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 24 24"
    role="img"
    stroke="currentColor"
    ref={ref}
    {...props}
  >
    <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}>
      <path d="M21.2 22c.28 0 .42 0 .527-.055a.5.5 0 0 0 .218-.218C22 21.62 22 21.48 22 21.2V10.8c0-.28 0-.42-.055-.527a.5.5 0 0 0-.218-.218C21.62 10 21.48 10 21.2 10h-2.4c-.28 0-.42 0-.527.055a.5.5 0 0 0-.218.218C18 10.38 18 10.52 18 10.8v2.4c0 .28 0 .42-.055.527a.5.5 0 0 1-.218.218C17.62 14 17.48 14 17.2 14h-2.4c-.28 0-.42 0-.527.055a.5.5 0 0 0-.218.218C14 14.38 14 14.52 14 14.8v2.4c0 .28 0 .42-.055.527a.5.5 0 0 1-.218.218C13.62 18 13.48 18 13.2 18h-2.4c-.28 0-.42 0-.527.055a.5.5 0 0 0-.218.218C10 18.38 10 18.52 10 18.8v2.4c0 .28 0 .42.055.527a.5.5 0 0 0 .218.218c.107.055.247.055.527.055zM10 6.8c0-.28 0-.42.055-.527a.5.5 0 0 1 .218-.218C10.38 6 10.52 6 10.8 6h2.4c.28 0 .42 0 .527.054a.5.5 0 0 1 .218.219C14 6.38 14 6.52 14 6.8v2.4c0 .28 0 .42-.055.527a.5.5 0 0 1-.218.218C13.62 10 13.48 10 13.2 10h-2.4c-.28 0-.42 0-.527-.055a.5.5 0 0 1-.218-.218C10 9.62 10 9.48 10 9.2zM3 12.8c0-.28 0-.42.054-.527a.5.5 0 0 1 .219-.218C3.38 12 3.52 12 3.8 12h2.4c.28 0 .42 0 .527.055a.5.5 0 0 1 .218.218C7 12.38 7 12.52 7 12.8v2.4c0 .28 0 .42-.054.527a.5.5 0 0 1-.219.218C6.62 16 6.48 16 6.2 16H3.8c-.28 0-.42 0-.527-.055a.5.5 0 0 1-.219-.218C3 15.62 3 15.48 3 15.2zM2 2.8c0-.28 0-.42.054-.527a.5.5 0 0 1 .219-.219C2.38 2 2.52 2 2.8 2h2.4c.28 0 .42 0 .527.054a.5.5 0 0 1 .218.219C6 2.38 6 2.52 6 2.8v2.4c0 .28 0 .42-.054.527a.5.5 0 0 1-.219.218C5.62 6 5.48 6 5.2 6H2.8c-.28 0-.42 0-.527-.054a.5.5 0 0 1-.219-.219C2 5.62 2 5.48 2 5.2z" />
    </g>
  </svg>
)
const ForwardRef = forwardRef(DataLg)
export default ForwardRef
