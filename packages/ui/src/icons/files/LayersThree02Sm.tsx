import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const LayersThree02Sm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
    <g clipPath="url(#prefix__a)">
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M4.666 6.334 1.333 8l6.428 3.214a.7.7 0 0 0 .177.075.3.3 0 0 0 .123 0 .7.7 0 0 0 .177-.075L14.666 8l-3.333-1.666M4.666 9.667l-3.333 1.667 6.428 3.214c.088.043.131.065.177.074q.062.012.123 0c.046-.009.09-.03.177-.074l6.428-3.214-3.333-1.667m-10-5 6.428-3.214a.7.7 0 0 1 .177-.074.3.3 0 0 1 .123 0c.046.008.09.03.177.074l6.428 3.214-6.428 3.214c-.087.044-.131.066-.177.074a.3.3 0 0 1-.123 0 .7.7 0 0 1-.177-.074z"
      />
    </g>
    <defs>
      <clipPath id="prefix__a">
        <path fill="#fff" d="M0 0h16v16H0z" />
      </clipPath>
    </defs>
  </svg>
)
const ForwardRef = forwardRef(LayersThree02Sm)
export default ForwardRef
