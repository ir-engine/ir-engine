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
const DiscordOriginalTrue = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 48 48"
    role="img"
    stroke="currentColor"
    ref={ref}
    {...props}
  >
    <path
      fill="#5865F2"
      d="M37.862 11.267A33 33 0 0 0 29.72 8.74a.12.12 0 0 0-.131.062 23 23 0 0 0-1.014 2.083 30.5 30.5 0 0 0-9.144 0 21 21 0 0 0-1.03-2.083.13.13 0 0 0-.13-.062 33 33 0 0 0-8.143 2.526.1.1 0 0 0-.053.046C4.889 19.06 3.468 26.617 4.165 34.08a.14.14 0 0 0 .052.093c3.422 2.513 6.736 4.038 9.989 5.05a.13.13 0 0 0 .14-.047 24 24 0 0 0 2.043-3.323.127.127 0 0 0-.07-.176 22 22 0 0 1-3.12-1.488.128.128 0 0 1-.012-.212c.21-.157.42-.32.62-.486a.12.12 0 0 1 .129-.017c6.546 2.988 13.633 2.988 20.102 0a.12.12 0 0 1 .131.015c.2.166.41.33.621.488a.128.128 0 0 1-.01.212 20.5 20.5 0 0 1-3.123 1.486.13.13 0 0 0-.067.178 26.6 26.6 0 0 0 2.042 3.322.13.13 0 0 0 .14.047c3.268-1.01 6.582-2.536 10.004-5.049a.13.13 0 0 0 .052-.092c.834-8.628-1.397-16.123-5.914-22.767a.1.1 0 0 0-.052-.047M17.367 29.536c-1.971 0-3.595-1.81-3.595-4.032s1.592-4.032 3.595-4.032c2.018 0 3.626 1.826 3.595 4.032 0 2.222-1.593 4.032-3.595 4.032m13.29 0c-1.97 0-3.594-1.81-3.594-4.032s1.593-4.032 3.595-4.032c2.018 0 3.626 1.826 3.595 4.032 0 2.222-1.577 4.032-3.595 4.032"
    />
  </svg>
)
const ForwardRef = forwardRef(DiscordOriginalTrue)
export default ForwardRef
