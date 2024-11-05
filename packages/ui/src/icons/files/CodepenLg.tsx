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
const CodepenLg = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="m12 9-7.936 5.158c-.688.447-1.032.67-1.151.954a1 1 0 0 0 0 .775M12 9l7.936 5.158c.688.447 1.032.67 1.151.954a1 1 0 0 1 0 .775M12 9V2.5M12 15 4.064 9.84c-.688-.447-1.032-.67-1.151-.954a1 1 0 0 1 0-.775M12 15l7.936-5.159c.688-.447 1.032-.67 1.151-.954a1 1 0 0 0 0-.775M12 15v6.5m9.272-5.527-8.4 5.46c-.316.205-.473.308-.643.348-.15.035-.307.035-.457 0-.17-.04-.328-.143-.644-.348l-8.4-5.46c-.266-.173-.399-.26-.495-.375a1 1 0 0 1-.189-.347C2 15.107 2 14.949 2 14.63V9.368c0-.317 0-.476.044-.62a1 1 0 0 1 .189-.347c.096-.115.229-.202.495-.375l8.4-5.46c.316-.205.473-.307.643-.347a1 1 0 0 1 .457 0c.17.04.328.142.644.347l8.4 5.46c.266.173.399.26.495.375a1 1 0 0 1 .189.347c.044.144.044.303.044.62v5.263c0 .318 0 .476-.044.62a1 1 0 0 1-.189.347c-.096.116-.229.202-.495.375"
    />
  </svg>
)
const ForwardRef = forwardRef(CodepenLg)
export default ForwardRef
