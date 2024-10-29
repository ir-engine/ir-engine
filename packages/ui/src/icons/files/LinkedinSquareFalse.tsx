import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const LinkedinSquareFalse = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M48 0H0v48h48zM10.774 14.907a4.164 4.164 0 1 0 0-8.328 4.164 4.164 0 0 0 0 8.328m7.977 3.077h6.901v3.161S27.525 17.4 32.62 17.4c4.546 0 8.311 2.239 8.311 9.064v14.392H33.78V28.208c0-4.026-2.15-4.469-3.788-4.469-3.399 0-3.981 2.932-3.981 4.994v12.123h-7.26zm-4.347 0h-7.26v22.872h7.26z"
      clipRule="evenodd"
    />
  </svg>
)
const ForwardRef = forwardRef(LinkedinSquareFalse)
export default ForwardRef
