import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const LinkedinRoundedSquareFalse = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      fill="#080808"
      fillRule="evenodd"
      d="M1.126 5.39C0 7.558 0 10.405 0 16.1v15.8c0 5.695 0 8.542 1.126 10.71a10 10 0 0 0 4.264 4.264C7.558 48 10.405 48 16.1 48h15.8c5.695 0 8.542 0 10.71-1.126a10 10 0 0 0 4.264-4.264C48 40.442 48 37.595 48 31.9V16.1c0-5.695 0-8.542-1.126-10.71a10 10 0 0 0-4.264-4.264C40.442 0 37.595 0 31.9 0H16.1C10.405 0 7.558 0 5.39 1.126A10 10 0 0 0 1.126 5.39m9.648 9.517a4.164 4.164 0 1 0 0-8.328 4.164 4.164 0 0 0 0 8.328m7.977 3.077h6.901v3.161S27.525 17.4 32.62 17.4c4.546 0 8.311 2.239 8.311 9.064v14.392H33.78V28.208c0-4.026-2.15-4.469-3.788-4.469-3.399 0-3.981 2.932-3.981 4.994v12.123h-7.26zm-4.347 0h-7.26v22.872h7.26z"
      clipRule="evenodd"
    />
  </svg>
)
const ForwardRef = forwardRef(LinkedinRoundedSquareFalse)
export default ForwardRef
