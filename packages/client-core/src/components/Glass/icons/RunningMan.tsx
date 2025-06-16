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

import React, { forwardRef, SVGProps } from 'react'

const RunningMan = (props: SVGProps<SVGSVGElement>) => (
  <svg width="1em" height="1em" viewBox="0 0 22 23" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      d="M15.5323 7.89373V12.0585C16.1098 13.7913 16.9915 17.5001 15.2282 20.1449C14.9546 20.5705 14.3162 20.6312 13.9211 20.2665C13.6171 19.9929 13.5866 19.5369 13.7995 19.2025C14.9851 17.3785 14.4683 14.5817 13.7995 12.5145L11.9755 17.8345C11.7627 18.5033 10.9115 18.7465 10.3643 18.2905L7.50668 15.7977C7.14192 15.4937 7.11149 14.9769 7.41552 14.6121C7.7195 14.2473 8.26671 14.2169 8.60111 14.5209L10.5771 16.1929L11.5499 12.5449V8.07618C10.6683 8.04575 9.69548 8.01532 8.7835 7.98496C8.11469 7.95452 7.59791 7.37694 7.6587 6.67778L8.0539 2.02659C8.17549 1.69219 8.54032 1.47939 8.87472 1.47939C9.42187 1.47939 9.87786 2.02659 9.72591 2.57379L9.42187 5.0362C9.36108 5.46176 9.72591 5.85695 10.1515 5.85695H15.1674C15.4107 5.85695 15.6234 5.7658 15.7451 5.58334C16.4443 4.67136 16.9002 3.21217 17.1434 2.14816C17.3259 1.60099 17.6906 1.47939 18.0858 1.47939C18.5723 1.54019 18.9067 2.02659 18.8154 2.513C18.481 4.03299 17.5994 7.01218 15.5323 7.89373Z"
      fill="#F7F8FA"
    />
    <path
      d="M11.7931 4.06359C11.3067 3.33399 11.2155 2.51317 11.6107 1.81399C11.9451 1.1452 12.6443 0.75 13.3739 0.75C14.4683 0.75 15.3803 1.662 15.3803 2.75641C15.3803 3.48601 14.9547 4.27641 14.3467 4.6716C14.0427 4.88435 13.7083 4.97557 13.3739 4.97557C13.1307 4.97557 12.9179 4.91478 12.6747 4.82355C12.3099 4.6716 12.0059 4.42836 11.7931 4.06359Z"
      fill="#F7F8FA"
    />
    <path
      d="M20.1446 22.2885H19.1642V18.5092L17.9938 18.8722V18.0749L20.0395 17.3422H20.1446V22.2885Z"
      fill="#F7F8FA"
    />
    <path
      d="M6.22366 12.5614C5.78963 12.5614 5.39895 12.3407 5.09511 11.9875C4.92149 11.7669 4.79126 11.4578 4.79126 11.193C4.79126 11.193 4.79126 11.1488 4.79126 11.1047V6.95523L3.53249 8.01465C3.35886 8.19119 3.05502 8.14707 2.92481 7.97053C2.79459 7.79391 2.79459 7.48494 3.01161 7.35251L4.96491 5.7192C5.09511 5.58677 5.26874 5.58677 5.44237 5.67508C5.616 5.76332 5.70278 5.89574 5.70278 6.07236V9.8245C5.7462 9.8245 5.78963 9.78038 5.87641 9.78038C6.31044 9.64796 6.78797 9.73627 7.13516 10.0011C7.48241 10.266 7.69947 10.7074 7.69947 11.1488C7.65604 11.8993 7.00495 12.5614 6.22366 12.5614Z"
      fill="#F7F8FA"
    />
  </svg>
)

const ForwardRef = forwardRef(RunningMan)
export default ForwardRef
