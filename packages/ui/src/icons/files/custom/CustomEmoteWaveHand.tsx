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
    viewBox="0 0 21 23"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    fill="none"
    stroke="none"
    ref={ref}
    {...props}
  >
    <path
      d="M14.0444 15.0603C14.4617 14.804 14.8467 14.4996 15.1914 14.1549C16.3127 13.0336 17.0078 11.4911 17.0078 9.79143V3.99213C17.0078 3.69785 16.8861 3.42387 16.6882 3.22599C16.4903 3.03319 16.2214 2.91142 15.922 2.91142C15.6227 2.91142 15.3538 3.03319 15.1559 3.22599C14.9631 3.42387 14.8413 3.69785 14.8413 3.99213V7.57927C14.8413 7.68582 14.7551 7.77208 14.6485 7.77208C14.542 7.77208 14.4557 7.68582 14.4557 7.57927V2.33809C14.4557 2.03873 14.3339 1.76982 14.1361 1.57195C13.9432 1.37407 13.6693 1.2523 13.375 1.2523C13.0756 1.2523 12.8067 1.37407 12.6088 1.57195C12.411 1.76982 12.2892 2.03873 12.2892 2.33809V7.57927C12.2892 7.68582 12.2029 7.77208 12.0964 7.77208C11.9949 7.77208 11.9087 7.68582 11.9087 7.57927V1.83578C11.9087 1.53643 11.7869 1.26245 11.589 1.06965C11.3911 0.87177 11.1222 0.75 10.8229 0.75C10.5235 0.75 10.2546 0.87177 10.0567 1.06965C9.86391 1.26245 9.74214 1.53643 9.74214 1.83578V7.57927C9.74214 7.68582 9.65589 7.77208 9.54934 7.77208C9.44279 7.77208 9.35653 7.68582 9.35653 7.57927V2.33809C9.35653 2.03873 9.23476 1.76982 9.03688 1.57195C8.84408 1.37407 8.5701 1.2523 8.27581 1.2523C7.97646 1.2523 7.70755 1.37407 7.50967 1.57195C7.31179 1.76982 7.19002 2.03873 7.19002 2.33809V10.2531C7.19002 10.3597 7.10377 10.4459 7.00229 10.4459C6.90589 10.4459 6.82978 10.3749 6.80949 10.2887L6.13467 7.58942C6.06364 7.30022 5.87591 7.06682 5.64251 6.92476C5.40404 6.7827 5.10976 6.73196 4.82056 6.80299C4.53135 6.87402 4.29796 7.06175 4.15589 7.30022C4.01382 7.53868 3.95801 7.82789 4.03412 8.11709L4.86622 11.4353C5.21631 12.7038 5.96724 13.8149 6.97185 14.6166C7.35947 14.9278 7.78612 15.1931 8.24273 15.4043V16.7325H13.9813V15.2426C13.9813 15.162 14.0079 15.1064 14.0444 15.0603Z"
      fill="#F7F8FA"
    />
    <path
      d="M14.6196 17.494H7.61775C7.46553 17.494 7.38942 17.5701 7.38942 17.7223V22.2887H14.8479V17.7223C14.8479 17.6462 14.7718 17.494 14.6196 17.494ZM12.8691 20.6905C12.4125 20.6905 12.0319 20.3099 12.0319 19.8533C12.0319 19.3966 12.4125 19.0161 12.8691 19.0161C13.3258 19.0161 13.7063 19.3966 13.7063 19.8533C13.6302 20.3099 13.3258 20.6905 12.8691 20.6905Z"
      fill="#F7F8FA"
    />
  </svg>
)

const ForwardRef = forwardRef(Icon)
export default ForwardRef
