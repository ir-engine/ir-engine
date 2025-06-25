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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import React, { forwardRef, Ref, SVGProps } from 'react'

const Icon = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 23 23"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    fill="none"
    stroke="none"
    ref={ref}
    {...props}
  >
    <path
      d="M15.1039 7.89372V12.0585C15.6815 13.7913 16.5631 17.5001 14.7999 20.1449C14.5263 20.5704 13.8879 20.6312 13.4927 20.2664C13.1887 19.9928 13.1583 19.5368 13.3711 19.2024C14.5567 17.3785 14.0399 14.5817 13.3711 12.5145L11.5472 17.8345C11.3343 18.5033 10.4832 18.7465 9.93594 18.2905L7.07834 15.7977C6.71358 15.4937 6.68315 14.9769 6.98719 14.6121C7.29116 14.2473 7.83837 14.2169 8.17277 14.5209L10.1488 16.1929L11.1215 12.5449V8.07617C10.2399 8.04574 9.26713 8.01537 8.35515 7.98494C7.68635 7.95451 7.16957 7.37693 7.23036 6.67776L7.62556 2.02659C7.74714 1.69219 8.11198 1.47939 8.44638 1.47939C8.99353 1.47939 9.44952 2.02659 9.29757 2.57379L8.99353 5.03619C8.93273 5.46175 9.29756 5.85694 9.72312 5.85694H14.7391C14.9823 5.85694 15.1951 5.76579 15.3167 5.58333C16.0159 4.67136 16.4719 3.21216 16.7151 2.14816C16.8975 1.60099 17.2623 1.47939 17.6575 1.47939C18.1439 1.54019 18.4783 2.02659 18.3871 2.51299C18.0527 4.03298 17.171 7.01217 15.1039 7.89372Z"
      fill="#F7F8FA"
    />
    <path
      d="M11.3648 4.06359C10.8783 3.33399 10.7872 2.51316 11.1824 1.81399C11.5168 1.1452 12.2159 0.75 12.9455 0.75C14.04 0.75 14.952 1.66199 14.952 2.75641C14.952 3.48601 14.5263 4.2764 13.9183 4.6716C13.6143 4.88434 13.2799 4.97557 12.9455 4.97557C12.7024 4.97557 12.4896 4.91477 12.2464 4.82354C11.8815 4.67159 11.5776 4.42835 11.3648 4.06359Z"
      fill="#F7F8FA"
    />
    <path
      d="M20.2339 20.4293H20.7937V21.2198H20.2339V22.2885H19.2535V21.2198H17.2281L17.1841 20.6024L19.2433 17.3489H20.2339V20.4293ZM18.1611 20.4293H19.2535V18.6856L19.189 18.7976L18.1611 20.4293Z"
      fill="#F7F8FA"
    />
    <path
      d="M5.79397 11.8666C5.35993 11.8666 4.96925 11.6459 4.66542 11.2927C4.4918 11.072 4.36157 10.763 4.36157 10.4982C4.36157 10.4982 4.36157 10.454 4.36157 10.4098V6.26043L3.1028 7.31984C2.92917 7.49639 2.62534 7.45227 2.49512 7.27572C2.3649 7.09911 2.3649 6.79013 2.58193 6.65771L4.53522 5.0244C4.66542 4.89197 4.83905 4.89197 5.01268 4.98028C5.18631 5.06852 5.27308 5.20094 5.27308 5.37756V9.1297C5.31651 9.1297 5.35993 9.08558 5.44671 9.08558C5.88075 8.95315 6.35827 9.04146 6.70546 9.30631C7.05272 9.57117 7.26977 10.0126 7.26977 10.454C7.22634 11.2045 6.57526 11.8666 5.79397 11.8666Z"
      fill="#F7F8FA"
    />
  </svg>
)

const ForwardRef = forwardRef(Icon)
export default ForwardRef
