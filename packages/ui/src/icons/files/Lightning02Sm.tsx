import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Lightning02Sm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 16 17"
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
        d="M9.5 1.472H5.663c-.12 0-.18 0-.233.018a.3.3 0 0 0-.124.077c-.04.039-.067.092-.12.2l-2.8 5.6c-.128.255-.192.383-.177.487.014.09.064.172.139.224.086.06.229.06.515.06H7l-2 6.667 8.128-8.43c.275-.284.412-.426.42-.548a.33.33 0 0 0-.118-.277c-.093-.078-.29-.078-.685-.078H8z"
      />
    </g>
    <defs>
      <clipPath id="prefix__a">
        <path fill="#fff" d="M0 .139h16v16H0z" />
      </clipPath>
    </defs>
  </svg>
)
const ForwardRef = forwardRef(Lightning02Sm)
export default ForwardRef
