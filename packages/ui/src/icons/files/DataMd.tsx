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
const DataMd = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
    <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} clipPath="url(#prefix__a)">
      <path d="M17.666 18.334c.233 0 .35 0 .44-.046a.4.4 0 0 0 .181-.182c.046-.089.046-.206.046-.439V9c0-.233 0-.35-.046-.439a.4.4 0 0 0-.182-.182c-.089-.045-.206-.045-.439-.045h-2c-.233 0-.35 0-.44.045a.4.4 0 0 0-.181.182c-.046.09-.046.206-.046.44v2c0 .233 0 .35-.045.439a.4.4 0 0 1-.182.182c-.09.045-.206.045-.44.045h-2c-.233 0-.35 0-.439.045a.4.4 0 0 0-.182.183c-.045.089-.045.205-.045.439v2c0 .233 0 .35-.045.439a.4.4 0 0 1-.183.182C11.35 15 11.234 15 11 15H9c-.233 0-.35 0-.439.046a.4.4 0 0 0-.182.182c-.045.089-.045.206-.045.439v2c0 .233 0 .35.045.44.04.078.104.141.182.181.09.046.206.046.44.046zM8.333 5.667c0-.233 0-.35.045-.44a.4.4 0 0 1 .182-.181C8.65 5 8.766 5 9 5h2c.233 0 .35 0 .438.046.079.04.143.103.183.182.045.089.045.206.045.439v2c0 .233 0 .35-.045.44a.4.4 0 0 1-.183.181c-.089.046-.205.046-.439.046H9c-.233 0-.35 0-.439-.046a.4.4 0 0 1-.182-.182c-.045-.089-.045-.206-.045-.439zM2.5 10.667c0-.233 0-.35.045-.44a.4.4 0 0 1 .182-.181C2.816 10 2.933 10 3.166 10h2c.233 0 .35 0 .44.046.078.04.141.103.181.182.046.089.046.206.046.439v2c0 .233 0 .35-.046.44a.4.4 0 0 1-.182.181c-.089.046-.206.046-.439.046h-2c-.233 0-.35 0-.44-.046a.4.4 0 0 1-.181-.182c-.046-.089-.046-.206-.046-.439zM1.666 2.334c0-.234 0-.35.045-.44a.4.4 0 0 1 .183-.182c.089-.045.205-.045.439-.045h2c.233 0 .35 0 .439.045.078.04.142.104.182.183.045.089.045.205.045.439v2c0 .233 0 .35-.045.439a.4.4 0 0 1-.182.182C4.682 5 4.566 5 4.332 5h-2c-.233 0-.35 0-.438-.045a.4.4 0 0 1-.183-.182c-.045-.09-.045-.206-.045-.44z" />
    </g>
    <defs>
      <clipPath id="prefix__a">
        <path fill="#fff" d="M0 0h20v20H0z" />
      </clipPath>
    </defs>
  </svg>
)
const ForwardRef = forwardRef(DataMd)
export default ForwardRef
