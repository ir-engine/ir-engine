import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const BezierCurve01Md = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
        d="M9.333 5.834H3.499m15 0h-5.833m0 .21c2.875.74 5 3.35 5 6.456m-13.333 0a6.67 6.67 0 0 1 5-6.456m-5.334 9.79h.667c.467 0 .7 0 .878-.091a.83.83 0 0 0 .365-.364c.09-.179.09-.412.09-.879v-.666c0-.467 0-.7-.09-.879a.83.83 0 0 0-.365-.364c-.178-.09-.411-.09-.878-.09h-.667c-.466 0-.7 0-.878.09a.83.83 0 0 0-.364.364c-.091.179-.091.412-.091.879v.666c0 .467 0 .7.09.879.08.157.208.284.365.364.178.09.412.09.878.09M10.666 7.5h.667c.466 0 .7 0 .878-.09a.83.83 0 0 0 .364-.365c.091-.178.091-.411.091-.878V5.5c0-.466 0-.7-.09-.878a.83.83 0 0 0-.365-.364c-.178-.091-.412-.091-.878-.091h-.667c-.467 0-.7 0-.878.09a.83.83 0 0 0-.364.365c-.091.178-.091.412-.091.878v.667c0 .467 0 .7.09.878.08.157.208.285.365.365.178.09.411.09.878.09m6.667 8.334h.666c.467 0 .7 0 .879-.091a.83.83 0 0 0 .364-.364c.09-.179.09-.412.09-.879v-.666c0-.467 0-.7-.09-.879a.83.83 0 0 0-.364-.364c-.179-.09-.412-.09-.879-.09h-.666c-.467 0-.7 0-.879.09a.83.83 0 0 0-.364.364c-.09.179-.09.412-.09.879v.666c0 .467 0 .7.09.879.08.157.208.284.364.364.179.09.412.09.879.09m2-10a.833.833 0 1 1-1.667 0 .833.833 0 0 1 1.667 0m-15 0a.833.833 0 1 1-1.667 0 .833.833 0 0 1 1.667 0"
      />
    </g>
    <defs>
      <clipPath id="prefix__a">
        <path fill="#fff" d="M0 0h20v20H0z" />
      </clipPath>
    </defs>
  </svg>
)
const ForwardRef = forwardRef(BezierCurve01Md)
export default ForwardRef
