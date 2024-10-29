import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const LayersThree01Sm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
        d="m1.333 8 6.428 3.214a.7.7 0 0 0 .177.075.3.3 0 0 0 .123 0 .7.7 0 0 0 .177-.075L14.666 8M1.333 11.334l6.428 3.214c.088.043.131.065.177.074q.062.012.123 0c.046-.009.09-.03.177-.074l6.428-3.214M1.333 4.667l6.428-3.214a.7.7 0 0 1 .177-.074.3.3 0 0 1 .123 0c.046.008.09.03.177.074l6.428 3.214-6.428 3.214c-.087.044-.131.066-.177.074a.3.3 0 0 1-.123 0 .7.7 0 0 1-.177-.074z"
      />
    </g>
    <defs>
      <clipPath id="prefix__a">
        <path fill="#fff" d="M0 0h16v16H0z" />
      </clipPath>
    </defs>
  </svg>
)
const ForwardRef = forwardRef(LayersThree01Sm)
export default ForwardRef
