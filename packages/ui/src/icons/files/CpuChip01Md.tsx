import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const CpuChip01Md = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
    <g clipPath="url(#prefix__a)">
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M7.5 1.667v1.667m5-1.667v1.667m-5 13.333v1.667m5-1.667v1.667M16.667 7.5h1.667m-1.667 4.167h1.667M1.667 7.5h1.667m-1.667 4.167h1.667m4 5h5.333c1.4 0 2.1 0 2.635-.273a2.5 2.5 0 0 0 1.093-1.092c.272-.535.272-1.235.272-2.635V7.334c0-1.4 0-2.1-.273-2.635a2.5 2.5 0 0 0-1.092-1.093c-.535-.272-1.235-.272-2.635-.272H7.334c-1.4 0-2.1 0-2.635.272A2.5 2.5 0 0 0 3.606 4.7c-.272.534-.272 1.235-.272 2.635v5.333c0 1.4 0 2.1.272 2.635A2.5 2.5 0 0 0 4.7 16.395c.534.272 1.235.272 2.635.272m1.5-4.167h2.333c.467 0 .7 0 .878-.09a.83.83 0 0 0 .364-.365c.091-.178.091-.411.091-.878V8.834c0-.467 0-.7-.09-.879a.83.83 0 0 0-.365-.364c-.178-.09-.411-.09-.878-.09H8.834c-.467 0-.7 0-.879.09a.83.83 0 0 0-.364.364c-.09.179-.09.412-.09.879v2.333c0 .467 0 .7.09.878.08.157.208.285.364.364.179.091.412.091.879.091"
      />
    </g>
    <defs>
      <clipPath id="prefix__a">
        <path fill="#fff" d="M0 0h20v20H0z" />
      </clipPath>
    </defs>
  </svg>
)
const ForwardRef = forwardRef(CpuChip01Md)
export default ForwardRef
