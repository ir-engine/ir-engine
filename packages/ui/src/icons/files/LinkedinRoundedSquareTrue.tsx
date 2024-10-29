import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const LinkedinRoundedSquareTrue = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      fill="#1265BF"
      d="M0 16.1c0-5.695 0-8.542 1.126-10.71A10 10 0 0 1 5.39 1.126C7.558 0 10.405 0 16.1 0h15.8c5.695 0 8.542 0 10.71 1.126a10 10 0 0 1 4.264 4.264C48 7.558 48 10.405 48 16.1v15.8c0 5.695 0 8.542-1.126 10.71a10 10 0 0 1-4.264 4.264C40.442 48 37.595 48 31.9 48H16.1c-5.695 0-8.542 0-10.71-1.126a10 10 0 0 1-4.264-4.264C0 40.442 0 37.595 0 31.9z"
    />
    <g fill="#fff">
      <path d="M10.774 14.906a4.164 4.164 0 1 0 0-8.328 4.164 4.164 0 0 0 0 8.328M18.751 17.983h6.901v3.162s1.873-3.746 6.968-3.746c4.546 0 8.31 2.24 8.31 9.064v14.392h-7.15V28.208c0-4.026-2.15-4.469-3.788-4.469-3.4 0-3.981 2.933-3.981 4.995v12.122h-7.26zM7.144 17.983h7.26v22.873h-7.26z" />
    </g>
  </svg>
)
const ForwardRef = forwardRef(LinkedinRoundedSquareTrue)
export default ForwardRef
