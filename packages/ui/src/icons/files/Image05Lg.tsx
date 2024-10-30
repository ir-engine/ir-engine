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
const Image05Lg = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19.001 21h1.01c.972 0 1.457 0 1.725-.203a1 1 0 0 0 .395-.737c.02-.335-.25-.74-.788-1.547l-3.01-4.516c-.446-.668-.668-1.002-.949-1.118a1 1 0 0 0-.766 0c-.28.116-.503.45-.948 1.118l-.744 1.116M19 21 11.317 9.9c-.442-.638-.663-.957-.94-1.07a1 1 0 0 0-.752 0c-.276.113-.497.432-.94 1.07L2.74 18.49c-.563.813-.844 1.22-.828 1.557a1 1 0 0 0 .391.747c.27.206.764.206 1.753.206zm2-15a3 3 0 1 1-6 0 3 3 0 0 1 6 0"
    />
  </svg>
)
const ForwardRef = forwardRef(Image05Lg)
export default ForwardRef
