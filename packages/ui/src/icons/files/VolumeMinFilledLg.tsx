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
const VolumeMinFilledLg = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
    <path
      fill="#080808"
      d="M4.5 9.6c0-.56 0-.84.109-1.054a1 1 0 0 1 .437-.437c.214-.11.494-.11 1.054-.11h1.737c.245 0 .367 0 .482-.027a1 1 0 0 0 .29-.12c.1-.061.187-.148.36-.32l3.165-3.166c.429-.429.643-.643.827-.657a.5.5 0 0 1 .42.173c.119.14.119.443.119 1.05v14.137c0 .605 0 .908-.12 1.049a.5.5 0 0 1-.42.173c-.183-.014-.397-.228-.826-.657L8.97 16.47c-.173-.173-.26-.26-.36-.322a1 1 0 0 0-.29-.12C8.204 16 8.082 16 7.837 16H6.1c-.56 0-.84 0-1.054-.11a1 1 0 0 1-.437-.436C4.5 15.24 4.5 14.96 4.5 14.4z"
    />
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M18.245 8a6.97 6.97 0 0 1 1.255 4 6.97 6.97 0 0 1-1.255 4m-6.11-11.634L8.968 7.53c-.173.173-.26.26-.36.322a1 1 0 0 1-.29.12C8.204 8 8.082 8 7.837 8H6.1c-.56 0-.84 0-1.054.109a1 1 0 0 0-.437.437C4.5 8.76 4.5 9.04 4.5 9.6v4.8c0 .56 0 .84.109 1.054a1 1 0 0 0 .437.437C5.26 16 5.54 16 6.1 16h1.737c.245 0 .367 0 .482.028a1 1 0 0 1 .29.12c.1.061.187.148.36.32l3.165 3.166c.429.429.643.643.827.657a.5.5 0 0 0 .42-.174c.119-.14.119-.443.119-1.048V4.93c0-.606 0-.908-.12-1.049a.5.5 0 0 0-.42-.173c-.183.014-.397.228-.826.657"
    />
  </svg>
)
const ForwardRef = forwardRef(VolumeMinFilledLg)
export default ForwardRef
